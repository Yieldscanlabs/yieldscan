export type SupportedChain = 'ETH' | 'BSC' | 'ARBITRUM_ONE';

export type SupportedToken = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'aUSDC' | 'aUSDT' | 'cUSDC' | 'cUSDT';

export interface Asset {
  token: SupportedToken;
  address: string;
  chain: SupportedChain;
  balance: string;
  decimals: number;
  chainId: number;
  balanceUsd: string;
  icon: string;
}

export interface YieldOption {
  id: string;
  protocol: string;
  token: SupportedToken;
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