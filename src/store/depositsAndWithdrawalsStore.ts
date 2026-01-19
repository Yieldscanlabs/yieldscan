import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

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

export type ApiResponseStructure = {
  totalDeposits: number,
  currentDeposit: number,
  totalEarnings: number,
  currentEarnings: number,
  totalWithdrawals: number,
  userBalance: number,
  transactions: Record<string, Record<string, ChainActivity>>
};

export type ActivityDataType = Record<string, ApiResponseStructure>;

export interface DepositsAndWithdrawalsStore {
  activityData: ActivityDataType;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;
  progress: number;
  scanStatus: string;
  isScanning: boolean;

  fetchUserActivity: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  getUserActivity: (walletAddress: string) => ApiResponseStructure | null;
  getTotalDepositsForUser: (walletAddress: string) => string;
  getTotalWithdrawalsForUser: (walletAddress: string) => string;
  setAutoRefresh: (enabled: boolean) => void;
  resetProgress: () => void;
  removeUserActivity: (walletAddress: string) => void;
  reset: () => void;
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
}

const USER_DETAILS_API_ENDPOINT = API_BASE_URL + '/api/user-details';
const AUTO_REFRESH_INTERVAL = 300000;

// External connection trackers
let activeAbortController: AbortController | null = null;
let activeEventSource: EventSource | null = null;
let activeProgressTimer: NodeJS.Timeout | null = null;

// Helper to clean up external connections
const cleanupActiveRequests = () => {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
  if (activeProgressTimer) {
    clearInterval(activeProgressTimer);
    activeProgressTimer = null;
  }
};

export const useDepositsAndWithdrawalsStore = create<DepositsAndWithdrawalsStore>()(
  persist(
    (set, get) => ({
      activityData: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: false,
      progress: 0,
      scanStatus: '',
      isScanning: false,

      resetProgress: () => {
        if (activeProgressTimer) clearInterval(activeProgressTimer);
        set({ progress: 0, scanStatus: '', isScanning: false });
      },

      removeUserActivity: (walletAddress: string) => {
        if (!walletAddress) return;

        set((state) => {
          const normalizedAddress = walletAddress.toLowerCase();
          // Create a copy of the data
          const newActivityData = { ...state.activityData };

          // Delete the specific wallet's data
          if (newActivityData[normalizedAddress]) {
            delete newActivityData[normalizedAddress];
          }

          return { activityData: newActivityData };
        });
      },

      reset: () => {
        cleanupActiveRequests();
        set({
          activityData: {},
          isLoading: false,
          error: null,
          lastUpdated: null,
          progress: 0,
          scanStatus: '',
          isScanning: false
        });
      },

      fetchUserActivity: async (walletAddress: string, showLoading = true) => {
        // 1. Cancel any running scan immediately
        cleanupActiveRequests();

        if (!walletAddress || walletAddress === '0x') {
          set({ activityData: {}, error: null, isLoading: false });
          return;
        }

        const normalizedAddress = walletAddress.toLowerCase();
        const currentController = new AbortController();
        activeAbortController = currentController;
        console.log("get().activityData: ", get().activityData)
        // Smart Check: Only show full progress bar for NEW wallets
        const hasExistingData = !!get().activityData[normalizedAddress];
        console.log("hasExistingData: ", hasExistingData);

        const shouldShowProgressBar = showLoading && !hasExistingData;

        // Basic loading state (for spinners)
        if (showLoading) set({ isLoading: true });

        // Full "Scanning" UI state (only if needed)
        if (shouldShowProgressBar) {
          set({
            isScanning: true,
            progress: 5,
            scanStatus: 'Scanning blockchain in background...'
          });

          // Smooth animation for new scans
          activeProgressTimer = setInterval(() => {
            set((state) => {
              if (state.progress >= 90) return state;
              return { progress: state.progress + (Math.random() * 2) };
            });
          }, 200);
        }

        set({ error: null });

        try {
          const requestId = generateId();

          // 2. Setup SSE for progress updates (only if bar is visible)
          if (shouldShowProgressBar) {
            activeEventSource = new EventSource(`${API_BASE_URL}/api/long-task/progress?requestId=${requestId}`);

            activeEventSource.onmessage = (event) => {
              if (currentController.signal.aborted) return;
              if (event.data === "done") {
                activeEventSource?.close();
                set({ scanStatus: 'Finalizing data...' });
              } else {
                try {
                  const data = JSON.parse(event.data);
                  const totalTxFound = Object.values(data).reduce((a: any, b: any) => Number(a) + Number(b), 0);
                  set({ scanStatus: `Scanning in background: ${totalTxFound} transactions analyzed` });
                } catch (e) { }
              }
            };
          }

          // 3. API Request
          const url = new URL(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}`, window.location.origin);
          url.searchParams.set("requestId", requestId);

          const response = await fetch(url, { signal: currentController.signal });

          if (!response.ok) throw new Error(`API error: ${response.statusText}`);

          const data = await response.json();

          let normalizedData: ActivityDataType = {};
          if (data.transactions && Object.keys(data.transactions).length > 0) {
            normalizedData[Object.keys(data.transactions)[0].toLowerCase()] = data;
          } else {
            normalizedData[normalizedAddress] = data;
          }

          // 4. Success Handling
          if (!currentController.signal.aborted) {
            set(state => ({
              activityData: { ...state.activityData, ...normalizedData },
              isLoading: false,
              lastUpdated: Date.now()
            }));

            if (shouldShowProgressBar) {
              set({ progress: 100, scanStatus: 'Scan Complete!' });

              // FIXED: Removed the check that was failing (activeAbortController === currentController)
              // We rely on the closure variable `currentController` to ensure we don't close a *newer* request
              setTimeout(() => {
                // Only reset if we haven't started a NEW request in the meantime
                if (!currentController.signal.aborted) {
                  get().resetProgress();
                }
              }, 800);
            }
          }

        } catch (error: any) {
          if (error.name === 'AbortError') return;

          console.error("Fetch Error:", error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
            // Force reset on error
            isScanning: false,
            progress: 0
          });
        } finally {
          if (activeAbortController === currentController) {
            // Clear Timer & Event Source
            if (activeProgressTimer) {
              clearInterval(activeProgressTimer);
              activeProgressTimer = null;
            }
            if (activeEventSource) {
              activeEventSource.close();
              activeEventSource = null;
            }

            // Just release the controller reference, DO NOT abort it.
            // If we abort here, the setTimeout check above will fail.
            activeAbortController = null;
          }
        }
      },

      clearErrors: () => set({ error: null }),

      getUserActivity: (walletAddress: string) => {
        const state = get();
        const normalizedAddress = walletAddress?.toLowerCase();
        return state.activityData[normalizedAddress] || null;
      },

      getTotalDepositsForUser: (walletAddress: string) => {
        const state = get();
        const userData = state.activityData[walletAddress?.toLowerCase()];
        return userData ? userData.totalDeposits.toString() : '0';
      },

      getTotalWithdrawalsForUser: (walletAddress: string) => {
        const state = get();
        const userData = state.activityData[walletAddress?.toLowerCase()];
        return userData ? userData.totalWithdrawals.toString() : '0';
      },

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

export function useDepositsAndWithdrawalsAutoRefresh(walletAddress: string) {
  const { fetchUserActivity, autoRefreshEnabled, lastUpdated } = useDepositsAndWithdrawalsStore();

  useEffect(() => {
    if (!autoRefreshEnabled || !walletAddress || walletAddress === '0x') return;

    if (!lastUpdated) fetchUserActivity(walletAddress, true);

    const interval = setInterval(() => {
      fetchUserActivity(walletAddress, false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchUserActivity, autoRefreshEnabled, walletAddress, lastUpdated]);
}