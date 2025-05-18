import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatUnits } from 'viem';
import { readContracts } from 'wagmi/actions';
import { useEffect } from 'react'; // Missing import
import type { Asset } from '../types';
import tokens from '../utils/tokens';
import { mainnet, arbitrum } from 'wagmi/chains'
import { createConfig, useReadContracts } from 'wagmi';
import { config } from '../main';

// ERC20 ABI (minimal for balance checking)
const erc20ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// Auto-refresh interval in milliseconds (30 seconds)
const AUTO_REFRESH_INTERVAL = 5000;

interface AssetStore {
  // State
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;
  
  // Actions
  fetchAssets: (address: string, showLoading?: boolean) => Promise<void>;
  clearErrors: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  getAssetByAddress: (address: string, chainId: number) => Asset | undefined;
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      assets: [],
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,

      // Fetch assets for a specific wallet address
      fetchAssets: async (walletAddress: string, showLoading = true) => {
        if (!walletAddress || walletAddress === '0x') {
          set({ assets: [], error: null, isLoading: false });
          return;
        }

        // Only show loading state if explicitly requested
        if (showLoading) {
          set({ isLoading: true });
        }
        
        set({ error: null });
        
        try {
          // Create contract calls for all tokens
          const contractCalls = tokens.flatMap(token => [
            {
              address: token.address as `0x${string}`,
              abi: erc20ABI,
              functionName: 'balanceOf',
              args: [walletAddress as `0x${string}`],
              chainId: token.chainId as 1 | 42161 | 56  // Restrict to supported chain IDs
            }
          ]);
        
          // Use readContracts action instead of useReadContracts hook
          const data = await readContracts(config, {
            contracts: contractCalls
          });
        
          // Process the results
          const assets: Asset[] = [];
          
          tokens.forEach((token, index) => {
            if (data && data[index]?.result) {
              const rawBalance = BigInt(data[index]?.result || 0);
              if (rawBalance > 0n) {
                const balance = formatUnits(rawBalance, token.decimals);
                const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
                
                assets.push({
                  //@ts-ignore
                  token: token.token,
                  address: token.address,
                  chain: token.chain,
                  maxDecimalsShow: token.maxDecimalsShow,
                  protocol: token.protocol,
                  withdrawContract: token.withdrawContract,
                  balance,
                  yieldBearingToken: Boolean(token.yieldBearingToken),
                  chainId: token.chainId,
                  decimals: token.decimals,
                  balanceUsd,
                  icon: token.icon
                });
              }
            }
          });
          
          set({ 
            assets,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching assets',
            isLoading: false
          });
        }
      },

      // Clear any error messages
      clearErrors: () => set({ error: null }),

      // Enable or disable auto-refresh
      setAutoRefresh: (enabled: boolean) => set({ autoRefreshEnabled: enabled }),
      
      // Get an asset by its address and chain ID
      getAssetByAddress: (address: string, chainId: number) => {
        const state = get();
        return state.assets.find(
          asset => asset.address.toLowerCase() === address.toLowerCase() && asset.chainId === chainId
        );
      },
    }),
    {
      name: 'yieldscan-asset-store',
      partialize: (state) => ({
        assets: state.assets,
        lastUpdated: state.lastUpdated,
        autoRefreshEnabled: state.autoRefreshEnabled,
      }),
    }
  )
);

// Track if auto-refresh has been set up already using a module-level variable
let autoRefreshInitialized = false;

/**
 * Hook that sets up auto-refresh for asset data
 * @param address The wallet address to fetch assets for
 */
export function useAssetAutoRefresh(address: string) {
  const { fetchAssets, autoRefreshEnabled } = useAssetStore();
  
  useEffect(() => {
    if (!address || address === '0x' || autoRefreshInitialized) {
      return;
    }
    
    autoRefreshInitialized = true;
    
    // Initial fetch
    fetchAssets(address, true);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled (checking latest state)
      if (useAssetStore.getState().autoRefreshEnabled) {
        // Use silent refresh (no loading state)
        fetchAssets(address, false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
      autoRefreshInitialized = false;
    };
  }, [address, fetchAssets, autoRefreshEnabled]);
}