import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import type { AaveApyData } from '../types/aave';

// Corrected Aave Protocol Data Provider ABI for getReserveData
const aaveDataProviderABI = [
  {
    inputs: [{ name: 'asset', type: 'address' }],
    name: 'getReserveData',
    outputs: [
      { name: 'availableLiquidity', type: 'uint256' },
      { name: 'totalStableDebt', type: 'uint256' },
      { name: 'totalVariableDebt', type: 'uint256' },
      { name: 'liquidityRate', type: 'uint256' },
      { name: 'variableBorrowRate', type: 'uint256' },
      { name: 'stableBorrowRate', type: 'uint256' },
      { name: 'averageStableBorrowRate', type: 'uint256' },
      { name: 'liquidityIndex', type: 'uint256' },
      { name: 'variableBorrowIndex', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint40' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Aave Protocol Data Provider address on Ethereum mainnet
const AAVE_DATA_PROVIDER_ADDRESS = '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d' as const;

// List of tokens known to be supported by Aave v3 on Ethereum
const SUPPORTED_AAVE_TOKENS = [
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
  '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
].map(addr => addr.toLowerCase());

/**
 * Custom hook to fetch APY data from Aave protocol for a specific token on Ethereum
 * @param tokenAddress The token address to get APY for
 * @returns APY data, loading state, error, and refetch function
 */
export default function useAaveApy(tokenAddress: string): AaveApyData {
  const [apy, setApy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use wagmi's publicClient for contract interaction
  const publicClient = usePublicClient({ chainId: 1 });

  const fetchApy = async () => {
    if (!tokenAddress) {
      setError('Token address is required');
      return;
    }
    
    if (!publicClient) {
      setError('No provider available for Ethereum mainnet');
      return;
    }
    
    // Check if token is supported by Aave (optional, but helps avoid unnecessary contract calls)
    const normalizedAddress = tokenAddress.toLowerCase();
    if (!SUPPORTED_AAVE_TOKENS.includes(normalizedAddress)) {
      setError('Token likely not supported by Aave');
      setApy(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the Aave protocol data provider to get reserve data
      const reserveData = await publicClient.readContract({
        address: AAVE_DATA_PROVIDER_ADDRESS,
        abi: aaveDataProviderABI,
        functionName: 'getReserveData',
        args: [tokenAddress as `0x${string}`]
      });
      
      if (!reserveData) {
        setError('Failed to fetch reserve data');
        setApy(null);
        return;
      }

      // Extract liquidity rate (index 3 in the returned array)
      const liquidityRate = reserveData[3];
      
      // Convert the rate from ray units (1e27) to a decimal
      const rateDecimal = Number(formatUnits(liquidityRate, 27));
      
      if (rateDecimal <= 0) {
        setApy(0); // Set APY to 0 if rate is zero or negative
        return;
      }
      
      // Safer APY calculation to avoid Infinity
      let aaveApy;
      
      // Use approximation for very small rates to avoid JavaScript precision issues
      if (rateDecimal < 0.000001) {
        // For tiny rates, use the simple formula: rate * secondsPerYear * 100
        aaveApy = rateDecimal * 31536000 * 100;
      } else {
        // For larger rates, use the compound formula but cap at reasonable values
        try {
          aaveApy = (Math.pow((1 + rateDecimal / (365 * 24 * 3600)), 31536000) - 1) * 100;
          
          // Sanity check to avoid unreasonable values
          if (!isFinite(aaveApy) || aaveApy > 1000) {
            // Fallback to simple interest calculation if compound gives unreasonable results
            aaveApy = rateDecimal * 100; // annualized rate as percentage
          }
        } catch (e) {
          // If math calculation fails, fall back to simple calculation
          aaveApy = rateDecimal * 100;
        }
      }
      
      setApy(aaveApy);
    } catch (err: any) {
      console.error('Error fetching Aave APY:', err);
      
      // More helpful error messages
      if (err.toString().includes('execution reverted')) {
        setError('Token not available in Aave protocol');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error fetching Aave APY');
      }
      
      setApy(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApy();
  }, [tokenAddress, publicClient]);

  return {
    apy,
    loading,
    error,
    refetch: fetchApy
  };
}