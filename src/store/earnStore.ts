import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

// Define types for the earnings data structure
export interface ProtocolEarnings {
  compound?: number;
  aave?: number;
  venus?: number;
  radiant?: number;
  gmx?: number;
  // Add other protocols as needed
}

// Structure to represent earnings data by chain and token
export type EarningsDataStructure = Record<number, Record<string, ProtocolEarnings>> & {
  total: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    lifetime: number;
  }
};

export interface EarnStore {
  // Data structure: [chainId][tokenAddress] = { protocol: earnings }
  // With a special 'total' key for aggregated stats
  earningsData: EarningsDataStructure;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;
  
  // Actions
  fetchEarnings: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  fetchEarningsForToken: (walletAddress: string, chainId: number, address: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  getTotalEarnings: () => { daily: number; weekly: number; monthly: number; yearly: number; lifetime: number };
  setAutoRefresh: (enabled: boolean) => void;
}

// API endpoint for fetching earnings data (to be implemented)
const EARNINGS_API_ENDPOINT = 'https://api.yieldscan.io/earnings';

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

export const useEarnStore = create<EarnStore>()(
  persist(
    (set, get) => ({
      earningsData: {
        total: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
          lifetime: 0
        }
      },
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,

      // Fetch earnings for all chains and tokens for a specific wallet
      fetchEarnings: async (walletAddress: string, showLoading = true) => {
        if (!walletAddress || walletAddress === '0x') {
          set({ earningsData: { total: { daily: 0, weekly: 0, monthly: 0, yearly: 0, lifetime: 0 } }, error: null, isLoading: false });
          return;
        }

        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          // MOCK DATA - Replace with actual API call when ready
          // This mock data simulates the structure of the API response
          const mockData: EarningsDataStructure = generateMockEarningsData();
          
          // In real implementation, replace with:
          // const url = `${EARNINGS_API_ENDPOINT}/${walletAddress}`;
          // const response = await fetch(url);
          // if (!response.ok) {
          //   throw new Error(`API response error: ${response.statusText}`);
          // }
          // const data: EarningsDataStructure = await response.json();

          // Ensure all addresses are lowercase for consistency
          const normalizedData: EarningsDataStructure = {
            total: mockData.total
          };
          
          Object.entries(mockData).forEach(([chainIdStr, chainData]) => {
            if (chainIdStr === 'total') return;
            
            const chainId = parseInt(chainIdStr, 10);
            normalizedData[chainId] = {};
            
            Object.entries(chainData).forEach(([address, earnings]) => {
              normalizedData[chainId][address.toLowerCase()] = earnings;
            });
          });
          
          set({ 
            earningsData: normalizedData,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching earnings data',
            isLoading: false
          });
        }
      },

      // Fetch earnings for a specific token on a specific chain
      fetchEarningsForToken: async (walletAddress: string, chainId: number, address: string, showLoading = true) => {
        if (!walletAddress || walletAddress === '0x') {
          return;
        }

        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          const normalizedAddress = address.toLowerCase();
          
          // MOCK DATA - Replace with actual API call when ready
          // This simulates fetching data for a single token
          const mockTokenData = generateMockEarningsForToken(chainId, normalizedAddress);
          
          // In real implementation, replace with:
          // const url = `${EARNINGS_API_ENDPOINT}/${walletAddress}/${chainId}/${normalizedAddress}`;
          // const response = await fetch(url);
          // if (!response.ok) {
          //   throw new Error(`API response error: ${response.statusText}`);
          // }
          // const tokenEarningsData: ProtocolEarnings = await response.json();
          
          set(state => {
            const newEarningsData = { ...state.earningsData };
            
            // Initialize the chain object if it doesn't exist
            if (!newEarningsData[chainId]) {
              newEarningsData[chainId] = {};
            }
            
            // Update the token's earnings data
            newEarningsData[chainId][normalizedAddress] = mockTokenData;
            
            return {
              earningsData: newEarningsData,
              isLoading: false,
              lastUpdated: Date.now()
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching token earnings data',
            isLoading: false
          });
        }
      },

      // Clear any error messages
      clearErrors: () => set({ error: null }),

      // Get total earnings across all tokens and chains
      getTotalEarnings: () => {
        const state = get();
        return state.earningsData.total;
      },
      
      // Enable or disable auto-refresh
      setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled }),
    }),
    {
      name: 'yieldscan-earn-store',
      partialize: (state) => ({
        earningsData: state.earningsData,
        lastUpdated: state.lastUpdated,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
    }
  )
);

// Track if auto-refresh has been set up already using a module-level variable
let autoRefreshInitialized = false;

/**
 * Hook that sets up auto-refresh for earnings data
 * @param walletAddress The wallet address to fetch earnings for
 */
export function useEarningsAutoRefresh(walletAddress: string) {
  const { fetchEarnings, autoRefreshEnabled } = useEarnStore();
  
  useEffect(() => {
    if (!walletAddress || walletAddress === '0x' || autoRefreshInitialized) {
      return;
    }
    
    autoRefreshInitialized = true;
    
    // Initial fetch
    fetchEarnings(walletAddress, true);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled (checking latest state)
      if (useEarnStore.getState().autoRefreshEnabled) {
        // Use silent refresh (no loading state)
        fetchEarnings(walletAddress, false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
      autoRefreshInitialized = false;
    };
  }, [walletAddress, fetchEarnings, autoRefreshEnabled]);
}

// Track token-specific auto-refresh with a Map
const tokenAutoRefreshMap = new Map<string, boolean>();

/**
 * Hook that sets up auto-refresh for a specific token's earnings data
 * @param walletAddress The wallet address
 * @param chainId The chain ID
 * @param address The token address
 */
export function useTokenEarningsAutoRefresh(walletAddress: string, chainId: number, address: string) {
  const { fetchEarningsForToken, autoRefreshEnabled } = useEarnStore();
  
  useEffect(() => {
    if (!walletAddress || !chainId || !address) return;
    
    // Create a unique key for this token
    const tokenKey = `${walletAddress}-${chainId}-${address.toLowerCase()}`;
    
    // Skip if already initialized for this token
    if (tokenAutoRefreshMap.get(tokenKey)) {
      return;
    }
    
    tokenAutoRefreshMap.set(tokenKey, true);
    
    // Initial fetch
    fetchEarningsForToken(walletAddress, chainId, address, true);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled (checking latest state)
      if (useEarnStore.getState().autoRefreshEnabled) {
        // Use silent refresh (no loading state)
        fetchEarningsForToken(walletAddress, chainId, address, false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
      tokenAutoRefreshMap.delete(tokenKey);
    };
  }, [walletAddress, chainId, address]); // Only re-run if these change
}

// Helper function to generate mock earnings data
// This will be removed when the API is available
function generateMockEarningsData(): EarningsDataStructure {
  return {
    // Ethereum mainnet
    1: {
      // USDC
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
        aave: 2.34,
        compound: 1.98,
        venus: 0.75
      },
      // USDT
      '0xdac17f958d2ee523a2206206994597c13d831ec7': {
        aave: 1.56,
        compound: 1.23,
        radiant: 0.89
      }
    },
    // Arbitrum
    42161: {
      // USDC on Arbitrum
      '0xaf88d065e77c8cc2239327c5edb3a432268e5831': {
        aave: 3.21,
        compound: 2.87
      }
    },
    // Totals across all chains and tokens
    total: {
      daily: 0.63,
      weekly: 4.41,
      monthly: 18.9,
      yearly: 230.1,
      lifetime: 347.5
    }
  };
}

// Helper function to generate mock earnings for a specific token
// This will be removed when the API is available
function generateMockEarningsForToken(chainId: number, address: string): ProtocolEarnings {
  // Default mock data if we don't have specific data for this token
  const defaultData: ProtocolEarnings = {
    aave: Math.random() * 2 + 1,
    compound: Math.random() * 2 + 0.5
  };
  
  // If we have predefined mock data for this token, return it
  const mockData = generateMockEarningsData();
  if (mockData[chainId] && mockData[chainId][address]) {
    return mockData[chainId][address];
  }
  
  return defaultData;
}