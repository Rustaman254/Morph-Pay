// src/models/trading/Order.ts
import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
  _id: string;
  orderId: string; // Human-readable ID
  userId: string;
  merchantId?: string;
  type: OrderType;
  side: OrderSide;
  asset: TradeAsset;
  payment: PaymentDetails;
  amounts: OrderAmounts;
  timing: OrderTiming;
  status: OrderStatus;
  matching: MatchingDetails;
  metadata: OrderMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export interface TradeAsset {
  base: string; // Asset user wants to buy/sell (e.g., 'USDC')
  quote: string; // Asset user wants to pay/receive (e.g., 'EUR')
  network: string; // Blockchain network
  conversionRate: number;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  instructions?: PaymentInstructions;
  providerDetails?: any;
}

export enum PaymentMethodType {
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  WISE = 'wise',
  CRYPTO = 'crypto',
  MOBILE_MONEY = 'mobile_money'
}

export interface OrderAmounts {
  baseAmount: number; // Amount in base asset
  quoteAmount: number; // Amount in quote asset
  fees: {
    platform: number;
    network: number;
    merchant: number;
    total: number;
  };
  finalAmount: number; // Amount user will pay/receive after fees
}

export interface OrderTiming {
  expiresAt: Date;
  estimatedDuration: number; // in minutes
  timeToConfirm: number; // in minutes
}

export enum OrderStatus {
  CREATED = 'created',
  PENDING_MERCHANTS = 'pending_merchants',
  MERCHANT_ASSIGNED = 'merchant_assigned',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_VERIFIED = 'payment_verified',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  DISPUTED = 'disputed'
}

export interface MatchingDetails {
  criteria: MatchingCriteria;
  assignedMerchants: string[]; // Merchant IDs who were notified
  selectedMerchant?: string;
  assignmentStrategy: string; // 'performance', 'lowest_fee', 'fastest'
}

export interface OrderMetadata {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  riskScore: number;
  notes?: string;
}

const orderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  type: { type: String, enum: Object.values(OrderType), required: true },
  side: { type: String, enum: Object.values(OrderSide), required: true },
  asset: {
    base: { type: String, required: true },
    quote: { type: String, required: true },
    network: { type: String, required: true },
    conversionRate: { type: Number, required: true }
  },
  payment: {
    method: { type: String, enum: Object.values(PaymentMethodType), required: true },
    instructions: Schema.Types.Mixed,
    providerDetails: Schema.Types.Mixed
  },
  amounts: {
    baseAmount: { type: Number, required: true },
    quoteAmount: { type: Number, required: true },
    fees: {
      platform: { type: Number, default: 0 },
      network: { type: Number, default: 0 },
      merchant: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    finalAmount: { type: Number, required: true }
  },
  timing: {
    expiresAt: { type: Date, required: true },
    estimatedDuration: { type: Number, default: 30 }, // 30 minutes default
    timeToConfirm: { type: Number, default: 15 } // 15 minutes to confirm payment
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CREATED
  },
  matching: {
    criteria: {
      minRating: { type: Number, default: 4.0 },
      maxResponseTime: { type: Number, default: 5 }, // minutes
      allowedPaymentMethods: [{ type: String }]
    },
    assignedMerchants: [{ type: Schema.Types.ObjectId, ref: 'Merchant' }],
    selectedMerchant: { type: Schema.Types.ObjectId, ref: 'Merchant' },
    assignmentStrategy: { type: String, default: 'performance' }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    riskScore: { type: Number, default: 0 },
    notes: String
  }
}, {
  timestamps: true
});