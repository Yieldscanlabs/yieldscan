import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

// Define types for the APY data structure
export interface ProtocolApys {
  compound?: number;
  aave?: number;
  venus?: number;
  radiant?: number;
  gmx?: number;
  // Add other protocols as needed
}

export interface ApyStore {
  // Data structure: [chainId][tokenAddress] = { protocol: apy }
  apyData: Record<number, Record<string, ProtocolApys>>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;
  
  // Actions
  fetchApys: (showLoading?: boolean) => Promise<void>;
  fetchApyForToken: (chainId: number, address: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  getBestApy: (chainId: number, address: string) => { bestApy: number | null; bestProtocol: string | null };
  setAutoRefresh: (enabled: boolean) => void;
}

// API endpoint for fetching APY data
const APY_API_ENDPOINT = 'https://api.yieldscan.io/apys';

// Auto-refresh interval in milliseconds (3 seconds)
const AUTO_REFRESH_INTERVAL = 3000;

export const useApyStore = create<ApyStore>()(
  persist(
    (set, get) => ({
      apyData: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,

      // Fetch APYs for one or more chains
      fetchApys: async (showLoading = true) => {
        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          const url = APY_API_ENDPOINT;
            
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
          }
          
          const data: Record<number, Record<string, ProtocolApys>> = await response.json();
          
          set({ 
            apyData: data,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching APY data',
            isLoading: false
          });
        }
      },

      // Fetch APY for a specific token on a specific chain
      fetchApyForToken: async (chainId: number, address: string, showLoading = true) => {
        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          const normalizedAddress = address.toLowerCase();
          const url = `${APY_API_ENDPOINT}/${chainId}/${normalizedAddress}`;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
          }
          
          const tokenApyData: ProtocolApys = await response.json();
          
          set(state => {
            const newApyData = { ...state.apyData };
            
            // Initialize the chain object if it doesn't exist
            if (!newApyData[chainId]) {
              newApyData[chainId] = {};
            }
            
            // Update the token's APY data
            newApyData[chainId][normalizedAddress] = tokenApyData;
            
            return {
              apyData: newApyData,
              isLoading: false,
              lastUpdated: Date.now()
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching token APY data',
            isLoading: false
          });
        }
      },

      // Clear any error messages
      clearErrors: () => set({ error: null }),

      // Get the best APY and protocol for a given token
      getBestApy: (chainId: number, address: string) => {
        const state = get();
        const normalizedAddress = address.toLowerCase();
        
        // Check if we have data for this chain and token
        if (!state.apyData[chainId] || !state.apyData[chainId][normalizedAddress]) {
          return { bestApy: null, bestProtocol: null };
        }
        
        const apys = state.apyData[chainId][normalizedAddress];
        let bestApy: number | null = null;
        let bestProtocol: string | null = null;
        
        // Find the best APY among available protocols
        Object.entries(apys).forEach(([protocol, apy]) => {
          if (apy !== undefined && (bestApy === null || apy > bestApy)) {
            bestApy = apy;
            bestProtocol = protocol;
          }
        });
        
        return { bestApy, bestProtocol };
      },
      
      // Enable or disable auto-refresh
      setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled }),
    }),
    {
      name: 'yieldscan-apy-store',
      partialize: (state) => ({
        apyData: state.apyData,
        lastUpdated: state.lastUpdated,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
    }
  )
);

/**
 * Hook that sets up auto-refresh for APY data
 * @param chainIds Optional array of chain IDs to refresh
 */
export function useApyAutoRefresh(chainIds?: number[]) {
  const { fetchApys, autoRefreshEnabled } = useApyStore();
  
  useEffect(() => {
    // Initial fetch
    fetchApys(true);
    
    // Set up auto-refresh interval
    //@ts-ignore
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        // Use silent refresh (no loading state)
        fetchApys(false);
      }, AUTO_REFRESH_INTERVAL);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchApys, chainIds, autoRefreshEnabled]);
}

/**
 * Hook that sets up auto-refresh for a specific token's APY data
 * @param chainId The chain ID
 * @param address The token address
 */
export function useTokenApyAutoRefresh(chainId: number, address: string) {
  const { fetchApyForToken, autoRefreshEnabled } = useApyStore();
  
  useEffect(() => {
    if (!chainId || !address) return;
    
    // Initial fetch
    fetchApyForToken(chainId, address, true);
    
    // Set up auto-refresh interval
    //@ts-ignore
    let intervalId: NodeJS.Timeout | null = null;
    
    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        // Use silent refresh (no loading state)
        fetchApyForToken(chainId, address, false);
      }, AUTO_REFRESH_INTERVAL);
    }
    
    // Clean up interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchApyForToken, chainId, address, autoRefreshEnabled]);
}