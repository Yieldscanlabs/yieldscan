import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { formatUnits } from 'viem';
import { useEffect } from 'react';
// import Moralis from 'moralis';
import type { Asset, Protocol } from '../types';
import { API_BASE_URL } from '../utils/constants';
// import { ethers } from 'ethers';
// import { useDepositsAndWithdrawalsStore } from './depositsAndWithdrawalsStore';

// Auto-refresh interval in milliseconds (60 seconds)
const AUTO_REFRESH_INTERVAL = 60000;

// API endpoint for fetching tokens/assets
// const ASSETS_API_ENDPOINT = API_BASE_URL + '/api/assets?limit=100&includeDisabled=false';
// const CHAINS_API_ENDPOINT = API_BASE_URL + '/api/chains?limit=100';
const WALLET_YIELDS_API_ENDPOINT = API_BASE_URL + '/api/assets/yields';
const PROTOCOLS_API_ENDPOINT = API_BASE_URL + '/api/protocols';

// // Moralis API configuration
// const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API;

// // Initialize Moralis SDK
// if (!Moralis.Core.isStarted) {
//   Moralis.start({
//     apiKey: MORALIS_API_KEY
//   });
// }

// // Map chain IDs to Moralis chain names
// const chainIdToMoralisChain = {
//   1: '0x1',       // Ethereum
//   56: '0x38',     // BSC
//   // 137: '0x89',    // Polygon
//   42161: '0xa4b1', // Arbitrum
//   // 8453: '0x2105'  // Base
// } as const;

// Async function to fetch tokens from API
// async function fetchTokens() {
//   const response = await fetch(ASSETS_API_ENDPOINT);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   const data = await response.json();
//   if (!data.assets || !Array.isArray(data.assets)) {
//     throw new Error('Invalid response format: expected assets array');
//   }
//   return data.assets;
// }

async function getWalletYields(walletAddress: string) {
  const response = await fetch(`${WALLET_YIELDS_API_ENDPOINT}/${walletAddress}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.assets || !Array.isArray(data.assets)) {
    throw new Error('Invalid response format: expected assets array');
  }
  return data;
}

async function getProtocols() {
  const response = await fetch(`${PROTOCOLS_API_ENDPOINT}?limit=100`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!data.protocols || !Array.isArray(data.protocols)) {
    throw new Error('Invalid response format: expected protocols array');
  }
  return data;
}

// async function fetchChains(): Promise<Chain[]> {
//   const response = await fetch(CHAINS_API_ENDPOINT);
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   const data = await response.json();
//   if (!data.chains || !Array.isArray(data.chains)) {
//     throw new Error('Invalid response format: expected assets array');
//   }
//   return data.chains;
// }

interface AssetStore {
  // State
  assets: Asset[];  // Current view (active wallet or consolidated)
  protocols: Protocol[]
  assetsByAddress: Record<string, Asset[]>;  // Per-address asset storage
  dormantCapital: number;
  workingCapital: number;
  dormantCapitalByAddress: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  autoRefreshEnabled: boolean;

  // Actions
  fetchAssets: (address: string, showLoading?: boolean) => Promise<void>;
  fetchProtocols: () => Promise<void>;
  fetchAssetsForMultiple: (addresses: string[], showLoading?: boolean) => Promise<void>;
  getAssetsForAddress: (address: string) => Asset[];
  getConsolidatedAssets: () => Asset[];
  updateActiveView: (address: string | null, isConsolidated: boolean, allAddresses?: string[]) => void;
  clearErrors: () => void;
  setAutoRefresh: (enabled: boolean) => void;
  getAssetByAddress: (address: string, chainId: number) => Asset | undefined;
  setAssets: (assets: Asset[]) => void;
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      assets: [],
      protocols: [],
      assetsByAddress: {},
      dormantCapital: 0,
      workingCapital: 0,
      dormantCapitalByAddress: {},
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
          // const assets: Asset[] = [];

          // // First, fetch the available tokens from the API
          // const tokens = await fetchTokens();
          // const chains = await fetchChains();
          // const supportedChainIds = [...new Set(tokens.map((t: any) => t.chain.chainId))];
          // console.log({ tokens })
          // // Fetch token balances for each supported chain
          // let dormantCapital = 0;
          // const balancePromises = supportedChainIds.map(async (chainId) => {
          //   const moralisChain = chainIdToMoralisChain[chainId as keyof typeof chainIdToMoralisChain];
          //   const tokenChain = tokens.find((t: any) => t.chain.chainId === chainId);
          //   const chain = chains.find(chain => chain.chainId === chainId)
          //   const balanceUsd = chain?.usdPrice || 0;
          //   if (!moralisChain) return null;

          //   // Fetch ERC20 tokens
          //   const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
          //     address: walletAddress,
          //     chain: moralisChain
          //   });

          //   // Fetch native token balance
          //   const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
          //     address: walletAddress,
          //     chain: moralisChain
          //   });

          //   const nativeBalanceRaw = BigInt(nativeBalance.toJSON().balance);
          //   const nativeBalanceFormatted = formatUnits(nativeBalanceRaw, tokenChain?.decimals || 18);
          //   dormantCapital += (parseFloat(nativeBalanceFormatted) * balanceUsd);

          //   return {
          //     chainId,
          //     tokenBalances: tokenBalances.toJSON(),
          //     nativeBalance: nativeBalance.toJSON()
          //   };
          // });

          // // Wait for all balance requests to complete
          // const balanceResults = await Promise.all(balancePromises);
          // // Process all tokens and find matches with balances from Moralis
          // for (const token of tokens) {
          //   const chainResult = balanceResults.find(result => result?.chainId === token.chain.chainId);

          //   if (!chainResult) continue;
          //   if (!ethers.isAddress(token.address)) {
          //     // Handle native token
          //     const nativeBalanceRaw = BigInt(chainResult.nativeBalance.balance);
          //     console.log({ nativeBalanceRaw });

          //     // if (nativeBalanceRaw > 0n) {
          //     const balance = formatUnits(nativeBalanceRaw, token.decimals);
          //     const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();

          //     for (const def of token.definitions || []) {
          //       const tokenBalanceY = chainResult.tokenBalances.find(
          //         (tb: any) => tb.token_address.toLowerCase() === def.yieldBearingToken.toLowerCase()
          //       );
          //       let balanceY = '0';
          //       let balanceUsdY = '0';
          //       if (tokenBalanceY && BigInt(tokenBalanceY.balance) > 0n) {
          //         balanceY = formatUnits(BigInt(tokenBalanceY.balance), token.decimals);
          //         balanceUsdY = (parseFloat(balanceY) * token.usdPrice).toString();
          //       }
          //       assets.push({
          //         id: token.id,
          //         token: token.symbol,
          //         address: "0x",
          //         chain: token.chain.name,
          //         maxDecimalsShow: token.maxDecimalsShow,
          //         protocol: def.protocol.name,
          //         withdrawContract: def.withdraw,
          //         underlyingAsset: def.underlyingAsset,
          //         balance,
          //         yieldBearingToken: Boolean(def.yieldBearingToken),
          //         chainId: Number(token.chain.chainId),
          //         decimals: token.decimals,
          //         balanceUsd,
          //         icon: API_BASE_URL + token.image,
          //         withdrawUri: def.withdrawUri, // or token?.withdrawUri if you want
          //         usd: token.usdPrice,
          //         currentBalanceInProtocol: Number(balanceY),
          //         currentBalanceInProtocolUsd: balanceUsdY
          //       });
          //     }
          //     // }
          //   } else {
          //     // Handle ERC20 tokens
          //     const tokenBalance = chainResult.tokenBalances.find(
          //       (tb: any) => tb.token_address.toLowerCase() === token.address.toLowerCase()
          //     );

          //     // if (tokenBalance && BigInt(tokenBalance.balance) > 0n) {
          //     const balance = formatUnits(BigInt(tokenBalance ? tokenBalance.balance : "0"), token.decimals);
          //     const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
          //     for (const def of token.definitions || []) {

          //       const tokenBalanceY = chainResult.tokenBalances.find(
          //         (tb: any) => tb.token_address.toLowerCase() === def.yieldBearingToken.toLowerCase()
          //       );
          //       let balanceY = '0';
          //       let balanceUsdY = '0';
          //       if (tokenBalanceY && BigInt(tokenBalanceY.balance) > 0n) {
          //         balanceY = formatUnits(BigInt(tokenBalanceY.balance), tokenBalanceY.decimals);
          //         balanceUsdY = (parseFloat(balanceY) * token.usdPrice).toString();
          //       }

          //       assets.push({
          //         id: token.id,
          //         token: token.symbol,
          //         address: token.address,
          //         chain: token.chain.name,
          //         maxDecimalsShow: token.maxDecimalsShow,
          //         protocol: def.protocol.name,
          //         withdrawContract: def.withdraw,
          //         underlyingAsset: def.underlyingAsset,
          //         balance,
          //         yieldBearingToken: Boolean(def.yieldBearingToken),
          //         chainId: Number(token.chain.chainId),
          //         decimals: token.decimals,
          //         balanceUsd,
          //         icon: API_BASE_URL + token.image,
          //         withdrawUri: def.withdrawUri, // or token?.withdrawUri
          //         usd: token.usdPrice,
          //         currentBalanceInProtocol: Number(balanceY),
          //         currentBalanceInProtocolUsd: balanceUsdY
          //       });
          //     }
          //     // }
          //   }
          // }

          // dormantCapital += assets.reduce((acc, val) => acc + Number(val?.currentBalanceInProtocolUsd || 0), 0)

          // // Update assetsByAddress and dormantCapitalByAddress
          const { assets, dormantCapital, workingCapital } = await getWalletYields(walletAddress)
          const state = get();

          const newAssetsByAddress = {
            ...state.assetsByAddress,
            [walletAddress.toLowerCase()]: assets
          };
          const newDormantCapitalByAddress = {
            ...state.dormantCapitalByAddress,
            [walletAddress.toLowerCase()]: dormantCapital
          };

          set({
            assets: assets,
            assetsByAddress: newAssetsByAddress,
            dormantCapital,
            workingCapital,
            dormantCapitalByAddress: newDormantCapitalByAddress,
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

      fetchProtocols: async () => {
        const { protocols } = await getProtocols();
        set({ protocols })
      },

      // Fetch assets for multiple addresses
      fetchAssetsForMultiple: async (addresses: string[], showLoading = true) => {
        if (!addresses || addresses.length === 0) {
          set({ assets: [], error: null, isLoading: false });
          return;
        }

        if (showLoading) {
          set({ isLoading: true });
        }

        set({ error: null });

        try {
          // Fetch assets for all addresses in parallel
          const fetchPromises = addresses.map(address =>
            get().fetchAssets(address, false)  // Don't show loading for individual fetches
          );

          await Promise.all(fetchPromises);

          // Update consolidated view
          const state = get();
          const consolidatedAssets: Asset[] = [];
          let totalDormantCapital = 0;

          addresses.forEach(address => {
            const addressLower = address.toLowerCase();
            const assets = state.assetsByAddress[addressLower] || [];
            // Add walletAddress field to each asset for identification
            const assetsWithSource = assets.map(asset => ({
              ...asset,
              walletAddress: address
            }));
            consolidatedAssets.push(...assetsWithSource);
            totalDormantCapital += state.dormantCapitalByAddress[addressLower] || 0;
          });

          set({
            assets: consolidatedAssets,
            dormantCapital: totalDormantCapital,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          console.error('Error fetching assets for multiple addresses:', error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error fetching assets',
            isLoading: false
          });
        }
      },

      // Get assets for a specific address
      getAssetsForAddress: (address: string) => {
        const state = get();
        return state.assetsByAddress[address.toLowerCase()] || [];
      },

      // Get consolidated assets from all addresses
      getConsolidatedAssets: () => {
        const state = get();
        const consolidatedAssets: Asset[] = [];
        Object.entries(state.assetsByAddress).forEach(([address, assets]) => {
          const assetsWithSource = assets.map(asset => ({
            ...asset,
            walletAddress: address
          }));
          consolidatedAssets.push(...assetsWithSource);
        });
        return consolidatedAssets;
      },

      // Update active view based on address and consolidation mode
      updateActiveView: (address: string | null, isConsolidated: boolean, allAddresses?: string[]) => {
        const state = get();
        if (isConsolidated && allAddresses && allAddresses.length > 0) {
          // Consolidated view
          const consolidatedAssets: Asset[] = [];
          let totalDormantCapital = 0;

          allAddresses.forEach(addr => {
            const addrLower = addr.toLowerCase();
            const assets = state.assetsByAddress[addrLower] || [];
            const assetsWithSource = assets.map(asset => ({
              ...asset,
              walletAddress: addr
            }));
            consolidatedAssets.push(...assetsWithSource);
            totalDormantCapital += state.dormantCapitalByAddress[addrLower] || 0;
          });

          set({
            assets: consolidatedAssets,
            dormantCapital: totalDormantCapital
          });
        } else if (address) {
          // Single wallet view
          const addrLower = address.toLowerCase();
          const assets = state.assetsByAddress[addrLower] || [];
          const dormantCapital = state.dormantCapitalByAddress[addrLower] || 0;
          set({
            assets,
            dormantCapital
          });
        } else {
          // No wallet
          set({
            assets: [],
            dormantCapital: 0
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
      setAssets: (assets: Asset[]) => set({ assets })
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