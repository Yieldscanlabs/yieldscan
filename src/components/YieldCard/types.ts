import type { Asset } from '../../types';

// Optimization data for a yield-bearing asset
export interface OptimizationData {
  currentProtocol: string;
  currentApy: number;
  betterProtocol: string;
  betterApy: number;
  additionalYearlyUsd: string;
  apyImprovement: number;
}

// Common interface for YieldCard props
export interface YieldCardProps {
  asset: Asset;
  optimizationData?: OptimizationData;
  onOptimize?: () => void;
  onLockAPY?: () => void;
}

// Type for the token with lockYield property
export type TokenWithLockYield = {
  lockYield?: {
    expirationDate: string;
    protocol: {
      name: string;
      swap: boolean;
      ytAddress: string;
      ptAddress: string;
      swapAddress: string;
      ytDecimals: number;
      ptDecimals: number;
      ytMarketAddress: string;
    };
  };
  maturity?: string;
};

// Props for the MaturityBadge component
export interface MaturityBadgeProps {
  maturityDate?: string;
  formattedMaturityDate: string;
  daysUntilMaturity: number;
}

// Props for YieldInfo component
export interface YieldInfoProps {
  asset: Asset;
  apy: number;
  balanceNum: number;
  dailyYieldUsd: number;
  yearlyYieldUsd: number;
}

// Props for YieldActions component
export interface YieldActionsProps {
  asset: Asset;
  hasLockYield: boolean;
  chainId: number;
  optimizationData?: OptimizationData;
  onWithdrawClick: () => void;
  onOptimize?: () => void;
  onLockAPYClick: () => void;
} 