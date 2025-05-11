/**
 * Type definitions for Aave Protocol integration
 */

/**
 * Raw reserve data structure from Aave Protocol Data Provider
 */
export interface AaveReserveDataRaw {
  configuration: bigint;
  liquidityIndex: bigint;
  currentLiquidityRate: bigint;
  variableBorrowIndex: bigint;
  currentVariableBorrowRate: bigint;
  currentStableBorrowRate: bigint;
  lastUpdateTimestamp: number;
  id: number;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  accruedToTreasury: bigint;
  unbacked: bigint;
  isolationModeTotalDebt: bigint;
}

/**
 * Processed reserve data with calculated APY
 */
export interface AaveReserveData {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  isActive: boolean;
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  interestRateStrategyAddress: string;
  availableLiquidity: string;
  totalStableDebt: string;
  totalVariableDebt: string;
  liquidityRate: string;
  variableBorrowRate: string;
  stableBorrowRate: string;
  averageStableBorrowRate: string;
  utilizationRate: string;
  lastUpdateTimestamp: number;
  liquidationThreshold: number;
  ltv: number;
  liquidationBonus: number;
  reserveFactor: number;
  usageAsCollateralEnabled: boolean;
  underlyingAsset: string;
}

/**
 * User reserve data from Aave protocol
 */
export interface AaveUserReserve {
  underlyingAsset: string;
  aTokenBalance: string;
  stableDebtBalance: string;
  variableDebtBalance: string;
  principalStableDebt: string;
  scaledVariableDebt: string;
  stableBorrowRate: string;
  usageAsCollateralEnabled: boolean;
}

/**
 * User overall position summary in Aave protocol
 */
export interface AaveUserSummary {
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  totalBorrowsMarketReferenceCurrency: string;
  availableBorrowsUSD: string;
  currentLiquidationThreshold: string;
  ltv: string;
  healthFactor: string;
}

/**
 * Combined user data from Aave protocol
 */
export interface AaveUserData {
  userReserves: AaveUserReserve[];
  userSummary: AaveUserSummary;
}

/**
 * Reward token and emissions data structure
 */
export interface AaveRewardsData {
  symbol: string;
  rewardsTokenInfo: {
    symbol: string;
    address: string;
    decimals: number;
    tokenPrice: string;
  };
  emissionsPerSecond: string;
  incentivesLastUpdateTimestamp: number;
  tokenIncentivesIndex: string;
  emissionEndTimestamp: number;
}

/**
 * Extended reserve data with calculated yields
 */
export interface AaveReserveWithYield {
  underlyingAsset: string;
  name: string;
  symbol: string;
  decimals: number;
  isActive: boolean;
  borrowingEnabled: boolean;
  aTokenAddress: string;
  stableDebtTokenAddress: string;
  variableDebtTokenAddress: string;
  liquidityRate: string;
  variableBorrowRate: string;
  stableBorrowRate: string;
  depositAPY: number;
  variableBorrowAPY: number;
  stableBorrowAPY: number;
  chainId: number;
  address: string;
  stableBorrowRateEnabled: boolean;
  interestRateStrategyAddress: string;
  availableLiquidity: string;
  totalPrincipalStableDebt: string;
  averageStableRate: string;
  stableDebtLastUpdateTimestamp: string;
  totalScaledVariableDebt: string;
  priceInMarketReferenceCurrency: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
  baseStableBorrowRate: string;
  baseVariableBorrowRate: string;
  optimalUsageRatio: string;
  isPaused: boolean;
  isSiloedBorrowing: boolean;
  accruedToTreasury: string;
  unbacked: string;
  isolationModeTotalDebt: string;
  flashLoanEnabled: boolean;
  debtCeiling: string;
  debtCeilingDecimals: string;
  eModeCategoryId: number;
}

/**
 * Response structure for Aave API calls
 */
export interface AaveResponse {
  reserves: AaveReserveWithYield[];
  error?: string;
}

/**
 * APY data returned by useAaveApy hook
 */
export interface AaveApyData {
  apy: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}