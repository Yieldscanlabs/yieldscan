import type { BestApyResult } from '../hooks/useBestApy';
import type { ApiResponseStructure } from '../store/apyStore';
import { PROTOCOL_NAMES } from './constants';

/**
 * Gets the best yield option (highest APY) for a given token on a specific chain
 * 
 * @param apyData The APY data structure from the store or API
 * @param chainId The chain ID to look up
 * @param address The token address to look up
 * @returns The best APY data matching BestApyResult type
 */
export function getBestYield(
  apyData: ApiResponseStructure,
  chainId: number,
  address: string
): BestApyResult {
  // Default return value matching BestApyResult type
  const defaultResult: BestApyResult = {
    bestApy: null,
    bestProtocol: null,
    aaveApy: null,
    compoundApy: null,
    loading: false,
    error: null
  };
  
  // Early return if no apyData, or chain doesn't exist in data
  if (!apyData || !apyData[chainId]) {
    return defaultResult;
  }
  
  // Normalize address to lowercase for consistent lookups
  const normalizedAddress = address.toLowerCase();
  
  // Get protocol data for this token on this chain
  const tokenData = apyData[chainId][normalizedAddress];
  
  // If no data exists for this token, return default result
  if (!tokenData) {
    return defaultResult;
  }
  
  // Extract Aave and Compound APYs specifically
  const aaveApy = tokenData.aave ?? null;
  const compoundApy = tokenData.compound ?? null;
  
  // Track best APY and protocol
  let bestApy: number | null = null;
  let bestProtocol: typeof PROTOCOL_NAMES[keyof typeof PROTOCOL_NAMES] | null = null;
  
  // First check if we have both Aave and Compound APYs
  if (aaveApy !== null && compoundApy !== null) {
    if (aaveApy > compoundApy) {
      bestApy = aaveApy;
      bestProtocol = PROTOCOL_NAMES.AAVE;
    } else {
      bestApy = compoundApy;
      bestProtocol = PROTOCOL_NAMES.COMPOUND;
    }
  } else if (aaveApy !== null) {
    // Only have Aave APY
    bestApy = aaveApy;
    bestProtocol = PROTOCOL_NAMES.AAVE;
  } else if (compoundApy !== null) {
    // Only have Compound APY
    bestApy = compoundApy;
    bestProtocol = PROTOCOL_NAMES.COMPOUND;
  }
  
  // Now check other protocols (if any) to see if they're better
  Object.entries(tokenData).forEach(([protocol, apy]) => {
    // Skip if APY is undefined or if it's Aave or Compound (already handled)
    if (apy === undefined || protocol === 'aave' || protocol === 'compound') return;
    
    // Update best APY if this one is better
    if (bestApy === null || apy > bestApy) {
      bestApy = apy;
      // Map protocol name to PROTOCOL_NAMES constant if available
      const upperProtocol = protocol.toUpperCase() as keyof typeof PROTOCOL_NAMES;
      bestProtocol = PROTOCOL_NAMES[upperProtocol] || protocol;
    }
  });
  
  // Return complete BestApyResult
  return {
    bestApy,
    bestProtocol,
    aaveApy,
    compoundApy,
    loading: false,
    error: null
  };
}

/**
 * Gets all available APY options for a token sorted from highest to lowest
 * 
 * @param apyData The APY data structure from the store or API
 * @param chainId The chain ID to look up
 * @param address The token address to look up
 * @returns Array of protocols sorted by APY (highest first)
 */
export function getSortedYieldOptions(
  apyData: ApiResponseStructure,
  chainId: number,
  address: string
): Array<{ protocol: string; apy: number }> {
  // We need to extract available protocols manually since getBestYield no longer returns them
  if (!apyData || !apyData[chainId]) {
    return [];
  }
  
  const normalizedAddress = address.toLowerCase();
  const tokenData = apyData[chainId][normalizedAddress];
  
  if (!tokenData) {
    return [];
  }
  
  // Convert to array and sort by APY (descending)
  return Object.entries(tokenData)
    .filter(([_, apy]) => apy !== undefined)
    .map(([protocol, apy]) => ({ 
      protocol, 
      apy: typeof apy === 'number' ? apy : 0 
    }))
    .sort((a, b) => b.apy - a.apy);
}