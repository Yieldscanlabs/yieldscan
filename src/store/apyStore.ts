import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { PROTOCOL_NAMES } from '../utils/constants';

// Define types for the APY data structure
export interface ProtocolApys {
  compound?: number;
  aave?: number;
  venus?: number;
  radiant?: number;
  gmx?: number;
  lido?: number;
  morpho?: number;
  // Add other protocols as needed
}

// The API response structure:
// {
//   1: { // Ethereum Mainnet
//     '0x1234abcd...': {
//       compound: 4.5,
//       aave: 3.8
//     },
//     '0xabcd1234...': {
//       compound: 5.2,
//       aave: 4.1
//     }
//   },
//   137: { // Polygon
//     '0x5678efgh...': {
//       compound: 3.7,
//       aave: 4.0
//     }
//   }
// }
export type ApiResponseStructure = Record<number, Record<string, ProtocolApys>>;

export interface ApyStore {
  // Data structure: [chainId][tokenAddress] = { protocol: apy }
  apyData: ApiResponseStructure;
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
const APY_API_ENDPOINT = 'http://65.109.34.27:5678';

// Auto-refresh interval in milliseconds (3 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

export const useApyStore = create<ApyStore>()(
  persist(
    (set, get) => ({
      apyData: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,

      // Fetch APYs for all chains and tokens
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
          
          // The API returns data already in the format we need
          const data: ApiResponseStructure = await response.json();
          data['1']['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'] = {
            ...data['1']['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
            venus: 3.67,
            radiant: 4
          }
          data['1']['0x'] = {
            aave: 1.23,
            lido: 2.34
          }
          data['1']['0xdac17f958d2ee523a2206206994597c13d831ec7'] = {
            ...data['1']['0xdac17f958d2ee523a2206206994597c13d831ec7'],
            venus: 2.38
          }
          // Ensure all addresses are lowercase for consistency
          const normalizedData: ApiResponseStructure = {};
          Object.entries(data).forEach(([chainIdStr, chainData]) => {
            const chainId = parseInt(chainIdStr, 10);
            normalizedData[chainId] = {};
            
            Object.entries(chainData).forEach(([address, protocols]) => {
              normalizedData[chainId][address.toLowerCase()] = protocols;
            });
          });
          
          set({ 
            apyData: normalizedData,
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
            bestProtocol = PROTOCOL_NAMES[protocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] || protocol;
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

// Track if auto-refresh has been set up already using a module-level variable
let autoRefreshInitialized = false;

/**
 * Hook that sets up auto-refresh for APY data once
 */
export function useApyAutoRefresh() {
  const { fetchApys, autoRefreshEnabled } = useApyStore();
  
  useEffect(() => {
    // Skip if already initialized
    if (autoRefreshInitialized) {
      return;
    }
    
    autoRefreshInitialized = true;
    
    // Initial fetch
    fetchApys(true);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled (checking latest state)
      if (useApyStore.getState().autoRefreshEnabled) {
        // Use silent refresh (no loading state)
        fetchApys(false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
      autoRefreshInitialized = false;
    };
  }, []); // Empty dependency array ensures it only runs once
}

// Track token-specific auto-refresh with a Map
const tokenAutoRefreshMap = new Map<string, boolean>();

/**
 * Hook that sets up auto-refresh for a specific token's APY data
 * @param chainId The chain ID
 * @param address The token address
 */
export function useTokenApyAutoRefresh(chainId: number, address: string) {
  const { fetchApyForToken, autoRefreshEnabled } = useApyStore();
  
  useEffect(() => {
    if (!chainId || !address) return;
    
    // Create a unique key for this token
    const tokenKey = `${chainId}-${address.toLowerCase()}`;
    
    // Skip if already initialized for this token
    if (tokenAutoRefreshMap.get(tokenKey)) {
      return;
    }
    
    tokenAutoRefreshMap.set(tokenKey, true);
    
    // Initial fetch
    fetchApyForToken(chainId, address, true);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled (checking latest state)
      if (useApyStore.getState().autoRefreshEnabled) {
        // Use silent refresh (no loading state)
        fetchApyForToken(chainId, address, false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
      tokenAutoRefreshMap.delete(tokenKey);
    };
  }, [chainId, address]); // Only re-run if chainId or address changes
}