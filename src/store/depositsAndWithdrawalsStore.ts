import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { useUserPreferencesStore } from './userPreferencesStore';
import { useManualWalletStore } from './manualWalletStore';

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
  totalDeposits: number;
  currentDeposit: number;
  totalEarnings: number;
  currentEarnings: number;
  totalWithdrawals: number;
  userBalance: number;
  label?: string;
  accumulatedYield?: {
    daily: number;
    yearly: number;
    totalTillNow: number;
  };
  transactions: Record<string, Record<string, ChainActivity>>;
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
  updateWalletLabel: (walletAddress: string, label: string) => Promise<void>; // New Action
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

let activeAbortController: AbortController | null = null;
let activeEventSource: EventSource | null = null;
let activeProgressTimer: NodeJS.Timeout | null = null;

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

      updateWalletLabel: async (walletAddress: string, label: string) => {
        const normalizedAddress = walletAddress.toLowerCase();

        // 1. Optimistic UI Update
        set((state) => {
          const existingData = state.activityData[normalizedAddress];

          // If data exists, update it. If not, create a skeleton so the label appears immediately.
          const newData = existingData
            ? { ...existingData, label }
            : {
              label,
              totalDeposits: 0, currentDeposit: 0, totalEarnings: 0, currentEarnings: 0,
              totalWithdrawals: 0, userBalance: 0, transactions: {}
            };

          return {
            activityData: {
              ...state.activityData,
              [normalizedAddress]: newData
            }
          };
        });

        try {
          // 2. Call API
          const response = await fetch(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}/label`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label })
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to save label');
          }

        } catch (error) {
          console.error("Label update failed:", error);
          // Optional: You could revert the state here if critical
        }
      },

      resetProgress: () => {
        if (activeProgressTimer) clearInterval(activeProgressTimer);
        set({ progress: 0, scanStatus: '', isScanning: false });
      },

      removeUserActivity: (walletAddress: string) => {
        if (!walletAddress) return;
        set((state) => {
          const normalizedAddress = walletAddress.toLowerCase();
          const newActivityData = { ...state.activityData };
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
        cleanupActiveRequests();

        if (!walletAddress || walletAddress === '0x') {
          set({ activityData: {}, error: null, isLoading: false });
          return;
        }

        const normalizedAddress = walletAddress.toLowerCase();

        // SNAPSHOT: Capture current data for this wallet to restore if the API fails
        const previousWalletData = get().activityData[normalizedAddress];

        const currentController = new AbortController();
        activeAbortController = currentController;

        const hasExistingData = !!previousWalletData;
        const shouldShowProgressBar = showLoading && !hasExistingData;

        if (showLoading) set({ isLoading: true });

        if (shouldShowProgressBar) {
          set({ isScanning: true, progress: 5, scanStatus: 'Scanning blockchain in background...' });
          activeProgressTimer = setInterval(() => {
            set((state) => {
              if (state.progress >= 90) return state;
              return { progress: state.progress + (Math.random() * 2) };
            });
          }, 200);
        }

        set({ error: null });
        const requestId = generateId();

        // --- API CALL 1: Progress Stream (SSE) ---
        if (shouldShowProgressBar) {
          try {
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
                } catch (e) {
                  console.warn("SSE Parse Error:", e);
                }
              }
            };
            activeEventSource.onerror = () => activeEventSource?.close();
          } catch (sseError) {
            console.error("SSE Init Error:", sseError);
          }
        }

        // --- API CALL 2: Main Data Fetch ---
        try {
          const url = new URL(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}`, window.location.origin);
          url.searchParams.set("requestId", requestId);

          const response = await fetch(url, { signal: currentController.signal });
          if (!response.ok) throw new Error(`Server Error: ${response.status}`);

          // BYPASS INTERCEPTOR: Use arrayBuffer to avoid the 'split' crash
          const buffer = await response.arrayBuffer();
          const decoder = new TextDecoder("utf-8");
          const responseText = decoder.decode(buffer);
          const data = JSON.parse(responseText);

          // Update decimals if address matches
          if (useManualWalletStore?.getState()?.metamaskAddress === normalizedAddress && data.decimalPoint !== undefined) {
            useUserPreferencesStore.getState().setActiveDecimalDigits(data.decimalPoint);
          }

          // Prepare fresh data object
          const transactions = data.transactions || {};
          const transactionKeys = Object.keys(transactions);
          const targetKey = (transactionKeys.length > 0 && transactionKeys[0])
            ? transactionKeys[0].toLowerCase()
            : normalizedAddress;

          const normalizedData = {
            [targetKey]: { ...data, label: data.label || "Wallet" }
          };

          if (!currentController.signal.aborted) {
            set(state => ({
              activityData: { ...state.activityData, ...normalizedData },
              isLoading: false,
              lastUpdated: Date.now(),
              progress: 100,
              scanStatus: 'Scan Complete!'
            }));

            // Smooth progress bar cleanup instead of stuck their and confuse the user
            setTimeout(() => {
              if (!currentController.signal.aborted) get().resetProgress();
            }, 800);
          }

        } catch (error: any) {
          if (error.name === 'AbortError') return;

          console.error("Fetch Error - Restoring snapshot:", error.message);

          // RESTORE DATA: In case of error, put the old wallet data back into the state
          // so the Yield Summary doesn't show inconsistent or empty records.
          set(state => ({
            activityData: {
              ...state.activityData,
              [normalizedAddress]: previousWalletData || state.activityData[normalizedAddress]
            },
            error: "Could not refresh data. Showing last known records.",
            isLoading: false,
            isScanning: false,
            progress: 0
          }));

        } finally {
          if (activeAbortController === currentController) {
            if (activeProgressTimer) clearInterval(activeProgressTimer);
            if (activeEventSource) activeEventSource.close();
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