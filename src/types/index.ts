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
  totalDeposited?: number;
  totalDepositedUsd?: string;
  usd: number;
  currentBalanceInProtocol?: number;
  currentBalanceInProtocolUsd?: string;
  walletAddress?: string;  // Source wallet address (for consolidated view)
  // True when the backend's balance check for this specific value genuinely
  // failed this run (RPC error), as opposed to a real, confirmed zero.
  // balanceCheckFailed covers `balance`/`balanceUsd`; protocolBalanceCheckFailed
  // covers `currentBalanceInProtocol`/`currentBalanceInProtocolUsd`, since the
  // two are looked up independently and can fail independently.
  balanceCheckFailed?: boolean;
  protocolBalanceCheckFailed?: boolean;
}

export interface Chain {
  name: string;
  chainId: number;
  usdPrice: number;
  image: string;
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

export interface Protocol {
  id: string;

  name: string;

  website?: string;

  image: string;
}