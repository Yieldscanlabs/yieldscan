/**
 * Type definitions for Compound Protocol integration
 */

/**
 * APY data returned by useCompoundApy hook
 */
export interface CompoundApyData {
  apy: number | null;          // Supply APY
  borrowApy: number | null;    // Borrow APY
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Raw data from Compound Comet contracts
 */
export interface CompoundRawData {
  supplyRate: bigint;
  borrowRate: bigint;
  utilization: bigint;
  totalSupply: bigint;
  totalBorrow: bigint;
}

/**
 * Processed Compound market data with calculated APYs
 */
export interface CompoundMarketData {
  symbol: string;
  name: string;
  supplyApy: number;
  borrowApy: number;
  utilization: number;
  totalSupply: string;
  totalBorrow: string;
  marketAddress: string;
  chainId: number;
}