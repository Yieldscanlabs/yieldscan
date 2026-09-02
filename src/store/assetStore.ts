import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { formatUnits } from 'viem';
// import Moralis from 'moralis';
import type { Asset, Protocol } from '../types';
import { API_BASE_URL } from '../utils/constants';
// import { ethers } from 'ethers';
// import { useDepositsAndWithdrawalsStore } from './depositsAndWithdrawalsStore';

// Tracks what the store's shared active `assets` view is CURRENTLY supposed to
// be showing. fetchAssets and fetchAssetsForMultiple both write that field, so
// both check against this before committing their result. Unlike a simple
// "last call wins" counter, this only invalidates a result when the actual
// target (wallet address, or consolidated address set) changed -- two calls
// for the SAME target never invalidate each other, so redundant duplicate
// calls (e.g. an effect re-firing for the same wallet while other page state
// settles) can't accidentally discard a real, correct result.
let currentSingleTarget: string | null = null;
let currentConsolidatedTargetKey: string | null = null;

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
  workingCapitalByAddress: Record<string, number>;
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
      workingCapitalByAddress: {},
      isLoading: false,
      error: null,
      lastUpdated: null,
      autoRefreshEnabled: true,
      // 1. Single Wallet Fetch
      fetchAssets: async (walletAddress: string, showLoading = true) => {
        if (!walletAddress || walletAddress === '0x') {
          currentSingleTarget = null;
          set({ assets: [], error: null, isLoading: false });
          return;
        }

        const normalizedTarget = walletAddress.toLowerCase();
        // Switching to single-wallet mode means any pending consolidated
        // fetch's result is no longer relevant to what's being shown.
        currentSingleTarget = normalizedTarget;
        currentConsolidatedTargetKey = null;

        if (showLoading) set({ isLoading: true });
        set({ error: null });

        try {
          // Use the internal helper
          const { assets, dormantCapital, workingCapital } = await fetchWalletDataInternal(walletAddress, get, set);

          if (currentSingleTarget !== normalizedTarget) return;

          // Update the Active View (because this is a single fetch)
          set({
            assets: assets,
            dormantCapital,
            workingCapital,
            isLoading: false,
            lastUpdated: Date.now()
          });
        } catch (error) {
          if (currentSingleTarget !== normalizedTarget) return;

          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },

      fetchProtocols: async () => {
        const { protocols } = await getProtocols();
        set({ protocols })
      },

      // 2. Multiple Wallet Fetch (Consolidated)
      fetchAssetsForMultiple: async (addresses: string[], showLoading = true) => {
        if (!addresses || addresses.length === 0) {
          currentConsolidatedTargetKey = null;
          set({ assets: [], error: null, isLoading: false });
          return;
        }

        // Order-independent key identifying this exact set of wallets.
        const targetKey = addresses.map(a => a.toLowerCase()).sort().join(',');
        // Switching to consolidated mode means any pending single-wallet
        // fetch's result is no longer relevant to what's being shown.
        currentConsolidatedTargetKey = targetKey;
        currentSingleTarget = null;

        if (showLoading) set({ isLoading: true });
        set({ error: null });

        try {
          // Call internal helper for all addresses
          // This updates 'assetsByAddress' but DOES NOT touch 'isLoading' or 'assets'
          const fetchPromises = addresses.map(address =>
            fetchWalletDataInternal(address, get, set)
          );

          await Promise.all(fetchPromises);

          if (currentConsolidatedTargetKey !== targetKey) return;

          // NOW calculate consolidated view and update state ONCE
          const state = get();
          const consolidatedAssets: Asset[] = [];
          let totalDormantCapital = 0;
          let totalWorkingCapital = 0;
          addresses.forEach(address => {
            const addressLower = address.toLowerCase();
            const assets = state.assetsByAddress[addressLower] || [];
            const assetsWithSource = assets.map(asset => ({
              ...asset,
              walletAddress: address
            }));
            consolidatedAssets.push(...assetsWithSource);
            totalDormantCapital += state.dormantCapitalByAddress[addressLower] || 0;
            totalWorkingCapital += state.workingCapitalByAddress[addressLower] || 0;
          });

          set({
            assets: consolidatedAssets,
            dormantCapital: totalDormantCapital,
            workingCapital: totalWorkingCapital,
            lastUpdated: Date.now(),
            isLoading: false // <--- Only turn off loading HERE at the very end
          });
        } catch (error) {
          if (currentConsolidatedTargetKey !== targetKey) return;

          console.error('Error fetching assets for multiple addresses:', error);
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false
          });
        }
      },
      // Fetch assets for a specific wallet address
      // fetchAssets: async (walletAddress: string, showLoading = true) => {
      //   if (!walletAddress || walletAddress === '0x') {
      //     set({ assets: [], error: null, isLoading: false });
      //     return;
      //   }

      //   // Only show loading state if explicitly requested
      //   if (showLoading) {
      //     set({ isLoading: true });
      //   }

      //   set({ error: null });

      //   try {

      //     // // Update assetsByAddress and dormantCapitalByAddress
      //     const { assets, dormantCapital, workingCapital } = await getWalletYields(walletAddress)
      //     const state = get();

      //     const newAssetsByAddress = {
      //       ...state.assetsByAddress,
      //       [walletAddress.toLowerCase()]: assets
      //     };
      //     const newDormantCapitalByAddress = {
      //       ...state.dormantCapitalByAddress,
      //       [walletAddress.toLowerCase()]: dormantCapital
      //     };

      //     set({
      //       assets: assets,
      //       assetsByAddress: newAssetsByAddress,
      //       dormantCapital,
      //       workingCapital,
      //       dormantCapitalByAddress: newDormantCapitalByAddress,
      //       isLoading: false,
      //       lastUpdated: Date.now()
      //     });
      //   } catch (error) {
      //     console.error('Error fetching assets from Moralis:', error);
      //     set({
      //       error: error instanceof Error ? error.message : 'Unknown error fetching assets from Moralis',
      //       isLoading: false
      //     });
      //   }
      // },

      // fetchProtocols: async () => {
      //   const { protocols } = await getProtocols();
      //   set({ protocols })
      // },

      // Fetch assets for multiple addresses
      // fetchAssetsForMultiple: async (addresses: string[], showLoading = true) => {
      //   if (!addresses || addresses.length === 0) {
      //     set({ assets: [], error: null, isLoading: false });
      //     return;
      //   }

      //   if (showLoading) {
      //     set({ isLoading: true });
      //   }

      //   set({ error: null });

      //   try {
      //     // Fetch assets for all addresses in parallel
      //     const fetchPromises = addresses.map(address =>
      //       get().fetchAssets(address, false)  // Don't show loading for individual fetches
      //     );

      //     await Promise.all(fetchPromises);

      //     // Update consolidated view
      //     const state = get();
      //     const consolidatedAssets: Asset[] = [];
      //     let totalDormantCapital = 0;

      //     addresses.forEach(address => {
      //       const addressLower = address.toLowerCase();
      //       const assets = state.assetsByAddress[addressLower] || [];
      //       // Add walletAddress field to each asset for identification
      //       const assetsWithSource = assets.map(asset => ({
      //         ...asset,
      //         walletAddress: address
      //       }));
      //       consolidatedAssets.push(...assetsWithSource);
      //       totalDormantCapital += state.dormantCapitalByAddress[addressLower] || 0;
      //     });

      //     set({
      //       assets: consolidatedAssets,
      //       dormantCapital: totalDormantCapital,
      //       lastUpdated: Date.now()
      //     });
      //   } catch (error) {
      //     console.error('Error fetching assets for multiple addresses:', error);
      //     set({
      //       error: error instanceof Error ? error.message : 'Unknown error fetching assets',
      //       isLoading: false
      //     });
      //   }finally{
      //     console.log("FINALY executed: stopping loading: , ", showLoading);
      //     set({
      //       isLoading: false
      //     });
      //     alert("FINALY executed: stopping loading: , " + showLoading);
      //   }
      // },

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
let totalWorkingCapital = 0;
          allAddresses.forEach(addr => {
            const addrLower = addr.toLowerCase();
            const assets = state.assetsByAddress[addrLower] || [];
            const assetsWithSource = assets.map(asset => ({
              ...asset,
              walletAddress: addr
            }));
            consolidatedAssets.push(...assetsWithSource);
            totalDormantCapital += state.dormantCapitalByAddress[addrLower] || 0;
            totalWorkingCapital += state.workingCapitalByAddress[addrLower] || 0;
          });

          set({
            assets: consolidatedAssets,
            dormantCapital: totalDormantCapital,
            workingCapital: totalWorkingCapital
          });
        } else if (address) {
          // Single wallet view
          const addrLower = address.toLowerCase();
          const assets = state.assetsByAddress[addrLower] || [];
          const dormantCapital = state.dormantCapitalByAddress[addrLower] || 0;
          const workingCapital = state.workingCapitalByAddress[addrLower] || 0;
          set({
            assets,
            dormantCapital,
            workingCapital
          });
        } else {
          // No wallet
          set({
            assets: [],
            dormantCapital: 0,
            workingCapital: 0
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
        // Needed so mergeWithLastKnownGood has something to fall back to
        // after a page reload or a fresh visit, not just during in-tab
        // auto-refresh polling -- the original problem this fixes (a
        // balance check failing and flashing to $0) was first observed
        // across separate page loads, not just while one tab stayed open.
        assetsByAddress: state.assetsByAddress,
        dormantCapitalByAddress: state.dormantCapitalByAddress,
        workingCapitalByAddress: state.workingCapitalByAddress,
      }),
    }
  )
);

// Protocols counted toward workingCapital -- mirrors the backend's PROTOCOLS
// list in calculateWalletCapitals exactly (constants/protocols.ts), minus
// Aerodrome, which that function's own filter also excludes.
const WORKING_CAPITAL_PROTOCOLS = new Set([
  'Aave', 'Compound', 'Radiant', 'Dolomite', 'Euler', 'Maple', 'Zerolend',
  'Sparklend', 'Ethena', 'Cream Finance', 'Flux Finance', 'Kinza Finance',
  'Yearn V3',
]);

// For any asset whose balance check genuinely failed this run, keep showing
// whatever was last confirmed for that exact same position instead of the
// backend's unconfirmed placeholder value. Anything the backend confirmed,
// even a real, lower number, passes through untouched -- only a value
// explicitly marked "couldn't check" gets held back, so a real deposit or
// withdrawal always shows immediately and correctly. See project memory
// entry on this fix for the full reasoning.
const mergeWithLastKnownGood = (freshAssets: Asset[], previousAssets: Asset[] | undefined): Asset[] => {
  if (!previousAssets || previousAssets.length === 0) return freshAssets;

  const previousByKey = new Map<string, Asset>();
  for (const asset of previousAssets) {
    previousByKey.set(`${asset.token}-${asset.chainId}-${asset.protocol}`, asset);
  }

  return freshAssets.map((asset) => {
    if (!asset.balanceCheckFailed && !asset.protocolBalanceCheckFailed) return asset;

    const previous = previousByKey.get(`${asset.token}-${asset.chainId}-${asset.protocol}`);
    if (!previous) return asset;

    const merged = { ...asset };
    if (asset.balanceCheckFailed) {
      merged.balance = previous.balance;
      merged.balanceUsd = previous.balanceUsd;
    }
    if (asset.protocolBalanceCheckFailed) {
      merged.currentBalanceInProtocol = previous.currentBalanceInProtocol;
      merged.currentBalanceInProtocolUsd = previous.currentBalanceInProtocolUsd;
    }
    return merged;
  });
};

// Recomputes dormantCapital/workingCapital from a (possibly merged) asset
// list, mirroring the backend's calculateWalletCapitals exactly (same dedup
// rules), since the backend's own totals exclude anything it couldn't
// confirm this run -- after merging in last-known-good values here, those
// need to be added back in the same way the backend would have counted them.
const recalculateCapitals = (assets: Asset[]): { dormantCapital: number; workingCapital: number } => {
  const seenTokenChains = new Set<string>();
  let dormantCapital = 0;
  for (const asset of assets) {
    const key = `${asset.token}-${asset.chain}`;
    if (seenTokenChains.has(key)) continue;
    seenTokenChains.add(key);
    const value = parseFloat(asset.balanceUsd || '0');
    if (!isNaN(value)) dormantCapital += value;
  }

  const seenPositions = new Set<string>();
  let workingCapital = 0;
  for (const asset of assets) {
    if (!asset.yieldBearingToken || !asset.protocol || !WORKING_CAPITAL_PROTOCOLS.has(asset.protocol)) continue;
    if (asset.underlyingAsset) {
      const positionKey = `${asset.protocol}:${asset.chainId}:${asset.underlyingAsset.toLowerCase()}`;
      if (seenPositions.has(positionKey)) continue;
      seenPositions.add(positionKey);
    }
    const value = parseFloat(asset.currentBalanceInProtocolUsd || '0');
    if (!isNaN(value)) workingCapital += value;
  }

  return { dormantCapital, workingCapital };
};

// Helper to just fetch data without messing with the View State (isLoading/assets)
const fetchWalletDataInternal = async (walletAddress: string, get: () => AssetStore, set: any) => {
  try {
    const { assets: freshAssets } = await getWalletYields(walletAddress);
    const state = get();
    const addressKey = walletAddress.toLowerCase();

    const assets = mergeWithLastKnownGood(freshAssets, state.assetsByAddress[addressKey]);
    const { dormantCapital, workingCapital } = recalculateCapitals(assets);

    const newAssetsByAddress = {
      ...state.assetsByAddress,
      [addressKey]: assets
    };
    const newDormantCapitalByAddress = {
      ...state.dormantCapitalByAddress,
      [addressKey]: dormantCapital
    };

    const newWorkingCapitalByAddress = {
      ...state.workingCapitalByAddress,
      [addressKey]: workingCapital
    };
    // Only update the data cache, NOT the active view 'assets' or 'isLoading'
    set({
      assetsByAddress: newAssetsByAddress,
      dormantCapitalByAddress: newDormantCapitalByAddress,
      workingCapitalByAddress: newWorkingCapitalByAddress
    });

    return { assets, dormantCapital, workingCapital };
  } catch (error) {
    console.error(`Error fetching for ${walletAddress}:`, error);
    throw error;
  }
};