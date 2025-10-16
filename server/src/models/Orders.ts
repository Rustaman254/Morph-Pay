// src/models/trading/Order.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// --- ENUMS ---
export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
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

// --- INTERFACES ---
export interface TradeAsset {
  base: string;
  quote: string;
  network: string;
  conversionRate: number;
}

export interface PaymentInstructions {
  [key: string]: any; // Adjust shape as needed
}

export interface PaymentDetails {
  method: PaymentMethodType;
  instructions?: PaymentInstructions;
  providerDetails?: any;
}

export interface OrderAmounts {
  baseAmount: number;
  quoteAmount: number;
  fees: {
    platform: number;
    network: number;
    merchant: number;
    total: number;
  };
  finalAmount: number;
}

export interface OrderTiming {
  expiresAt: Date;
  estimatedDuration: number;
  timeToConfirm: number;
}

export interface MatchingCriteria {
  minRating: number;
  maxResponseTime: number;
  allowedPaymentMethods: PaymentMethodType[];
}

export interface MatchingDetails {
  criteria: MatchingCriteria;
  assignedMerchants: string[];
  selectedMerchant?: string;
  assignmentStrategy: string;
}

export interface OrderMetadata {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  riskScore: number;
  notes?: string;
}

// --- MAIN ORDER INTERFACE ---
export interface IOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId | string;
  merchantId?: mongoose.Types.ObjectId | string;
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

// --- ORDER SCHEMA ---
const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: false },
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
      instructions: { type: Schema.Types.Mixed, default: {} },
      providerDetails: { type: Schema.Types.Mixed, default: {} }
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
      estimatedDuration: { type: Number, default: 30 },
      timeToConfirm: { type: Number, default: 15 }
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED
    },
    matching: {
      criteria: {
        minRating: { type: Number, default: 4.0 },
        maxResponseTime: { type: Number, default: 5 },
        allowedPaymentMethods: [{ type: String }]
      },
      assignedMerchants: [{ type: Schema.Types.ObjectId, ref: 'Merchant' }],
      selectedMerchant: { type: Schema.Types.ObjectId, ref: 'Merchant', required: false },
      assignmentStrategy: { type: String, default: 'performance' }
    },
    metadata: {
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
      deviceId: { type: String, default: '' },
      riskScore: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

// --- MODEL EXPORT ---
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
