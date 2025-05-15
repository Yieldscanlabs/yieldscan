import { useMemo } from 'react';
import useAaveApy from './useAaveApy';
import useCompoundApy from './useCompoundApy';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';

export interface BestApyResult {
  bestApy: number | null;
  bestProtocol: typeof PROTOCOL_NAMES[keyof typeof PROTOCOL_NAMES] | null;
  aaveApy: number | null;
  compoundApy: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to determine the best APY available across different lending protocols
 * for the given asset.
 * 
 * @param asset The asset to find the best yield for
 * @returns Information about the best APY, protocol, and related data
 */
export default function useBestApy(asset?: Asset): BestApyResult {
  // Get Aave APY data if available
  const { 
    apy: aaveApy, 
    loading: aaveLoading,
    error: aaveError
  } = asset?.address ? useAaveApy(asset.address) : { apy: null, loading: false, error: null };

  // Get Compound APY data if available
  const { 
    apy: compoundApy, 
    loading: compoundLoading, 
    error: compoundError 
  } = asset?.address ? useCompoundApy(asset.address) : { apy: null, loading: false, error: null };

  // Calculate best APY and protocol
  const result = useMemo(() => {
    // Check loading state
    const loading = aaveLoading || compoundLoading;
    
    // Collect errors (if any)
    const errors: string[] = [];
    if (aaveError) errors.push(`Aave: ${aaveError}`);
    if (compoundError) errors.push(`Compound: ${compoundError}`);
    const error = errors.length > 0 ? errors.join('; ') : null;
    
    // Default values
    let bestApy: number | null = null;
    let bestProtocol: typeof PROTOCOL_NAMES[keyof typeof PROTOCOL_NAMES] | null = null;
    
    // Only compare if we have at least one valid APY and not loading
    if (!loading) {
      if (aaveApy !== null && compoundApy !== null) {
        // We have both APYs, compare them
        if (aaveApy > compoundApy) {
          bestApy = aaveApy;
          bestProtocol = PROTOCOL_NAMES.AAVE;
        } else {
          bestApy = compoundApy;
          bestProtocol = PROTOCOL_NAMES.COMPOUND;
        }
      } else if (aaveApy !== null) {
        // We only have Aave APY
        bestApy = aaveApy;
        bestProtocol = PROTOCOL_NAMES.AAVE;
      } else if (compoundApy !== null) {
        // We only have Compound APY
        bestApy = compoundApy;
        bestProtocol = PROTOCOL_NAMES.COMPOUND;
      }
    }
    
    return {
      bestApy,
      bestProtocol,
      aaveApy,
      compoundApy,
      loading,
      error
    };
  }, [aaveApy, compoundApy, aaveLoading, compoundLoading, aaveError, compoundError]);
  
  return result;
}