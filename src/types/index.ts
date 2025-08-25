export type SupportedChain = 'ETH' | 'BSC' | 'ARBITRUM_ONE' | 'BASE';

export type SupportedToken = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'aUSDC' | 'aUSDT v2' | 'AUSDT' | 'cUSDC' | 'cUSDT';

export interface Asset {
  id: string;
  token: string;
  address: string;
  chain: SupportedChain;
  balance: string;
  decimals: number;
  withdrawUri?: string;
  protocol?: string;
  withdrawContract?: string;
  underlyingAsset?: string;
  chainId: number;
    yieldBearingToken: boolean;
  balanceUsd: string;
    maxDecimalsShow: number;
  icon?: string;
}

export interface YieldOption {
  id: string;
  protocol: string;
  token: string;
  chain: SupportedChain;
  apy: number;
  tvl: string;
  risk: 'Low' | 'Medium' | 'High';
  lockupDays: number; // Added lockupDays property
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  chainId: number;
}