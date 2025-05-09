import type { SupportedChain, SupportedToken, YieldOption } from '../types';
import { MOCK_YIELD_OPTIONS } from './constants';

export function formatNumber(number: number | string, decimals: number = 2): string {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculateDailyYield(amount: number, apy: number): number {
  // Daily yield = (amount * (apy / 100)) / 365
  return (amount * (apy / 100)) / 365;
}

export function getYieldOptionsForAsset(token: SupportedToken, chain: SupportedChain): YieldOption[] {
  return MOCK_YIELD_OPTIONS.filter(
    option => option.token === token && option.chain === chain
  );
}

export function getBestYieldOptionForAsset(token: SupportedToken, chain: SupportedChain): YieldOption | undefined {
  const options = getYieldOptionsForAsset(token, chain);
  // Return the option with highest APY
  return options.sort((a, b) => b.apy - a.apy)[0];
}

export function getChainColor(chain: SupportedChain): string {
  switch (chain) {
    case 'ETH':
      return '#627EEA';
    case 'BSC':
      return '#F3BA2F';
    case 'ARBITRUM_ONE':
      return '#28A0F0';
    default:
      return '#888888';
  }
}

export function getCoinColor(token: SupportedToken): string {
  switch (token) {
    case 'BTC':
      return '#F7931A';
    case 'ETH':
      return '#627EEA';
    case 'USDC':
      return '#2775CA';
    case 'USDT':
      return '#26A17B';
    default:
      return '#888888';
  }
}

export function shortenAddress(address: string): string {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}