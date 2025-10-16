import { Schema, model, Document, Types } from 'mongoose';

/** ENUMS **/
export enum AssetType {
  STABLECOIN = 'stablecoin',
  CRYPTO = 'crypto',
  FIAT = 'fiat'
}

export enum MerchantService {
  BUY = 'buy',
  SELL = 'sell',
  SWAP = 'swap',
  LEND = 'lend'
}

export enum MerchantStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked'
}

export enum PaymentMethodType {
  BANK = 'bank',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

/** INTERFACES **/
export interface SupportedAsset {
  assetType: AssetType;
  assetSymbol: string;
  networks: string[];
  minAmount: number;
  maxAmount: number;
  spread: number;
}

export interface PaymentMethod {
  type: PaymentMethodType;
  details: any;
}

export interface OperatingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open: string; // HH:mm
  close: string; // HH:mm
}

export interface MerchantCapabilities {
  supportedAssets: SupportedAsset[];
  paymentMethods: PaymentMethod[];
  services: MerchantService[];
  operatingHours?: {
    timezone: string;
    hours: OperatingHours[];
  };
}

export interface MerchantLimits {
  daily: {
    totalAmount: number;
    transactionCount: number;
    usedAmount: number;
    usedCount: number;
  };
  monthly: {
    totalAmount: number;
    transactionCount: number;
    usedAmount: number;
    usedCount: number;
  };
  perTransaction: {
    min: number;
    max: number;
  };
}

export interface MerchantPerformance {
  rating: number;
  completedTrades: number;
  successRate: number;
  averageResponseTime: number; // in minutes
  disputeRate: number;
}

export interface MerchantVerificationDocument {
  type: string; // e.g., 'id_front', 'id_back', 'proof_of_address', 'business_license'
  url: string;
  uploadedAt: Date;
}

export interface MerchantVerification {
  status: 'pending' | 'verified' | 'rejected';
  submittedAt?: Date;
  verifiedAt?: Date;
  documents: MerchantVerificationDocument[];
}

export interface IMerchant extends Document {
  userId: Types.ObjectId;
  business: {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    registrationNumber?: string;
  };
  capabilities: MerchantCapabilities;
  limits: MerchantLimits;
  performance: MerchantPerformance;
  status: MerchantStatus;
  verification: MerchantVerification;
  createdAt: Date;
  updatedAt: Date;
}

/** SCHEMA **/
const merchantSchema = new Schema<IMerchant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  business: {
    name: { type: String, required: true },
    description: String,
    website: String,
    logo: String,
    registrationNumber: String
  },
  capabilities: {
    supportedAssets: [{
      assetType: { type: String, enum: Object.values(AssetType), required: true },
      assetSymbol: { type: String, required: true },
      networks: [{ type: String }],
      minAmount: { type: Number, required: true },
      maxAmount: { type: Number, required: true },
      spread: { type: Number, required: true }
    }],
    paymentMethods: [{
      type: { type: String, enum: Object.values(PaymentMethodType), required: true },
      details: Schema.Types.Mixed
    }],
    services: [{ type: String, enum: Object.values(MerchantService) }],
    operatingHours: {
      timezone: { type: String, default: 'UTC' },
      hours: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        open: String,
        close: String
      }]
    }
  },
  limits: {
    daily: {
      totalAmount: { type: Number, default: 100000 },
      transactionCount: { type: Number, default: 100 },
      usedAmount: { type: Number, default: 0 },
      usedCount: { type: Number, default: 0 }
    },
    monthly: {
      totalAmount: { type: Number, default: 1000000 },
      transactionCount: { type: Number, default: 1000 },
      usedAmount: { type: Number, default: 0 },
      usedCount: { type: Number, default: 0 }
    },
    perTransaction: {
      min: { type: Number, default: 10 },
      max: { type: Number, default: 50000 }
    }
  },
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    completedTrades: { type: Number, default: 0 },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    averageResponseTime: { type: Number, default: 0 },
    disputeRate: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: Object.values(MerchantStatus),
    default: MerchantStatus.DRAFT
  },
  verification: {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    submittedAt: Date,
    verifiedAt: Date,
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date
    }]
  }
}, {
  timestamps: true
});

export const Merchant = model<IMerchant>('Merchant', merchantSchema);
