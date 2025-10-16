import type { Request, Response } from 'express';
import axios from 'axios';
import { ethers } from 'ethers';
import { PrivyClient } from '@privy-io/node';

import { connectDB } from '../config/db.js';
import { User } from '../models/user/User.js';
import { Merchant } from '../models/user/Merchants.js';
import { Order, OrderType, OrderSide, OrderStatus, PaymentMethodType } from '../models/Orders.js';
import { getSponsoredSmartWalletClient } from '../utils/paymasterUtils.js';

const privy = new PrivyClient({
  appId: process.env.PRIVY_APP_ID!,
  appSecret: process.env.PRIVY_APP_SECRET!
});

const erc20Abi = [
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];


const paymentMethodMap: Record<string, PaymentMethodType> = {
  "bank": PaymentMethodType.BANK_TRANSFER,
  "bank_transfer": PaymentMethodType.BANK_TRANSFER,
  "credit_card": PaymentMethodType.CREDIT_CARD,
  "debit_card": PaymentMethodType.DEBIT_CARD,
  "paypal": PaymentMethodType.PAYPAL,
  "wise": PaymentMethodType.WISE,
  "crypto": PaymentMethodType.CRYPTO,
  "mobile_money": PaymentMethodType.MOBILE_MONEY,
  "mpesa": PaymentMethodType.MOBILE_MONEY
};

const isMpesa = (method: string) =>
  method?.toLowerCase() === "mpesa" || method?.toLowerCase() === "mobile_money";

export const createBuyStablecoinOrder = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const {
      userId,
      fiatAmount,
      fiatCurrency,
      stablecoinSymbol,
      stablecoinAddress,
      paymentMethod
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    let symbolToUse = stablecoinSymbol;
    if (
      stablecoinSymbol === "USDM" ||
      stablecoinAddress?.toLowerCase() === "0x2dd99a1caa082d31fad620d1178e92699826dc01"
    ) {
      symbolToUse = "USDC";
    }

    const rateRes = await axios.get(
      `https://api.coinbase.com/v2/exchange-rates?currency=${symbolToUse}`
    );
    const rates = rateRes.data.data.rates;
    const fiatRate = rates[fiatCurrency.toUpperCase()];
    const conversionRate = fiatRate ? parseFloat(fiatRate) : undefined;
    if (!conversionRate)
      return res.status(400).json({ error: "Exchange rate not found." });

    const stablecoinAmount = fiatAmount / conversionRate;

    const merchantUser = await User.findOne({ role: "merchant", status: "active" });
    if (!merchantUser) return res.status(404).json({ error: "No active merchant found." });
    if (!merchantUser.evmAddress) return res.status(400).json({ error: "Merchant wallet address not set." });

    const merchantDoc = await Merchant.findOne({ userId: merchantUser._id });
    if (!merchantDoc) return res.status(404).json({ error: "Merchant business profile not found." });

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const tokenContract = new ethers.Contract(stablecoinAddress, erc20Abi, provider);
    const rawBalance = await tokenContract.balanceOf(merchantUser.evmAddress);
    const decimals = await tokenContract.decimals();
    const balance = Number(ethers.formatUnits(rawBalance, decimals));
    if (balance < stablecoinAmount)
      return res.status(400).json({ error: "Merchant does not have enough stablecoin." });

    const normalizedPaymentMethod: PaymentMethodType =
      paymentMethodMap[paymentMethod] || PaymentMethodType.BANK_TRANSFER;

    let paymentInstructions: any = {};
    let paymentTypeForResponse = normalizedPaymentMethod;

    if (isMpesa(paymentMethod)) {
      paymentInstructions = {
        type: "mpesa",
        phone: merchantUser.phone
      };
      paymentTypeForResponse = "mpesa";
    } else {
      const pm = merchantDoc.capabilities.paymentMethods.find(
        p => p.type === paymentMethod || p.type === normalizedPaymentMethod
      );
      paymentInstructions = pm ? pm.details : { evmAddress: merchantUser.evmAddress };
    }

    const supportedAsset = merchantDoc.capabilities.supportedAssets.find(
      a => a.assetSymbol === stablecoinSymbol
    );
    const network = supportedAsset?.networks[0] || "ethereum";

    const orderData = {
      orderId: `ORD-${Date.now()}`,
      userId: user._id,
      merchantId: merchantDoc._id,
      merchantAddress: merchantUser.evmAddress || "Merchant wallet missing",
      stablecoinAddress: stablecoinAddress || "Stable coinasset missing",
      type: OrderType.MARKET,
      side: OrderSide.BUY,
      asset: {
        base: stablecoinSymbol,
        stablecoinAddress: stablecoinAddress || "Stable coinasset missing",
        quote: fiatCurrency,
        network,
        conversionRate
      },
      payment: {
        method: normalizedPaymentMethod,
        instructions: paymentInstructions
      },
      amounts: {
        baseAmount: stablecoinAmount,
        quoteAmount: fiatAmount,
        fees: { platform: 0, network: 0, merchant: 0, total: 0 },
        finalAmount: stablecoinAmount
      },
      timing: {
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        estimatedDuration: 30,
        timeToConfirm: 15
      },
      status: OrderStatus.AWAITING_PAYMENT,
      matching: {
        criteria: {
          minRating: 4.0,
          maxResponseTime: 5,
          allowedPaymentMethods: [normalizedPaymentMethod]
        },
        assignedMerchants: [merchantDoc._id],
        selectedMerchant: merchantDoc._id,
        assignmentStrategy: 'performance'
      },
      metadata: {}
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      orderId: order.orderId,
      userName: merchantUser.profile.firstName + " " + merchantUser.profile.lastName,
      paymentType: paymentTypeForResponse,
      paymentDetails: paymentInstructions,
      merchantAddress: merchantUser.evmAddress,
      stablecoinAddress: stablecoinAddress,
      peer: {
        merchantId: merchantDoc._id,
        business: merchantDoc.business,
        operatingHours: merchantDoc.capabilities.operatingHours
      },
      payment: {
        currency: fiatCurrency,
        amountToPay: fiatAmount
      },
      receive: {
        asset: stablecoinSymbol,
        amount: stablecoinAmount
      },
      exchangeRate: conversionRate
    });
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      detail: err instanceof Error ? err.message : err
    });
  }
};

export const confirmFiatAndReleaseCrypto = async (req: Request, res: Response) => {
  try {
    console.log("[Controller] Starting confirmFiatAndReleaseCrypto");
    await connectDB();
    const { orderId } = req.body;
    console.log(`[Controller] Order ID: ${orderId}`);

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.status !== "awaiting_payment" && order.status !== OrderStatus.AWAITING_PAYMENT)
      return res.status(400).json({ error: "Order not in awaiting state." });

    const merchant = await Merchant.findById(order.merchantId);
    if (!merchant) return res.status(404).json({ error: "Merchant not found." });

    const merchantUser = await User.findById(merchant.userId);
    if (!merchantUser) return res.status(404).json({ error: "Merchant user not linked to merchant profile." });

    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!user.evmAddress) return res.status(400).json({ error: "User wallet address not found." });

    const senderSmartWallet = merchantUser.smartWalletAddress;
    const privyWalletId = merchantUser.privyWalletId;
    const stablecoinAddress = order.asset?.stablecoinAddress || order.stablecoinAddress;
    
    if (!stablecoinAddress)
      return res.status(400).json({ error: "Stablecoin contract address not found in order." });
    if (!senderSmartWallet)
      return res.status(400).json({ error: "Merchant smart wallet address not found in user doc." });
    if (!privyWalletId)
      return res.status(400).json({ error: "Merchant privyWalletId not found in user doc." });

    console.log(`[Controller] Getting smart account client...`);
    const { smartAccountClient, publicClient } = await getSponsoredSmartWalletClient({
      privy,
      privyWalletId,
      evmAddress: senderSmartWallet
    });

    console.log(`[Controller] Reading token decimals...`);
    const decimals = await publicClient.readContract({
      address: stablecoinAddress,
      abi: erc20Abi,
      functionName: "decimals"
    }) as number;

    const baseAmount = order.amounts?.baseAmount ?? order.currencyAmount;
    const baseAmountRounded = Number(baseAmount).toFixed(decimals);
    const sendAmountBN = ethers.parseUnits(baseAmountRounded, decimals);

    console.log(`[Controller] Encoding transfer data...`);
    const tokenInterface = new ethers.Interface(erc20Abi);
    const txData = tokenInterface.encodeFunctionData("transfer", [user.evmAddress, sendAmountBN]);

    console.log(`[Controller] Sending transaction via smart account...`);
    const userOpResponse = await smartAccountClient.sendUserOperation({
      to: stablecoinAddress,
      data: txData
    });
    console.log(`[Controller] Transaction sent: ${userOpResponse.hash}`);

    console.log(`[Controller] Waiting for receipt...`);
    const receipt = await smartAccountClient.waitForUserOperationReceipt({
      hash: userOpResponse.hash
    });
    
    console.log(`[Controller] Receipt received: ${receipt?.transactionHash}`);
    if (!receipt || !receipt.transactionHash) {
      console.error(`[Controller] No transaction hash in receipt`);
      return res.status(500).json({ error: "Gasless on-chain transfer failed." });
    }

    console.log(`[Controller] Updating merchant balance...`);
    const assetSymbol = order.asset?.base || order.token || order.stablecoin;
    const assetIdx = merchant.capabilities.supportedAssets.findIndex(
      a => a.assetSymbol === assetSymbol
    );
    if (assetIdx !== -1) {
      merchant.capabilities.supportedAssets[assetIdx].maxAmount -= Number(baseAmount);
      await merchant.save();
    }

    console.log(`[Controller] Updating order status...`);
    order.status = OrderStatus.COMPLETED;
    order.metadata = {
      ...order.metadata,
      onchainTxHash: receipt.transactionHash,
      stablecoinAddress,
      merchantAddress: senderSmartWallet
    };
    await order.save();

    console.log(`[Controller] Crediting user wallet...`);
    if (typeof user.wallet !== 'object' || !user.wallet) user.wallet = {};
    user.wallet[assetSymbol] = (user.wallet[assetSymbol] || 0) + Number(baseAmount);
    await user.save();

    console.log(`[Controller] Sending success response...`);
    return res.status(200).json({
      message: "Payment confirmed, crypto released to user (gas sponsored).",
      creditedAmount: baseAmount,
      asset: assetSymbol,
      userWallet: user.evmAddress,
      merchantWallet: senderSmartWallet,
      stablecoinAddress,
      orderId: order.orderId,
      onchainTxHash: receipt.transactionHash
    });

  } catch (err) {
    console.error(`[Controller] Error:`, err);
    res.status(500).json({
      error: 'Internal server error',
      detail: err instanceof Error ? err.message : String(err)
    });
  }
};

export const createSellStablecoinOrder = async (req: Request, res: Response) => {
  try {
    await connectDB();
    const {
      userId,
      stablecoinSymbol,
      stablecoinAddress,
      baseAmount,
      fiatCurrency,
      paymentMethod
    } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Find active merchant
    const merchantUser = await User.findOne({ role: "merchant", status: "active" });
    if (!merchantUser) return res.status(404).json({ error: "No active merchant found." });

    const merchantDoc = await Merchant.findOne({ userId: merchantUser._id });
    if (!merchantDoc) return res.status(404).json({ error: "Merchant business profile not found." });

    // Payment method normalization
    const normalizedPaymentMethod: PaymentMethodType =
      paymentMethodMap[paymentMethod] || PaymentMethodType.BANK_TRANSFER;

    let paymentInstructions: any = {};
    let paymentTypeForResponse = normalizedPaymentMethod;

    if (isMpesa(paymentMethod)) {
      paymentInstructions = {
        type: "mpesa",
        phone: user.phone // Merchant should send fiat to user's phone!
      };
      paymentTypeForResponse = "mpesa";
    } else {
      const pm = user?.preferences?.paymentMethods?.find?.(
        (p: any) => p.type === paymentMethod || p.type === normalizedPaymentMethod
      );
      paymentInstructions = pm ? pm.details : { phone: user.phone };
    }

    // Get real-time price from Coinbase
    let symbolToUse = stablecoinSymbol;
    if (
      stablecoinSymbol === "USDM" ||
      stablecoinAddress?.toLowerCase() === "0x2dd99a1caa082d31fad620d1178e92699826dc01"
    ) {
      symbolToUse = "USDC";
    }
    const rateRes = await axios.get(
      `https://api.coinbase.com/v2/exchange-rates?currency=${symbolToUse}`
    );
    const rates = rateRes.data.data.rates;
    const fiatRate = rates[fiatCurrency.toUpperCase()];
    const conversionRate = fiatRate ? parseFloat(fiatRate) : undefined;
    if (!conversionRate) return res.status(400).json({ error: "Exchange rate not found." });

    const fiatAmount = baseAmount * conversionRate;

    const supportedAsset = merchantDoc.capabilities.supportedAssets.find(
      a => a.assetSymbol === stablecoinSymbol
    );
    const network = supportedAsset?.networks[0] || "ethereum";

    // Create the order
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      userId: user._id,
      merchantId: merchantDoc._id,
      type: OrderType.MARKET,
      side: OrderSide.SELL,
      asset: {
        base: stablecoinSymbol,
        quote: fiatCurrency,
        network,
        conversionRate
      },
      payment: {
        method: normalizedPaymentMethod,
        instructions: paymentInstructions
      },
      amounts: {
        baseAmount: baseAmount,
        quoteAmount: fiatAmount,
        fees: { platform: 0, network: 0, merchant: 0, total: 0 },
        finalAmount: baseAmount
      },
      timing: {
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        estimatedDuration: 30,
        timeToConfirm: 15
      },
      status: OrderStatus.AWAITING_PAYMENT,
      matching: {
        criteria: {
          minRating: 4.0,
          maxResponseTime: 5,
          allowedPaymentMethods: [normalizedPaymentMethod]
        },
        assignedMerchants: [merchantDoc._id],
        selectedMerchant: merchantDoc._id,
        assignmentStrategy: 'performance'
      },
      metadata: {}
    };

    const order = await Order.create(orderData);

    res.status(201).json({
      orderId: order.orderId,
      userName: user.profile.firstName + " " + user.profile.lastName,
      paymentType: paymentTypeForResponse,
      paymentDetails: paymentInstructions,
      peer: {
        merchantId: merchantDoc._id,
        business: merchantDoc.business,
        operatingHours: merchantDoc.capabilities.operatingHours
      },
      payment: {
        currency: fiatCurrency,
        amountToReceive: fiatAmount
      },
      send: {
        asset: stablecoinSymbol,
        amount: baseAmount
      },
      exchangeRate: conversionRate
    });
  } catch (err) {
    res.status(500).json({
      error: 'Internal server error',
      detail: err instanceof Error ? err.message : err
    });
  }
};

export const confirmFiatReceivedAndReleaseStablecoin = async (req: Request, res: Response) => {
  await connectDB();
  const { orderId } = req.body;

  const order = await Order.findOne({ orderId });
  if (!order)
    return res.status(404).json({ error: "Order not found." });

  if (order.status !== "awaiting_payment" && order.status !== OrderStatus.AWAITING_PAYMENT)
    return res.status(400).json({ error: "Order not in awaiting state." });

  const merchant = await Merchant.findById(order.merchantId);
  if (!merchant)
    return res.status(404).json({ error: "Merchant not found." });

  const assetSymbol = order.asset?.base || order.token || order.stablecoin;
  const assetIdx = merchant.capabilities.supportedAssets.findIndex(
    a => a.assetSymbol === assetSymbol
  );
  console.log("Asset Index:", assetIdx);
  if (assetIdx === -1)
    return res.status(400).json({ error: "Merchant does not support this asset." });

  const baseAmount = order.amounts?.baseAmount || order.currencyAmount;

  // Credit merchant asset
  merchant.capabilities.supportedAssets[assetIdx].maxAmount += baseAmount;
  await merchant.save();

  // Mark order as completed
  order.status = "completed";
  await order.save();

  // Debit user wallet (seller of stablecoin)
  const user = await User.findById(order.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (typeof user.wallet !== 'object' || !user.wallet) user.wallet = {};
  user.wallet[assetSymbol] = (user.wallet[assetSymbol] || 0) - baseAmount;
  if (user.wallet[assetSymbol] < 0) user.wallet[assetSymbol] = 0; // Don't allow negative balance
  await user.save();

  res.status(200).json({
    message: "Fiat confirmed, stablecoin released to merchant.",
    releasedAmount: baseAmount,
    asset: assetSymbol,
    merchantId: merchant._id,
    userId: user._id,
    orderId: order.orderId
  });
};
