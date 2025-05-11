import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import type { CompoundApyData } from '../types/compound';

// Compound V3 (Comet) ABI with correct function signatures for rate calculations
const compoundV3ABI = [
  {
    inputs: [],
    name: 'getUtilization',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'utilization', type: 'uint256' }],
    name: 'getSupplyRate',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'utilization', type: 'uint256' }],
    name: 'getBorrowRate',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Compound V3 markets (Comet) addresses
const COMPOUND_V3_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    'WETH': '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
    'USDT': '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840'
  },
  // Arbitrum
  42161: {
    'USDC': '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA'
  }
};

// Mapping of token addresses to their Compound market addresses
const SUPPORTED_TOKENS_TO_MARKETS: Record<string, { chainId: number, market: string }> = {
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': { chainId: 1, market: 'USDC' }, // USDC on Ethereum
  '0xdAC17F958D2ee523a2206206994597C13D831ec7': { chainId: 1, market: 'USDT' }, // USDC on Ethereum
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': { chainId: 1, market: 'WETH' }, // WETH on Ethereum
  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': { chainId: 42161, market: 'USDC' }, // USDC on Arbitrum
};

const SECONDS_PER_YEAR = 31536000; // 365 * 24 * 60 * 60

/**
 * Custom hook to fetch APY data from Compound protocol for a specific token
 * @param tokenAddress The token address to get APY for
 * @returns APY data, loading state, error, and refetch function
 */
export default function useCompoundApy(tokenAddress: string): CompoundApyData {
  const [apy, setApy] = useState<number | null>(null);
  const [borrowApy, setBorrowApy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use default Ethereum mainnet client, can be adapted based on token's chain
  const ethereumClient = usePublicClient({ chainId: 1 });
  const arbitrumClient = usePublicClient({ chainId: 42161 });

  const fetchApy = async () => {
    if (!tokenAddress) {
      setError('Token address is required');
      return;
    }
    
    // Check if token is supported by Compound
    const normalizedAddress = tokenAddress;
    const marketInfo = SUPPORTED_TOKENS_TO_MARKETS[normalizedAddress];
    if (!marketInfo) {
      setError('Token likely not supported by Compound V3');
      setApy(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Select the appropriate client based on the chain ID
      const clientToUse = marketInfo.chainId === 1 ? ethereumClient : arbitrumClient;
      if (!clientToUse) {
        setError(`No provider available for chain ID ${marketInfo.chainId}`);
        setApy(null);
        return;
      }
      
      const marketAddress = COMPOUND_V3_MARKETS[marketInfo.chainId][marketInfo.market];
      if (!marketAddress) {
        setError(`No Compound market found for this token on chain ${marketInfo.chainId}`);
        setApy(null);
        return;
      }

      // First get utilization from the market
      const utilization = await clientToUse.readContract({
        address: marketAddress as `0x${string}`,
        abi: compoundV3ABI,
        functionName: 'getUtilization',
      });

      // Then get supply and borrow rates based on utilization
      const supplyRate = await clientToUse.readContract({
        address: marketAddress as `0x${string}`,
        abi: compoundV3ABI,
        functionName: 'getSupplyRate',
        args: [utilization]
      });
      
      const borrowRate = await clientToUse.readContract({
        address: marketAddress as `0x${string}`,
        abi: compoundV3ABI,
        functionName: 'getBorrowRate',
        args: [utilization]
      });
      
      if (supplyRate === undefined) {
        setError('Failed to fetch supply rate');
        setApy(null);
        return;
      }

      // Convert rates from per-second to APY
      // Compound V3 returns rates in 1e18 scale
      const rateDecimal = Number(formatUnits(supplyRate, 18));
      const borrowRateDecimal = Number(formatUnits(borrowRate, 18));
      
      // Calculate APY using compound interest formula
      let supplyApy;
      let borrowApyValue;
      
      // For tiny rates, use simple interest approximation
      if (rateDecimal < 0.000001) {
        supplyApy = rateDecimal * SECONDS_PER_YEAR * 100;
      } else {
        try {
          // Compound formula: (1 + r)^n - 1
          // Where r is the rate per period and n is the number of periods
          supplyApy = (Math.pow((1 + rateDecimal), SECONDS_PER_YEAR) - 1) * 100;
          
          // Sanity check for unreasonable values
          if (!isFinite(supplyApy) || supplyApy > 1000) {
            supplyApy = rateDecimal * SECONDS_PER_YEAR * 100;
          }
        } catch (e) {
          // Fallback to simple interest calculation if compound calculation fails
          supplyApy = rateDecimal * SECONDS_PER_YEAR * 100;
        }
      }

      // Same calculation for borrow APY
      if (borrowRateDecimal < 0.000001) {
        borrowApyValue = borrowRateDecimal * SECONDS_PER_YEAR * 100;
      } else {
        try {
          borrowApyValue = (Math.pow((1 + borrowRateDecimal), SECONDS_PER_YEAR) - 1) * 100;
          
          if (!isFinite(borrowApyValue) || borrowApyValue > 1000) {
            borrowApyValue = borrowRateDecimal * SECONDS_PER_YEAR * 100;
          }
        } catch (e) {
          borrowApyValue = borrowRateDecimal * SECONDS_PER_YEAR * 100;
        }
      }
      
      setApy(supplyApy);
      setBorrowApy(borrowApyValue);
    } catch (err: any) {
      console.error('Error fetching Compound APY:', err);
      
      if (err.toString().includes('execution reverted')) {
        setError('Error calling Compound protocol');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error fetching Compound APY');
      }
      
      setApy(null);
      setBorrowApy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApy();
  }, [tokenAddress]);

  return {
    apy,
    borrowApy,
    loading,
    error,
    refetch: fetchApy
  };
}