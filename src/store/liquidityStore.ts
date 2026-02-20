import { create } from 'zustand';
import { API_BASE_URL } from '../utils/constants';
export interface LiquidityPosition {
  protocolName: string;
  protocolId: string;
  poolLabel: string;
  balanceUsd: number;
  tokens: { symbol: string; amount: string }[];
  mappedProtocol: string;
}
export interface LiquidityData {
  walletAddress: string;
  totalUsd: number;
  assets: string[];
  protocols: string[];
  matrix: Record<string, Record<string, number>>;
  positions: LiquidityPosition[];
}
interface LiquidityStore {
  data: LiquidityData | null; // Single wallet data
  liquidityDataByAddress: Record<string, LiquidityData>; // Multiple wallet data
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  fetchLiquidityForSingle: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  fetchLiquidityForMultiple: (addresses: string[], showLoading?: boolean) => Promise<void>;
  clearData: () => void;
  updateActiveView: (address: string | null, isConsolidated: boolean, addresses?: string[]) => void;
}

const fetchLiquidity = async (walletAddress: string): Promise<LiquidityData> => {
  const response = await fetch(`${API_BASE_URL}/api/liquidity/${walletAddress.toLowerCase()}`);
  console.log('fetchLiquidity', response);  // For debugging
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return await response.json();
};

export const useLiquidityStore = create<LiquidityStore>()((set, get) => ({
  data: null,
  liquidityDataByAddress: {},
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchLiquidityForSingle: async (walletAddress: string, showLoading = true) => {
    if (showLoading) set({ isLoading: true });
    set({ error: null });

    try {
      const data = await fetchLiquidity(walletAddress);
      const normalizedAddress = walletAddress.toLowerCase();

      set((state) => ({
        data,
        liquidityDataByAddress: {
          ...state.liquidityDataByAddress,
          [normalizedAddress]: data,
        },
        isLoading: false,
        lastUpdated: Date.now(),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  fetchLiquidityForMultiple: async (addresses: string[], showLoading = true) => {
    if (!addresses || addresses.length === 0) {
      set({ liquidityDataByAddress: {}, error: null, isLoading: false });
      return;
    }

    if (showLoading) set({ isLoading: true });
    set({ error: null });

    try {
      const fetchPromises = addresses.map(address => 
        fetchLiquidity(address).catch(err => {
          console.error(`Error fetching liquidity for ${address}:`, err);
          return {
            walletAddress: address,
            totalUsd: 0,
            assets: [],
            protocols: [],
            matrix: {},
            positions: [],
          };
        })
      );

      const results = await Promise.all(fetchPromises);

      const newLiquidityDataByAddress: Record<string, LiquidityData> = {};
      results.forEach((data) => {
        newLiquidityDataByAddress[data.walletAddress.toLowerCase()] = data;
      });

      set({
        liquidityDataByAddress: newLiquidityDataByAddress,
        isLoading: false,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  updateActiveView: (address: string | null, isConsolidated: boolean, addresses?: string[]) => {
    const state = get();
    
    if (isConsolidated && addresses && addresses.length > 0) {
      set({ data: null });
    } else if (address) {
      const normalizedAddress = address.toLowerCase();
      const walletData = state.liquidityDataByAddress[normalizedAddress] || null;
      set({ data: walletData });
    } else {
      set({ data: null });
    }
  },

  clearData: () => set({ data: null, liquidityDataByAddress: {}, error: null }),
}));