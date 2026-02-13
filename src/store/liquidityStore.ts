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
  data: LiquidityData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;

  fetchLiquidity: (walletAddress: string, showLoading?: boolean) => Promise<void>;
  clearData: () => void;
}

export const useLiquidityStore = create<LiquidityStore>()((set) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchLiquidity: async (walletAddress: string, showLoading = true) => {
    if (showLoading) set({ isLoading: true });
    set({ error: null });

    try {
      const response = await fetch(`${API_BASE_URL}/api/liquidity/${walletAddress}`);
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data: LiquidityData = await response.json();

      console.log('Liquidity data:', data); // For debugging

      set({
        data,
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

  clearData: () => set({ data: null, error: null }),
}));