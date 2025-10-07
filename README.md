# P2P Stablecoin Exchange Platform - Comprehensive Documentation

## 🎯 Project Overview

A sophisticated P2P stablecoin exchange platform with Uber-like merchant matching, supporting multiple cryptocurrencies, fiat on/off ramps, and comprehensive escrow management.

## 📁 Complete Project Structure

```
p2p-stablecoin-api/
├── 📁 src/
│   ├── 📁 config/
│   │   ├── database.ts
│   │   ├── blockchain.ts
│   │   ├── payment-providers.ts
│   │   └── environment.ts
│   ├── 📁 models/
│   │   ├── user/
│   │   │   ├── User.ts
│   │   │   ├── Merchant.ts
│   │   │   ├── Wallet.ts
│   │   │   └── KYC.ts
│   │   ├── trading/
│   │   │   ├── Order.ts
│   │   │   ├── Trade.ts
│   │   │   ├── Escrow.ts
│   │   │   └── Dispute.ts
│   │   ├── payment/
│   │   │   ├── Transaction.ts
│   │   │   ├── PaymentMethod.ts
│   │   │   ├── CryptoPayment.ts
│   │   │   └── FiatPayment.ts
│   │   └── liquidity/
│   │       ├── LiquidityPool.ts
│   │       ├── MerchantPool.ts
│   │       └── PriceFeed.ts
│   ├── 📁 types/
│   │   ├── user.types.ts
│   │   ├── trading.types.ts
│   │   ├── payment.types.ts
│   │   ├── blockchain.types.ts
│   │   └── api.types.ts
│   ├── 📁 services/
│   │   ├── 📁 trading/
│   │   │   ├── OrderService.ts
│   │   │   ├── MatchingService.ts
│   │   │   ├── EscrowService.ts
│   │   │   └── DisputeService.ts
│   │   ├── 📁 payment/
│   │   │   ├── CryptoService.ts
│   │   │   ├── FiatService.ts
│   │   │   ├── TransactionService.ts
│   │   │   └── SettlementService.ts
│   │   ├── 📁 blockchain/
│   │   │   ├── Web3Service.ts
│   │   │   ├── TokenService.ts
│   │   │   ├── SmartContractService.ts
│   │   │   └── GasService.ts
│   │   ├── 📁 notification/
│   │   │   ├── NotificationService.ts
│   │   │   ├── EmailService.ts
│   │   │   ├── PushService.ts
│   │   │   └── WebhookService.ts
│   │   └── 📁 risk/
│   │       ├── RiskAssessmentService.ts
│   │       ├── FraudDetectionService.ts
│   │       └── ComplianceService.ts
│   ├── 📁 controllers/
│   │   ├── OrderController.ts
│   │   ├── MerchantController.ts
│   │   ├── WalletController.ts
│   │   ├── PaymentController.ts
│   │   └── AdminController.ts
│   ├── 📁 routes/
│   │   ├── index.ts
│   │   ├── order.routes.ts
│   │   ├── merchant.routes.ts
│   │   ├── wallet.routes.ts
│   │   ├── payment.routes.ts
│   │   └── admin.routes.ts
│   ├── 📁 middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   ├── logging.ts
│   │   └── errorHandler.ts
│   ├── 📁 utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── cryptography.ts
│   │   ├── priceOracle.ts
│   │   └── formatters.ts
│   ├── 📁 scripts/
│   │   ├── deploy-contracts.ts
│   │   ├── seed-data.ts
│   │   └── maintenance.ts
│   ├── 📁 __tests__/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   └── app.ts
├── 📁 contracts/
│   ├── Escrow.sol
│   ├── TokenBridge.sol
│   └── PriceOracle.sol
├── 📁 docs/
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md
```

## 🛠️ Technology Stack

### Core Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose (primary), Redis (caching)
- **Authentication**: JWT + OAuth2.0

### Blockchain & Payments
- **Web3**: ethers.js v6
- **Smart Contracts**: Solidity (ERC-20, ERC-721)
- **Stablecoins**: USDC, USDT, DAI, BUSD
- **Payment Providers**: TransFi, FreeBnk, Stripe, Circle

### Infrastructure
- **Cache**: Redis
- **Message Queue**: Bull (Redis)
- **Real-time**: Socket.io
- **Monitoring**: Prometheus + Grafana

## 📊 Comprehensive Data Models

### User Domain Models

```typescript
// src/models/user/User.ts
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
  createdAt: Date;
  updatedAt: Date;
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
  }
}, {
  timestamps: true
});

export const User = model<IUser>('User', userSchema);
```

### Merchant Models

```typescript
// src/models/user/Merchant.ts
export interface IMerchant extends Document {
  _id: string;
  userId: string;
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

export interface MerchantCapabilities {
  supportedAssets: SupportedAsset[];
  paymentMethods: PaymentMethodType[];
  services: MerchantService[];
  operatingHours?: {
    timezone: string;
    hours: OperatingHours[];
  };
}

export interface SupportedAsset {
  assetType: AssetType;
  assetSymbol: string;
  networks: string[]; // e.g., ['ethereum', 'polygon', 'bsc']
  minAmount: number;
  maxAmount: number;
  spread: number; // percentage spread
}

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

export enum MerchantStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked'
}

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
        open: String, // HH:mm format
        close: String // HH:mm format
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
      type: String, // 'id_front', 'id_back', 'proof_of_address', 'business_license'
      url: String,
      uploadedAt: Date
    }]
  }
}, {
  timestamps: true
});
```

### Trading Models

```typescript
// src/models/trading/Order.ts
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
```

### Escrow & Payment Models

```typescript
// src/models/trading/Escrow.ts
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
```

## 🔧 Core Services Implementation

### Order Matching Service

```typescript
// src/services/trading/MatchingService.ts
export class MatchingService {
  async findMatchingMerchants(order: IOrder): Promise<IMerchant[]> {
    const criteria = order.matching.criteria;
    
    const merchants = await Merchant.find({
      status: MerchantStatus.APPROVED,
      'capabilities.services': order.side,
      'capabilities.supportedAssets': {
        $elemMatch: {
          assetSymbol: order.asset.base,
          networks: order.asset.network,
          minAmount: { $lte: order.amounts.baseAmount },
          maxAmount: { $gte: order.amounts.baseAmount }
        }
      },
      'performance.rating': { $gte: criteria.minRating },
      'performance.averageResponseTime': { $lte: criteria.maxResponseTime }
    });
    
    // Score and rank merchants
    const scoredMerchants = merchants.map(merchant => ({
      merchant,
      score: this.calculateMerchantScore(merchant, order)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 merchants
    
    return scoredMerchants.map(s => s.merchant);
  }
  
  private calculateMerchantScore(merchant: IMerchant, order: IOrder): number {
    let score = 0;
    
    // Performance factors (60%)
    score += merchant.performance.rating * 12; // Max 60 points
    score += (1 - merchant.performance.disputeRate) * 20; // Low dispute rate
    score += Math.max(0, 10 - merchant.performance.averageResponseTime) * 2; // Fast response
    
    // Capacity factors (30%)
    const dailyCapacity = 1 - (merchant.limits.daily.usedAmount / merchant.limits.daily.totalAmount);
    score += dailyCapacity * 30;
    
    // Fee factors (10%)
    const assetConfig = merchant.capabilities.supportedAssets.find(
      a => a.assetSymbol === order.asset.base
    );
    score += (1 - assetConfig.spread) * 10;
    
    return score;
  }
}
```

### Escrow Service

```typescript
// src/services/trading/EscrowService.ts
export class EscrowService {
  async createEscrow(order: IOrder, merchant: IMerchant): Promise<IEscrow> {
    const escrowWallet = await this.generateEscrowWallet();
    
    const escrow = new Escrow({
      orderId: order._id,
      type: EscrowType.CUSTODIAL,
      status: EscrowStatus.CREATED,
      assets: {
        asset: order.asset.base,
        amount: order.amounts.baseAmount,
        network: order.asset.network,
        walletAddress: escrowWallet.address,
        tokenAddress: this.getTokenAddress(order.asset.base, order.asset.network)
      },
      participants: {
        userId: order.userId,
        merchantId: merchant._id,
        platform: this.platformWalletAddress
      },
      timing: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      conditions: {
        releaseConditions: [
          { type: 'payment_confirmation', value: true },
          { type: 'time_elapsed', value: 2 * 60 * 60 * 1000 } // 2 hours
        ],
        refundConditions: [
          { type: 'timeout', value: 24 * 60 * 60 * 1000 }, // 24 hours
          { type: 'user_cancellation', value: true }
        ],
        disputePeriod: 24,
        autoReleaseAfter: 168
      }
    });
    
    await escrow.save();
    return escrow;
  }
  
  async lockFunds(escrow: IEscrow, fromAddress: string): Promise<string> {
    const tokenService = new TokenService(escrow.assets.network);
    
    const txHash = await tokenService.transfer(
      fromAddress,
      escrow.assets.walletAddress,
      escrow.assets.amount,
      escrow.assets.tokenAddress
    );
    
    escrow.status = EscrowStatus.LOCKED;
    escrow.transactions.lockTx = txHash;
    escrow.timing.lockedAt = new Date();
    await escrow.save();
    
    return txHash;
  }
  
  async releaseFunds(escrow: IEscrow, toAddress: string): Promise<string> {
    const tokenService = new TokenService(escrow.assets.network);
    
    const txHash = await tokenService.transfer(
      escrow.assets.walletAddress,
      toAddress,
      escrow.assets.amount,
      escrow.assets.tokenAddress
    );
    
    escrow.status = EscrowStatus.RELEASED;
    escrow.transactions.releaseTx = txHash;
    escrow.timing.releasedAt = new Date();
    await escrow.save();
    
    return txHash;
  }
}
```

## 🚀 API Endpoints

### Order Management
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/available` - Get available orders (merchants)
- `POST /api/v1/orders/:id/accept` - Merchant accepts order
- `POST /api/v1/orders/:id/cancel` - Cancel order
- `POST /api/v1/orders/:id/confirm-payment` - Confirm payment

### Merchant Management
- `POST /api/v1/merchants/register` - Register as merchant
- `GET /api/v1/merchants/profile` - Get merchant profile
- `PUT /api/v1/merchants/profile` - Update merchant profile
- `GET /api/v1/merchants/performance` - Get performance metrics

### Wallet & Payments
- `GET /api/v1/wallets/balance` - Get wallet balances
- `POST /api/v1/wallets/deposit` - Deposit funds
- `POST /api/v1/wallets/withdraw` - Withdraw funds
- `GET /api/v1/payments/methods` - Get available payment methods

## 🔒 Security & Compliance

- **KYC/AML Integration**: Identity verification
- **Transaction Monitoring**: Suspicious activity detection
- **Rate Limiting**: API abuse prevention
- **Data Encryption**: End-to-end encryption
- **Audit Logging**: Comprehensive activity tracking

This comprehensive structure supports multi-asset trading, sophisticated merchant matching, secure escrow management, and scalable payment processing for your P2P stablecoin platform.
