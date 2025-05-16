/**
 * Standardized response format for APY data
 */
export interface ApyResponse {
  apy: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Standardized response for deposit operations
 */
export interface DepositResponse {
  success: boolean;
  txHash: string | null;
  error: string | null;
}

/**
 * Standardized response for withdrawal operations
 */
export interface WithdrawResponse {
  success: boolean;
  txHash: string | null;
  error: string | null;
}

/**
 * Basic APY information
 */
export interface ApyInfo {
  value: number | null;
  error: string | null;
}

/**
 * Simplified protocol adapter focused on deposit and withdraw
 */
export interface ProtocolAdapter {
  // Protocol information
  name: string;
  displayName: string;
  logoUrl: string;
  
  // Core functionality
  getApy: (tokenAddress: string, chainId: number) => Promise<ApyInfo>;
  deposit: (tokenAddress: string, amount: string, chainId: number) => Promise<DepositResponse>;
  withdraw: (tokenAddress: string, amount: string, chainId: number) => Promise<WithdrawResponse>;
  
  // Protocol specifics
  getSupportedTokens: (chainId: number) => string[];
  getSupportedChains: () => number[];
}