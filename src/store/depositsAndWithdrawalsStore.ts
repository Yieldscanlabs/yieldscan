import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import { useUserPreferencesStore } from './userPreferencesStore';
import { useManualWalletStore } from './manualWalletStore';
import axios from 'axios';
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

// Track active fetch promises by wallet address to prevent 429s 🛡️
const inFlightRequests = new Map<string, Promise<void>>();

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
        const previousData = get().activityData[normalizedAddress];

        // Optimistic Update 
        set((state) => ({
          activityData: {
            ...state.activityData,
            [normalizedAddress]: {
              ...(state.activityData[normalizedAddress] || {
                totalDeposits: 0, currentDeposit: 0, totalEarnings: 0, currentEarnings: 0,
                totalWithdrawals: 0, userBalance: 0, transactions: {}
              }),
              label
            }
          }
        }));

        const performUpdate = async () => {
          const response = await fetch(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label })
          });

          if (response.status === 404) {
            // Not found? Sync data first 🔄
            await get().fetchUserActivity(walletAddress, false);

            // Retry update after sync 🔁
            const retry = await fetch(`${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ label })
            });
            if (!retry.ok) throw new Error("Sync succeeded, but label update failed.");
            return;
          }

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to save label');
          }
        };

        try {
          await performUpdate();
        } catch (error) {
          // 🔙 Rollback UI on final failure
          set((state) => ({
            activityData: { ...state.activityData, [normalizedAddress]: previousData }
          }));
          throw error;
        }
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
        inFlightRequests.clear();
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
        if (!walletAddress || walletAddress === '0x') {
          set({ activityData: {}, error: null, isLoading: false });
          return;
        }

        const normalizedAddress = walletAddress.toLowerCase();

        // 🛡️ DEDUPLICATION: Return existing promise if already fetching this specific wallet
        if (inFlightRequests.has(normalizedAddress)) {
          return inFlightRequests.get(normalizedAddress);
        }

        const fetchPromise = (async () => {
          // Capture state before starting
          const previousWalletData = get().activityData[normalizedAddress];
          const controller = new AbortController();
          const requestId = generateId();

          const hasExistingData = !!previousWalletData;
          const shouldShowProgressBar = showLoading && !hasExistingData;

          // Only set global isLoading if we're actually showing a loader
          if (showLoading) set({ isLoading: true });

          let progressTimer: NodeJS.Timeout | null = null;
          let eventSource: EventSource | null = null;

          if (shouldShowProgressBar) {
            set({ isScanning: true, progress: 5, scanStatus: `Initializing scan for ${normalizedAddress.slice(0, 6)}...` });

            progressTimer = setInterval(() => {
              set((state) => ({
                // 📈 Smooth increment logic
                progress: state.progress >= 90 ? state.progress : state.progress + (Math.random() * 2)
              }));
            }, 200);

            try {
              eventSource = new EventSource(`${API_BASE_URL}/api/long-task/progress?requestId=${requestId}`);
              eventSource.onmessage = (event) => {
                if (controller.signal.aborted) return;
                if (event.data === "done") {
                  eventSource?.close();
                  set({ scanStatus: 'Finalizing data calculation...' });
                } else {
                  try {
                    const data = JSON.parse(event.data);
                    const totalTx = Object.values(data).reduce((a: any, b: any) => Number(a) + Number(b), 0);
                    set({ scanStatus: `Scanning: ${totalTx} transactions found` });
                  } catch (e) { console.warn("SSE Parse Error", e); }
                }
              };
              eventSource.onerror = () => eventSource?.close();
            } catch (e) { console.error("SSE Connection Error", e); }
          }

          try {
            const url = `${USER_DETAILS_API_ENDPOINT}/${normalizedAddress}?requestId=${requestId}`;

            // 🚀 AXIOS: Using the auto-transforming client
            const response = await axios.get(url, { signal: controller.signal });
            const data = response.data;

            if (!data) throw new Error("API returned success but data is empty");

            // Preferences Sync
            if (useManualWalletStore?.getState()?.metamaskAddress === normalizedAddress && data.decimalPoint !== undefined) {
              useUserPreferencesStore.getState().setActiveDecimalDigits(data.decimalPoint);
            }

            // 🎯 DATA MAPPING: Ensure data is stored under the requested address key
            // This prevents UI "flicker" where the data disappears and reappears under a new key.
            const finalData = {
              ...data,
              label: data.label || previousWalletData?.label // 🏷️ Persistence: Preserve label if API returns null
            };

            if (!controller.signal.aborted) {
              set(state => ({
                activityData: {
                  ...state.activityData,
                  [normalizedAddress]: finalData
                },
                isLoading: false,
                lastUpdated: Date.now(),
                progress: 100,
                scanStatus: 'Scan Complete!'
              }));
            }
          } catch (error: any) {
            if (axios.isCancel(error)) return;

            console.error(`❌ Fetch Error for ${normalizedAddress}:`, error.message);

            // 🔙 ROLLBACK: Restore previous state if fetch fails
            set(state => ({
              activityData: {
                ...state.activityData,
                [normalizedAddress]: previousWalletData || state.activityData[normalizedAddress]
              },
              error: "Sync failed. Showing last cached data.",
              isLoading: false,
              isScanning: false,
              progress: 0
            }));
          } finally {
            // 🏁 FINAL CLEANUP
            inFlightRequests.delete(normalizedAddress);
            if (progressTimer) clearInterval(progressTimer);
            if (eventSource) eventSource.close();
            // Added for DEBUGGING purpose
            console.log("inFlightRequests: ", inFlightRequests)
            setTimeout(() => {
              if (inFlightRequests.size === 0) {
                get().resetProgress();
              }
            }, 1500);
          }
        })();

        inFlightRequests.set(normalizedAddress, fetchPromise);
        return fetchPromise;
      },
      resetProgress: () => {
        set({
          progress: 0,
          scanStatus: '',
          isScanning: false,
          isLoading: false
        });
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