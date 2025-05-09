export type SupportedChain = 'ETH' | 'BSC' | 'ARBITRUM_ONE';

export type SupportedToken = 'USDC' | 'USDT' | 'BTC' | 'ETH';

export interface Asset {
  token: SupportedToken;
  chain: SupportedChain;
  balance: string;
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