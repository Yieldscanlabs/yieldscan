import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

// Define types for deposit/withdrawal data structure
export interface TokenActivity {
  totalDeposit: string;
  totalWithdraw: string;
}

export interface ProtocolActivity {
  [tokenSymbol: string]: TokenActivity;
}

export interface ChainActivity {
  [protocolName: string]: ProtocolActivity;
}

// The API response structure:
// {
//   "0x5fbc2f7b45155cbe713eaa9133dd0e88d74126f6": {
//     "1": {
//       "Aave": {
//         "USDC": {
//           "totalDeposit": "1000000",
//           "totalWithdraw": "0"
//         }
//       }
//     },
//     "56": {
//       "Aave": {
//         "USDT": {
//           "totalDeposit": "50000000000000000100000000000000000",
//           "totalWithdraw": "0"
//         }
//       }
//     }
//   }
// }
export type ApiResponseStructure = Record<string, Record<string, ChainActivity>>;

export interface DepositsAndWithdrawalsStore {
  // Data structure: [walletAddress][chainId][protocol][token] = { totalDeposit, totalWithdraw }
  activityData: ApiResponseStructure;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;
  
  // Actions
  fetchUserActivity: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  getUserActivity: (walletAddress: string) => Record<string, ChainActivity> | null;
  getTotalDepositsForUser: (walletAddress: string) => string;
  getTotalWithdrawalsForUser: (walletAddress: string) => string;
  setAutoRefresh: (enabled: boolean) => void;
}

function generateId() {
  return crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9);
}
// API endpoint for fetching user activity data
const USER_DETAILS_API_ENDPOINT = API_BASE_URL + '/api/user-details';

// Note: Auto-refresh is disabled by default due to long fetch times for this endpoint
// Auto-refresh interval in milliseconds (disabled by default)
const AUTO_REFRESH_INTERVAL = 300000;

export const useDepositsAndWithdrawalsStore = create<DepositsAndWithdrawalsStore>()(
  persist(
    (set, get) => ({
      activityData: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: false, // Disabled by default due to long fetch times

      // Fetch user activity data for a specific wallet address
      fetchUserActivity: async (walletAddress: string, showLoading = true) => {
        if (!walletAddress || walletAddress === '0x') {
          set({ activityData: {}, error: null, isLoading: false });
          return;
        }

        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          // Normalize wallet address to lowercase for consistency
          const normalizedAddress = walletAddress.toLowerCase();

          const url = new URL(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}`, window.location.origin);
          url.searchParams.set("requestId", generateId());

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
          }
          
          // The API returns data in the format we need
          const data: ApiResponseStructure = await response.json();
          
          // Ensure all wallet addresses are lowercase for consistency
          const normalizedData: ApiResponseStructure = {};
          Object.entries(data).forEach(([address, userData]) => {
            normalizedData[address.toLowerCase()] = userData;
          });
          set(state => ({
            activityData: {
              ...state.activityData,
              ...normalizedData
            },
            isLoading: false,
            lastUpdated: Date.now()
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error fetching user activity data',
            isLoading: false
          });
        }
      },

      // Clear any error messages
      clearErrors: () => set({ error: null }),

      // Get activity data for a specific user
      getUserActivity: (walletAddress: string) => {
        const state = get();
        const normalizedAddress = walletAddress.toLowerCase();

        return state.activityData[normalizedAddress] || null;
      },

      // Calculate total deposits across all chains and protocols for a user
      getTotalDepositsForUser: (walletAddress: string) => {
        const state = get();
        const normalizedAddress = walletAddress.toLowerCase();
        const userData = state.activityData[normalizedAddress];

        if (!userData) return '0';

        let totalDeposits = BigInt(0);

        Object.values(userData).forEach(chainData => {
          Object.values(chainData).forEach(protocolData => {
            Object.values(protocolData).forEach(tokenData => {
              totalDeposits += BigInt(tokenData.totalDeposit || '0');
            });
          });
        });

        return totalDeposits.toString();
      },

      // Calculate total withdrawals across all chains and protocols for a user
      getTotalWithdrawalsForUser: (walletAddress: string) => {
        const state = get();
        const normalizedAddress = walletAddress.toLowerCase();
        const userData = state.activityData[normalizedAddress];

        if (!userData) return '0';

        let totalWithdrawals = BigInt(0);

        Object.values(userData).forEach(chainData => {
          Object.values(chainData).forEach(protocolData => {
            Object.values(protocolData).forEach(tokenData => {
              totalWithdrawals += BigInt(tokenData.totalWithdraw || '0');
            });
          });
        });

        return totalWithdrawals.toString();
      },

      // Set auto-refresh preference
      setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled })
    }),
    {
      name: 'deposits-withdrawals-store',
      partialize: (state) => ({
        activityData: state.activityData,
        autoRefreshEnabled: state.autoRefreshEnabled,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

// Hook for auto-refreshing user activity data
export function useDepositsAndWithdrawalsAutoRefresh(walletAddress: string) {
  const { fetchUserActivity, autoRefreshEnabled, lastUpdated } = useDepositsAndWithdrawalsStore();

  useEffect(() => {
    if (!autoRefreshEnabled || !walletAddress || walletAddress === '0x') {
      return;
    }

    // Initial fetch if no data exists
    if (!lastUpdated) {
      fetchUserActivity(walletAddress, true);
    }

    const interval = setInterval(() => {
      // Auto-refresh without showing loading state
      fetchUserActivity(walletAddress, false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchUserActivity, autoRefreshEnabled, walletAddress, lastUpdated]);
} 