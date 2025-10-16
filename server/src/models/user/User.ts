import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    avatar?: string;
  };
  preferences: UserPreferences;
  metadata: {
    registrationIp: string;
    lastLoginAt: Date;
    loginCount: number;
  };
  did?: string;
  evmAddress?: string;
  publicKey?: string;
  privyWalletId?: string;
  smartWalletAddress?: string;
  isAgent?: boolean;
  businessId?: string;
  createdAt: Date;
  updatedAt: Date;
  wallet?: { [assetSymbol: string]: number };
}

export enum UserRole {
  USER = 'user',
  MERCHANT = 'merchant',
  ADMIN = 'admin',
  SUPPORT = 'support'
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    biometricsEnabled: boolean;
  };
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, sparse: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.USER 
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING
  },
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: Date,
    avatar: String
  },
  preferences: {
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      biometricsEnabled: { type: Boolean, default: false }
    }
  },
  metadata: {
    registrationIp: String,
    lastLoginAt: Date,
    loginCount: { type: Number, default: 0 }
  },
  did: { type: String },
  evmAddress: { type: String },
  publicKey: { type: String },
  privyWalletId: { type: String },
  smartWalletAddress: { type: String },
  isAgent: { type: Boolean, default: false },
  businessId: { type: String }
}, {
  timestamps: true
});

export const User = model<IUser>('User', userSchema);

