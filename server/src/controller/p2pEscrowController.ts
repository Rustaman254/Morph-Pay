import type { Request, Response } from "express";
import { ethers } from "ethers";
import { PrivyClient } from "@privy-io/node";
import { ObjectId } from "mongodb";
import axios from "axios";
import { connectDB } from "../config/db.js";
import { getMpesaTimestamp, getMpesaPassword } from "../utils/mpesaUtils.js";
import type { RequestExtended } from "../middleware/mpesaAuth.js";
import { getUsdcToKesRate } from "../utils/getTokenRate.js";

const privy = new PrivyClient({
  appId: process.env.PRIVY_API_KEY!,
  appSecret: process.env.PRIVY_APP_SECRET!
});

function customRound(amount: number): number {
  const [integer, decimalPart = ""] = amount.toString().split(".");
  const firstDecimalDigit = parseInt(decimalPart.charAt(0) || "0", 10);

  if (firstDecimalDigit > 5) {
    return Math.ceil(amount);
  } else {
    return Number(amount.toFixed(2));
  }
}

export async function acceptOrderAndStkPush(req: RequestExtended, res: Response): Promise<void> {
  const { orderId } = req.params;
  const { peerId } = req.body;

  const db = await connectDB();
  const orders = db.collection("orders");
  const usersCol = db.collection("users");

  // Validate order & peer
  const order = await orders.findOne({ orderId });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (!peerId || !ObjectId.isValid(peerId)) {
    res.status(400).json({ error: "Invalid or missing peerId" });
    return;
  }
  const peer = await usersCol.findOne({ _id: new ObjectId(peerId) });
  if (!peer || !peer.contact) {
    res.status(404).json({ error: "Peer or M-Pesa phone missing" });
    return;
  }

  const usdcTokenRate = await getUsdcToKesRate("KES", "USDC");
  const orderAmountInUSDC = order.amount / 1e6;
  const value = orderAmountInUSDC * usdcTokenRate;

  const amount = customRound(value);
  console.log(typeof peer.contact)
  console.log(amount)

  // Update order status
  await orders.updateOne(
    { orderId },
    { $set: { status: "peer_accepted", peerId: new ObjectId(peerId) } }
  );

  const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE!;
  const passkey = process.env.MPESA_PASS_KEY!;
  const timestamp = getMpesaTimestamp();
  const password = getMpesaPassword(shortCode, passkey, timestamp);
  const token = req.token;
  if (!token) {
    res.status(500).json({ error: "Missing Safaricom OAuth token" });
    return;
  }
  if(peer.status == 'active') {
    const stkRequest = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Number(order.amount),
      PartyA: peer.contact,
      PartyB: shortCode,
      PhoneNumber: peer.contact,
      CallBackURL: `${process.env.SERVER_URL}/mpesa/callback`, 
      AccountReference: order.orderId?.slice(0, 12),
      TransactionDesc: "Stablecoin Sale",
    };
    try {
      const stkRes = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        stkRequest,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      await orders.updateOne(
        { orderId },
        { $set: { checkoutRequestID: stkRes.data.CheckoutRequestID } }
      );
  
      res.status(200).json({
        message: "STK push sent to peer",
        stkRes: stkRes.data,
      });
    } catch (err: any) {
      res.status(500).json({
        error: "STK push failed",
        details: err.response?.data || err.message,
      });
    }
  } else {
    res.status(400).json({ error: "Peer is not active" });
  }

}

export async function mpesaCallbackHandler(req: Request, res: Response): Promise<void> {
  console.log("MPESA Callback received:", JSON.stringify(req.body, null, 2));

  const callbackData = req.body;
  const stkCallback = callbackData?.Body?.stkCallback;
  const resultCode = stkCallback?.ResultCode;
  const resultDesc = stkCallback?.ResultDesc;
  const checkoutRequestID = stkCallback?.CheckoutRequestID;

  let amount, mpesaReceipt;
  if (stkCallback?.CallbackMetadata?.Item) {
    for (const entry of stkCallback.CallbackMetadata.Item) {
      if (entry.Name === "Amount") amount = entry.Value;
      if (entry.Name === "MpesaReceiptNumber") mpesaReceipt = entry.Value;
    }
  }

  const db = await connectDB();
  const orders = db.collection("orders");

  const updateResult = await orders.findOneAndUpdate(
    { checkoutRequestID }, // Must match the one saved above!
    {
      $set: {
        paymentStatus: resultCode === 0 ? "completed" : "failed",
        mpesaReceipt,
        mpesaResultDesc: resultDesc,
        mpesaResultCode: resultCode,
        mpesaAmount: amount,
        mpesaCallbackReceivedAt: new Date(),
      },
    }
  );

  if (!updateResult?.value) {
    console.warn(`Order not found for checkoutRequestID: ${checkoutRequestID}`);
  }

  // Always send 200 OK to stop Safaricom from retrying
  res.status(200).json({ message: "Callback received" });
}


export async function buyStablecoin(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, stablecoin, amount, businessWallet } = req.body as {
      businessId: string;
      stablecoin: string;
      amount: string;
      businessWallet: string;
    };

    if (!businessId || !stablecoin || !amount || !businessWallet) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (!ethers.isAddress(stablecoin)) {
      res.status(400).json({ error: "Invalid stablecoin address" });
      return;
    }

    const db = await connectDB();
    const orders = db.collection("orders");
    const usersCol = db.collection("users");

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
    const code = await provider.getCode(stablecoin);
    if (!code || code === "0x") {
      res.status(400).json({ error: "No contract deployed at stablecoin address" });
      return;
    }

    const erc20Readable = [
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)",
    ];
    const token = new ethers.Contract(stablecoin, erc20Readable, provider);
    let decimals = 18;
    try {
      decimals = Number(await token.decimals?.());
    } catch (err: any) {
      res.status(400).json({
        error: `Failed to read token decimals: ${err?.message || "unknown error"}`,
      });
      return;
    }
    const tokenAmount = BigInt(amount);

    console.log(amount, tokenAmount, decimals);

    const candidateAgents = await usersCol
      .find({ status: "active" })
      .limit(50)
      .toArray();

    let selectedPeer: any = null;
    for (const agent of candidateAgents) {
      try {
        const bal = await token.balanceOf?.(agent.address);
        console.log("Agent balance:", bal?.toString?.());
        if (BigInt(bal) >= tokenAmount) {
          selectedPeer = agent;
          break;
        }
      } catch { }
    }
    if (!selectedPeer || !selectedPeer.privyWalletId) {
      res.status(409).json({ error: "No available liquidity provider with sufficient balance" });
      return;
    }

    // ERC20 transfer call encoding
    const erc20Abi = ["function transfer(address to, uint256 amount) returns (bool)"];
    const iface = new ethers.Interface(erc20Abi);
    const data = iface.encodeFunctionData("transfer", [
      businessWallet,
      tokenAmount.toString(),
    ]);
    let txHash: string;
    try {
      const caip2 = "eip155:534351";
      const chainId = 534351;

      const privyTx = await privy.wallets().ethereum().sendTransaction(
        selectedPeer.privyWalletId,
        {
          caip2,
          params: {
            transaction: {
              to: stablecoin,
              value: "0x0",
              data: data,
              chain_id: chainId,
            },
          },
        }
      );
      txHash = privyTx.hash;
    } catch (e: any) {
      res.status(500).json({ error: `Token transfer failed: ${e?.message || "unknown error"}` });
      return;
    }

    // Write order

    const now = new Date();
    const randomNum = Math.floor(Math.random() * 1000000);
    const orderId = `odr-${Date.now()}${ethers.hexlify(ethers.randomBytes(4)).slice(2)}`;
    const doc = {
      type: "deposit",
      status: "matched",
      amount: tokenAmount.toString(),
      token: stablecoin,
      businessId,
      peerId: selectedPeer?._id?.toString?.(),
      confirmations: { business: false, peer: true, time: undefined },
      createdAt: now,
      updatedAt: now,
      details: "Buy stablecoin order (on-chain transfer)",
      orderId,
      tokenAmount: tokenAmount.toString(),
      peerWallet: selectedPeer.address,
      businessWallet,
      txHash,
    };
    const insert = await orders.insertOne(doc as any);

    res.status(201).json({
      orderId,
      orderDbId: insert.insertedId?.toString?.(),
      peer: { id: selectedPeer?._id?.toString?.(), wallet: selectedPeer.address },
      token: stablecoin,
      tokenDecimals: decimals,
      tokenAmount: tokenAmount.toString(),
      txHash,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}


export async function sellStablecoin(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, stablecoin, amount, businessWallet } = req.body as {
      businessId: string;
      stablecoin: string;
      amount: number | string;
      businessWallet: string;
    };

    if (!businessId || !stablecoin || !amount || !businessWallet) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (!ethers.isAddress(stablecoin)) {
      res.status(400).json({ error: "Invalid stablecoin address" });
      return;
    }

    const db = await connectDB();
    const orders = db.collection("orders");
    const usersCol = db.collection("users");

    // Configure provider (as in buyStablecoin)
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);

    const code = await provider.getCode(stablecoin);
    if (!code || code === "0x") {
      res.status(400).json({ error: "No contract deployed at stablecoin address" });
      return;
    }

    const erc20Readable = [
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)"
    ];
    const token = new ethers.Contract(stablecoin, erc20Readable, provider);

    let decimals: number;
    try {
      decimals = Number(await token.decimals?.());
    } catch (err: any) {
      res.status(400).json({
        error: `Failed to read token decimals: ${err?.message || "unknown error"}`,
      });
      return;
    }

    // Convert user amount (human decimals) to contract units
    const tokenAmount = ethers.parseUnits(String(amount), decimals);

    // Select an agent (buyer) who has privyWalletId (as in buyStablecoin)
    const selectedPeer = await usersCol.findOne({
      isAgent: true,
      status: "active",
      privyWalletId: { $exists: true, $ne: null }
    });
    if (!selectedPeer) {
      res.status(409).json({ error: "No available buyer (agent) found" });
      return;
    }

    const now = new Date();
    const randomNum = Math.floor(Math.random() * 1000000);
    const orderId = `odr-${Date.now()}${ethers.hexlify(ethers.randomBytes(4)).slice(2)}`;
    const doc = {
      type: "withdrawal",
      status: "matched",
      amount: Number(amount),
      token: stablecoin,
      businessId,
      peerId: selectedPeer?._id?.toString?.(),
      confirmations: { business: false, peer: true, time: undefined },
      createdAt: now,
      updatedAt: now,
      details: "Sell stablecoin order (off-chain settlement, peer payout)",
      orderId,
      tokenAmount: tokenAmount.toString(), 
      peerWallet: selectedPeer.address,
      peerPrivyWalletId: selectedPeer.privyWalletId,
      businessWallet
    };
    const insert = await orders.insertOne(doc as any);

    const erc20Iface = new ethers.Interface([
      "function transfer(address to, uint256 amount) returns (bool)"
    ]);
    const transferCalldata = erc20Iface.encodeFunctionData('transfer', [
      selectedPeer.address,
      tokenAmount.toString(),
    ]);

    res.status(201).json({
      orderId,
      orderDbId: insert.insertedId?.toString?.(),
      peer: { id: selectedPeer?._id?.toString?.(), wallet: selectedPeer.address, privyWalletId: selectedPeer.privyWalletId },
      token: stablecoin,
      tokenDecimals: decimals,
      tokenAmount: tokenAmount.toString(),
      instructions: {
        from: businessWallet,
        to: stablecoin,
        function: "transfer",
        calldata: transferCalldata,
        value: "0x0"
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function depositConfirm(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    const { txHash } = req.body as { txHash?: string };
    if (!txHash) {
      res.status(400).json({ error: 'txHash required' });
      return;
    }

    const db = await connectDB();
    const orders = db.collection('orders');

    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'fulfilled', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({
      message: 'Deposit confirmed. Order fulfilled.',
      order: updated
    });

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// To the businesses
export async function fiatConfirm(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    if (!orderId) {
      res.status(400).json({ error: 'Missing orderId' });
      return;
    }

    const db = await connectDB();
    const orders = db.collection('orders');

    // Mark order as "fulfilled" to confirm fiat payout
    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'fulfilled', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({
      message: 'Fiat confirmed; order fulfilled',
      order: updated.value
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function dispute(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    if (!orderId) {
      res.status(400).json({ error: 'Missing orderId' });
      return;
    }
    const db = await connectDB();
    const orders = db.collection('orders');

    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'disputed', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ message: 'Order marked disputed', order: updated.value });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function resolve(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    if (!orderId) {
      res.status(400).json({ error: 'Missing orderId' });
      return;
    }
    const db = await connectDB();
    const orders = db.collection('orders');

    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'fulfilled', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ message: 'Dispute resolved; order fulfilled', order: updated.value });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
