import { useUserPreferencesStore } from '../store/userPreferencesStore';
import type { SupportedChain, SupportedToken } from '../types';
export function formatNumber(number: number | string, decimals?: number ): string {
  // Handle undefined, null, or empty string
  if (number === undefined || number === null || number === '') {
    return '0.00';
  }

  const effectiveDecimal = decimals ?? useUserPreferencesStore.getState().activeDecimalDigits

  const num = typeof number === 'string' ? parseFloat(number) : number;

  // Handle NaN or invalid numbers
  if (isNaN(num) || !isFinite(num)) {
    return '0.00';
  }

  return num.toLocaleString(undefined, {
    minimumFractionDigits: effectiveDecimal,
    maximumFractionDigits: effectiveDecimal,
  });
}


export function calculateDailyYield(amount: number, apy: number): number {
  // Daily yield = (amount * (apy / 100)) / 365
  return (amount * (apy / 100)) / 365;
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