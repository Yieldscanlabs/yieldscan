import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatUnits } from 'viem';
import { useEffect } from 'react';
import Moralis from 'moralis';
import type { Asset } from '../types';
import tokens from '../utils/tokens';

// Auto-refresh interval in milliseconds (60 seconds)
const AUTO_REFRESH_INTERVAL = 60000;

// Moralis API configuration
const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API;
console.log(import.meta.env)

// Initialize Moralis SDK
if (!Moralis.Core.isStarted) {
  Moralis.start({
    apiKey: MORALIS_API_KEY
  });
}

// Map chain IDs to Moralis chain names
const chainIdToMoralisChain = {
  1: '0x1',       // Ethereum
  56: '0x38',     // BSC
  137: '0x89',    // Polygon
  42161: '0xa4b1', // Arbitrum
  8453: '0x2105'  // Base
} as const;
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
          const assets: Asset[] = [];
          const supportedChainIds = [...new Set(tokens.map(t => t.chainId))];
          
          // Fetch token balances for each supported chain
          const balancePromises = supportedChainIds.map(async (chainId) => {
            const moralisChain = chainIdToMoralisChain[chainId as keyof typeof chainIdToMoralisChain];
            if (!moralisChain) return null;
            
            // Fetch ERC20 tokens
            const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
              address: walletAddress,
              chain: moralisChain
            });
            
            // Fetch native token balance
            const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
              address: walletAddress,
              chain: moralisChain
            });
            
            return {
              chainId,
              tokenBalances: tokenBalances.toJSON(),
              nativeBalance: nativeBalance.toJSON()
            };
          });
          
          // Wait for all balance requests to complete
          const balanceResults = await Promise.all(balancePromises);
          
          // Process all tokens and find matches with balances from Moralis
          for (const token of tokens) {
            const chainResult = balanceResults.find(result => result?.chainId === token.chainId);
            
            if (!chainResult) continue;
            
            if (token.address === '0x') {
              // Handle native token
              const nativeBalanceRaw = BigInt(chainResult.nativeBalance.balance);
              if (nativeBalanceRaw > 0n) {
                const balance = formatUnits(nativeBalanceRaw, token.decimals);
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
            } else {
              // Handle ERC20 tokens
              const tokenBalance = chainResult.tokenBalances.find(
                (tb: any) => tb.token_address.toLowerCase() === token.address.toLowerCase()
              );
              
              if (tokenBalance && BigInt(tokenBalance.balance) > 0n) {
                const balance = formatUnits(BigInt(tokenBalance.balance), token.decimals);
                const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
                
                assets.push({
                  token: token.token,
                  address: token.address,
                  chain: token.chain,
                  maxDecimalsShow: token.maxDecimalsShow,
                  protocol: token.protocol,
                  withdrawContract: token.withdrawContract,
                  balance,
                  //@ts-ignore
                  withdrawUri: token?.withdrawUri,
                  yieldBearingToken: Boolean(token.yieldBearingToken),
                  chainId: token.chainId,
                  decimals: token.decimals,
                  balanceUsd,
                  icon: token.icon
                });
              }
            }
          }
          
          set({ 
            assets,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          console.error('Error fetching assets from Moralis:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching assets from Moralis',
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