import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { useAssetStore } from './assetStore';
import { useApyStore } from './apyStore';
import type { ProtocolApys as BaseProtocolApys } from './apyStore';

// Extended version of ProtocolApys with an index signature
interface ProtocolApysWithIndex extends BaseProtocolApys {
  [key: string]: number | undefined;
}

// Define types for the earnings data structure
export interface ProtocolEarnings {
  compound?: number;
  aave?: number;
  venus?: number;
  radiant?: number;
  gmx?: number;
  lido?: number;
  morpho?: number;
  [key: string]: number | undefined; // Add index signature to allow string indexing
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
  earningsStartDate: number | null; // Timestamp when we started tracking earnings
  
  // Actions
  fetchEarnings: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  fetchEarningsForToken: (walletAddress: string, chainId: number, address: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  getTotalEarnings: () => { daily: number; weekly: number; monthly: number; yearly: number; lifetime: number };
  setAutoRefresh: (enabled: boolean) => void;
  resetEarningsStartDate: () => void;
}

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 30000;

// Constants for time calculations
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;
const ONE_MONTH_MS = 30 * ONE_DAY_MS;
const ONE_YEAR_MS = 365 * ONE_DAY_MS;

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
      earningsStartDate: null,

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
          // Get token balances from assetStore
          const assets = useAssetStore.getState().assets;
          
          // Get APY data from apyStore
          const apyData = useApyStore.getState().apyData;
          
          // Initialize earnings data structure
          const earningsData: EarningsDataStructure = {
            total: {
              daily: 0,
              weekly: 0,
              monthly: 0,
              yearly: 0,
              lifetime: 0
            }
          };

          // Set earningsStartDate if not already set
          const state = get();
          const now = Date.now();
          const earningsStartDate = state.earningsStartDate || now;
          if (!state.earningsStartDate) {
            set({ earningsStartDate });
          }
          
          // Calculate time elapsed since we started tracking earnings
          const timeElapsedMs = now - earningsStartDate;
          
          // Filter yield-bearing tokens with balances
          const yieldBearingAssets = assets.filter(asset => asset.yieldBearingToken);
          
          // Calculate earnings for each yield-bearing token
          yieldBearingAssets.forEach(asset => {
            const { chainId, address, protocol, balance } = asset;
            const balanceNum = parseFloat(balance);
            
            if (!earningsData[chainId]) {
              earningsData[chainId] = {};
            }
            
            if (!earningsData[chainId][address.toLowerCase()]) {
              earningsData[chainId][address.toLowerCase()] = {};
            }
            
            // Make non-null assertion for protocol since we've filtered for it
            const protocolKey = protocol!.toLowerCase();
            
            // Get APY for this token from apyStore
            const tokenApys = apyData[chainId]?.[address.toLowerCase()] as ProtocolApysWithIndex | undefined;
            
            if (tokenApys && tokenApys[protocolKey] !== undefined) {
              const apy = tokenApys[protocolKey]!;
              
              // Calculate earnings
              const yearlyEarnings = balanceNum * (apy / 100);
              const dailyEarnings = yearlyEarnings / 365;
              const weeklyEarnings = dailyEarnings * 7;
              const monthlyEarnings = dailyEarnings * 30;
              
              // Calculate lifetime earnings based on how long we've been tracking
              const lifetimeEarnings = (yearlyEarnings / ONE_YEAR_MS) * timeElapsedMs;
              
              // Add to token-specific earnings
              earningsData[chainId][address.toLowerCase()][protocolKey] = lifetimeEarnings;
              
              // Add to total earnings
              earningsData.total.daily += dailyEarnings;
              earningsData.total.weekly += weeklyEarnings;
              earningsData.total.monthly += monthlyEarnings;
              earningsData.total.yearly += yearlyEarnings;
              earningsData.total.lifetime += lifetimeEarnings;
            }
          });
          
          set({ 
            earningsData,
            isLoading: false,
            lastUpdated: now
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
          
          // Get this specific asset from assetStore
          const asset = useAssetStore.getState().getAssetByAddress(address, chainId);
          
          // Get APY data from apyStore for this token
          const tokenApys = useApyStore.getState().apyData[chainId]?.[normalizedAddress] as ProtocolApysWithIndex | undefined;
          
          if (!asset || !asset.yieldBearingToken || !tokenApys || !asset.protocol) {
            // Not a yield-bearing token or no APY data available
            set({ isLoading: false });
            return;
          }
          
          // Get APY for the token's protocol
          const protocolKey = asset.protocol.toLowerCase();
          const apy = tokenApys[protocolKey];
          
          if (apy === undefined) {
            set({ isLoading: false });
            return;
          }
          
          // Set earningsStartDate if not already set
          const state = get();
          const now = Date.now();
          const earningsStartDate = state.earningsStartDate || now;
          if (!state.earningsStartDate) {
            set({ earningsStartDate });
          }
          
          // Calculate time elapsed since we started tracking earnings
          const timeElapsedMs = now - earningsStartDate;
          
          // Calculate earnings
          const balanceNum = parseFloat(asset.balance);
          const yearlyEarnings = balanceNum * (apy / 100);
          const dailyEarnings = yearlyEarnings / 365;
          const weeklyEarnings = dailyEarnings * 7;
          const monthlyEarnings = dailyEarnings * 30;
          const lifetimeEarnings = (yearlyEarnings / ONE_YEAR_MS) * timeElapsedMs;
          
          set(state => {
            // Create a deep copy of the existing earnings data
            const newEarningsData = JSON.parse(JSON.stringify(state.earningsData));
            
            // Initialize chain and token objects if they don't exist
            if (!newEarningsData[chainId]) {
              newEarningsData[chainId] = {};
            }
            
            if (!newEarningsData[chainId][normalizedAddress]) {
              newEarningsData[chainId][normalizedAddress] = {};
            }
            
            // Previous values for this protocol (if any)
            const prevProtocolEarnings = newEarningsData[chainId][normalizedAddress][protocolKey] || 0;
            
            // Update token's protocol earnings
            newEarningsData[chainId][normalizedAddress][protocolKey] = lifetimeEarnings;
            
            // Update total earnings by adjusting the difference
            const difference = lifetimeEarnings - prevProtocolEarnings;
            newEarningsData.total.lifetime += difference;
            
            // Recalculate projected earnings
            newEarningsData.total.daily = 0;
            newEarningsData.total.weekly = 0;
            newEarningsData.total.monthly = 0;
            newEarningsData.total.yearly = 0;
            
            // Sum up all projected earnings based on APYs
            const assets = useAssetStore.getState().assets;
            const apyData = useApyStore.getState().apyData;
            
            assets.filter(a => a.yieldBearingToken && a.protocol).forEach(a => {
              const tokenApy = apyData[a.chainId]?.[a.address.toLowerCase()] as ProtocolApysWithIndex | undefined;
              const protocolKey = a.protocol!.toLowerCase();
              if (tokenApy && tokenApy[protocolKey] !== undefined) {
                const tokenApyValue = tokenApy[protocolKey]!;
                const tokenBalanceNum = parseFloat(a.balance);
                const tokenYearlyEarnings = tokenBalanceNum * (tokenApyValue / 100);
                
                newEarningsData.total.daily += tokenYearlyEarnings / 365;
                newEarningsData.total.weekly += (tokenYearlyEarnings / 365) * 7;
                newEarningsData.total.monthly += (tokenYearlyEarnings / 365) * 30;
                newEarningsData.total.yearly += tokenYearlyEarnings;
              }
            });
            
            return {
              earningsData: newEarningsData,
              isLoading: false,
              lastUpdated: now
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
      
      // Reset earnings tracking start date (useful for testing or resetting earnings tracking)
      resetEarningsStartDate: () => set({ earningsStartDate: Date.now() })
    }),
    {
      name: 'yieldscan-earn-store',
      partialize: (state) => ({
        earningsData: state.earningsData,
        lastUpdated: state.lastUpdated,
        autoRefreshEnabled: state.autoRefreshEnabled,
        earningsStartDate: state.earningsStartDate,
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
  const { assets } = useAssetStore();
  const { apyData } = useApyStore();
  
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
  }, [walletAddress, fetchEarnings, autoRefreshEnabled, assets, apyData]);
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
  const { assets } = useAssetStore();
  const { apyData } = useApyStore();
  
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
  }, [walletAddress, chainId, address, assets, apyData]); // Re-run if these change
}