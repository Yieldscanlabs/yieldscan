import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatUnits } from 'viem';
import { readContracts, getBalance } from 'wagmi/actions';
import { useEffect } from 'react'; // Missing import
import type { Asset } from '../types';
import tokens from '../utils/tokens';
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
const AUTO_REFRESH_INTERVAL = 60000;

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
          // Create contract calls for all non-native tokens
          const contractCalls = tokens
            .filter(token => token.address !== '0x')
            .flatMap(token => [
              {
                address: token.address as `0x${string}`,
                abi: erc20ABI,
                functionName: 'balanceOf',
                args: [walletAddress as `0x${string}`],
                chainId: token.chainId as 1 | 42161 | 56 | 8453
              }
            ]);
        
          // Use readContracts action for ERC20 tokens
          const data = await readContracts(config, {
            contracts: contractCalls
          });
        
          // Process the results
          const assets: Asset[] = [];
          
          // Process ERC20 tokens
          let dataIndex = 0;
          
          // Process all tokens
          for (const token of tokens) {
            if (token.address === '0x') {
              // Handle native token
              try {
                const balance = await getBalance(config, {
                  address: walletAddress as `0x${string}`,
                  chainId: token.chainId as 1 | 42161 | 56 | 8453
                });
                
                if (balance.value > 0n) {
                  const balanceStr = formatUnits(balance.value, token.decimals);
                  const balanceUsd = (parseFloat(balanceStr) * token.usdPrice).toString();
                  
                  assets.push({
                    token: token.token,
                    address: token.address,
                    chain: token.chain,
                    maxDecimalsShow: token.maxDecimalsShow,
                    protocol: token.protocol,
                    withdrawContract: token.withdrawContract,
                    balance: balanceStr,
                    yieldBearingToken: Boolean(token.yieldBearingToken),
                    chainId: token.chainId,
                    decimals: token.decimals,
                    balanceUsd,
                    icon: token.icon
                  });
                }
              } catch (error) {
                console.error(`Error fetching native token balance for ${token.token}:`, error);
              }
            } else if (data && data[dataIndex]?.result) {
              const rawBalance = BigInt(data[dataIndex]?.result || 0);
              if (rawBalance > 0n) {
                const balance = formatUnits(rawBalance, token.decimals);
                const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
                
                assets.push({
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
              dataIndex++;
            }
          }
          
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
    
    // Track if the tab is visible
    let isTabVisible = !document.hidden;
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      
      // If tab becomes visible and auto-refresh is enabled, do an immediate refresh
      if (isTabVisible && useAssetStore.getState().autoRefreshEnabled) {
        fetchAssets(address, false);
      }
    };
    
    // Register visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up auto-refresh interval
    const intervalId = setInterval(() => {
      // Only fetch if auto-refresh is enabled AND tab is visible
      if (useAssetStore.getState().autoRefreshEnabled && isTabVisible) {
        // Use silent refresh (no loading state)
        fetchAssets(address, false);
      }
    }, AUTO_REFRESH_INTERVAL);
    
    // Clean up interval and event listener on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      autoRefreshInitialized = false;
    };
  }, [address, fetchAssets, autoRefreshEnabled]);
}