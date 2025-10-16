// src/models/trading/Escrow.ts
import { Schema, model, Document } from 'mongoose';

export interface IEscrow extends Document {
  _id: string;
  orderId: string;
  type: EscrowType;
  status: EscrowStatus;
  assets: EscrowAssets;
  participants: {
    userId: string;
    merchantId: string;
    platform: string;
  };
  transactions: {
    lockTx?: string; // Blockchain TX hash for locking
    releaseTx?: string; // Blockchain TX hash for release
    refundTx?: string; // Blockchain TX hash for refund
  };
  timing: {
    lockedAt?: Date;
    releasedAt?: Date;
    refundedAt?: Date;
    expiresAt: Date;
  };
  conditions: EscrowConditions;
  createdAt: Date;
  updatedAt: Date;
}

export enum EscrowType {
  SMART_CONTRACT = 'smart_contract',
  CUSTODIAL = 'custodial',
  HYBRID = 'hybrid'
}

export enum EscrowStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  LOCKED = 'locked',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  EXPIRED = 'expired'
}

export interface EscrowAssets {
  asset: string;
  amount: number;
  network: string;
  walletAddress: string; // Escrow wallet address
  tokenAddress?: string; // For ERC-20 tokens
}

export interface EscrowConditions {
  releaseConditions: ReleaseCondition[];
  refundConditions: RefundCondition[];
  disputePeriod: number; // hours
  autoReleaseAfter: number; // hours
}

const escrowSchema = new Schema<IEscrow>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  type: { 
    type: String, 
    enum: Object.values(EscrowType),
    default: EscrowType.CUSTODIAL
  },
  status: {
    type: String,
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.CREATED
  },
  assets: {
    asset: { type: String, required: true },
    amount: { type: Number, required: true },
    network: { type: String, required: true },
    walletAddress: { type: String, required: true },
    tokenAddress: String
  },
  participants: {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
    platform: { type: String, required: true } // Platform wallet address
  },
  transactions: {
    lockTx: String,
    releaseTx: String,
    refundTx: String
  },
  timing: {
    lockedAt: Date,
    releasedAt: Date,
    refundedAt: Date,
    expiresAt: { type: Date, required: true }
  },
  conditions: {
    releaseConditions: [{
      type: { type: String, required: true }, // 'payment_confirmation', 'time_elapsed', 'manual_approval'
      value: Schema.Types.Mixed
    }],
    refundConditions: [{
      type: { type: String, required: true }, // 'timeout', 'user_cancellation', 'merchant_default'
      value: Schema.Types.Mixed
    }],
    disputePeriod: { type: Number, default: 24 }, // 24 hours
    autoReleaseAfter: { type: Number, default: 168 } // 7 days
  }
}, {
  timestamps: true
});