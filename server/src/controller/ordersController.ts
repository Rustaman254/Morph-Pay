import type { Request, Response } from 'express';
import axios from 'axios';
import { ethers } from 'ethers';
import { connectDB } from '../config/db.js';
import { User } from '../models/user/User.js';
import { Merchant } from '../models/user/Merchants.js';
import { Order, OrderType, OrderSide, OrderStatus, PaymentMethodType } from '../models/Orders.js';

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
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

    // Find merchant user in users collection
    const merchantUser = await User.findOne({ role: "merchant", status: "active" });
    if (!merchantUser) return res.status(404).json({ error: "No active merchant found." });
    if (!merchantUser.evmAddress) return res.status(400).json({ error: "Merchant wallet address not set." });

    // Find the actual business profile for order reference
    const merchantDoc = await Merchant.findOne({ userId: merchantUser._id });
    if (!merchantDoc) return res.status(404).json({ error: "Merchant business profile not found." });

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const tokenContract = new ethers.Contract(stablecoinAddress, erc20Abi, provider);
    const rawBalance = await tokenContract.balanceOf(merchantUser.evmAddress);
    const decimals = await tokenContract.decimals();
    const balance = Number(ethers.formatUnits(rawBalance, decimals));
    if (balance < stablecoinAmount)
      return res.status(400).json({ error: "Merchant does not have enough stablecoin." });

    // Normalize payment method for storage
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

    // --- MAIN FIX: Use merchantDoc._id for merchantId ---
    const orderData = {
      orderId: `ORD-${Date.now()}`,
      userId: user._id,
      merchantId: merchantDoc._id, // <--- CORRECT VALUE
      type: OrderType.MARKET,
      side: OrderSide.BUY,
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
  await connectDB();

  const { orderId } = req.body;

  // Find order by orderId
  const order = await Order.findOne({ orderId });
  if (!order)
    return res.status(404).json({ error: "Order not found." });

  if (order.status !== "awaiting_payment" && order.status !== OrderStatus.AWAITING_PAYMENT)
    return res.status(400).json({ error: "Order not in awaiting state." });

  // Now use order.merchantId for lookup
  // Parse to string if using ObjectId
  const merchantId = typeof order.merchantId === "object" && order.merchantId.toString
    ? order.merchantId.toString()
    : order.merchantId;

  const merchant = await Merchant.findById(merchantId);
  if (!merchant)
    return res.status(404).json({ error: "Merchant not found." });

  // Asset extraction
  const assetSymbol = order.asset?.base || order.token || order.stablecoin;
  const assetIdx = merchant.capabilities.supportedAssets.findIndex(
    a => a.assetSymbol === assetSymbol
  );
  console.log("Asset Index:", assetIdx);
  if (assetIdx === -1)
    return res.status(400).json({ error: "Merchant does not support this asset." });

  const merchantAsset = merchant.capabilities.supportedAssets[assetIdx];
  const baseAmount = order.amounts?.baseAmount || order.currencyAmount;
  if (
    !merchantAsset ||
    typeof merchantAsset.maxAmount !== 'number' ||
    merchantAsset.maxAmount < baseAmount
  ) {
    return res.status(400).json({ error: "Merchant does not have enough balance." });
  }

  merchant.capabilities.supportedAssets[assetIdx].maxAmount -= baseAmount;
  await merchant.save();

  // Mark order completed
  order.status = "completed";
  await order.save();

  const user = await User.findById(order.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (typeof user.wallet !== 'object' || !user.wallet) user.wallet = {};
  user.wallet[assetSymbol] = (user.wallet[assetSymbol] || 0) + baseAmount;
  await user.save();

  res.status(200).json({
    message: "Payment confirmed, crypto released to user.",
    creditedAmount: baseAmount,
    asset: assetSymbol,
    userId: user._id,
    orderId: order.orderId
  });
};
