import type { Request, Response } from "express";
import { ethers } from "ethers";
import { PrivyClient } from "@privy-io/node";
import { connectDB } from "../config/db";

const privy = new PrivyClient({ 
  apiKey: process.env.PRIVY_API_KEY!,
  appSecret: process.env.PRIVY_APP_SECRET!
});

export async function buyStablecoin(req: Request, res: Response): Promise<void> {
  try {
    const { businessId, stablecoin, amount, businessWallet } = req.body as {
      businessId: string;
      stablecoin: string;
      amount: string; // expected in contract units!
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
    let decimals = 18; // assume 18 if API fails
    try {
      decimals = Number(await token.decimals());
    } catch (err: any) {
      res.status(400).json({
        error: `Failed to read token decimals: ${err?.message || "unknown error"}`,
      });
      return;
    }
    const tokenAmount = BigInt(amount); 

    // Agent selection
    const candidateAgents = await usersCol
      .find({ status: "active" })
      .limit(50)
      .toArray();
      
    let selectedPeer: any = null;
    for (const agent of candidateAgents) {
      try {
        const bal = await token.balanceOf(agent.address);
        if (BigInt(bal) >= tokenAmount) {
          selectedPeer = agent;
          break;
        }
      } catch {}
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
      // Use correct CAIP2 and chain_id for your network!
      const caip2 = "eip155:534351"; // Scroll Mainnet, use "eip155:534354" for Scroll Sepolia!
      const chainId = 534351; // or 534354 for testnet

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
    const randomSalt = ethers.hexlify(ethers.randomBytes(8));
    const orderId = ethers.id(`${businessId}:${Date.now()}:${randomSalt}`);
    const now = new Date();
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
  const { businessId, stablecoin, amount, businessWallet } = req.body as { businessId: string; stablecoin: string; amount: number | string; businessWallet: string };
  try {
    if (!businessId || !stablecoin || !amount || !businessWallet) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (!ethers.isAddress(stablecoin)) {
      res.status(400).json({ error: 'Invalid stablecoin address' });
      return;
    }
    const code = await provider.getCode(stablecoin);
    if (!code || code === '0x') {
      res.status(400).json({ error: 'No contract deployed at stablecoin address' });
      return;
    }
    // For selling stablecoin: the business sends tokens to a selected peer who pays fiat off-chain
    const erc20Readable = [
      "function decimals() view returns (uint8)",
      "function balanceOf(address account) view returns (uint256)"
    ];
    const token = new ethers.Contract(stablecoin, erc20Readable, provider);
    console.log(token);
    let decimals: number;
    try {
      decimals = Number(await (token as any).decimals());
      console.log(decimals);
    } catch (err: any) {
      res.status(400).json({ error: `Failed to read token decimals: ${err?.message || 'unknown error'}` });
      return;
    }
    const tokenAmount = ethers.parseUnits(String(amount), decimals);

    // Select an active agent as the buyer of tokens (no on-chain balance check needed here), prefer active agents
    const usersCol = db.collection('users');
    const selectedPeer = await usersCol.findOne({ isAgent: true, status: 'active' });
    if (!selectedPeer) {
      res.status(409).json({ error: 'No available buyer (agent) found' });
      return;
    }

    const randomSalt = ethers.hexlify(ethers.randomBytes(8));
    const orderId = ethers.id(`${businessId}:${Date.now()}:${randomSalt}:sell`);
    const now = new Date();
    const doc = {
      type: 'withdrawal', // business sells stablecoin
      status: 'matched',
      amount: Number(amount), // fiat amount expected
      token: stablecoin,
      businessId,
      peerId: selectedPeer?._id?.toString?.(),
      confirmations: { business: false, peer: true, time: undefined },
      createdAt: now,
      updatedAt: now,
      details: 'Sell stablecoin order (no escrow)',
      orderId,
      tokenAmount: tokenAmount.toString(),
      peerWallet: selectedPeer.address,
      businessWallet
    };
    const insert = await orders.insertOne(doc as any);

    // Build ERC20 transfer calldata for the business to send tokens to the peer wallet
    const erc20Iface = new ethers.Interface([
      "function transfer(address to, uint256 amount) returns (bool)"
    ]);
    const transferCalldata = erc20Iface.encodeFunctionData('transfer', [selectedPeer.address, tokenAmount]);

    res.status(201).json({
      orderId,
      orderDbId: insert.insertedId?.toString?.(),
      peer: { id: selectedPeer?._id?.toString?.(), wallet: selectedPeer.address },
      token: stablecoin,
      tokenDecimals: decimals,
      tokenAmount: tokenAmount.toString(),
      instructions: {
        from: businessWallet,
        to: stablecoin,
        function: 'transfer',
        calldata: transferCalldata
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
    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'escrowed', escrowTxHash: txHash, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    if (!updated?.value) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ order: updated.value });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
}

export async function fiatConfirm(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;
  try {
    // Escrow disabled: simply mark as fulfilled
    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'fulfilled', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json({ message: 'Fiat confirmed; order fulfilled', order: updated?.value ?? null });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
}

export async function dispute(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params as { orderId: string };
    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'disputed', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json({ message: 'Order marked disputed', order: updated?.value ?? null });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
}

export async function resolve(req: Request, res: Response): Promise<void> {
  try {
    const { orderId } = req.params as { orderId: string };
    const updated = await orders.findOneAndUpdate(
      { orderId },
      { $set: { status: 'fulfilled', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json({ message: 'Dispute resolved; order fulfilled', order: updated?.value ?? null });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
}
