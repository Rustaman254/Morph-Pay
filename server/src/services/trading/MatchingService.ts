// src/services/trading/MatchingService.ts
import { IOrder } from '../../models/Order';
import { IMerchant, Merchant, MerchantStatus } from '../../models/Merchant';

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