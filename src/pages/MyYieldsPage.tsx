import React, { useState, useEffect, useMemo } from 'react';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import { useApyStore } from '../store/apyStore';
import { useEarnStore } from '../store/earnStore';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import YieldCard from '../components/YieldCard/YieldCard';
import type { OptimizationData } from '../components/YieldCard/types';
import { useAssetStore } from '../store/assetStore';
import NetworkSelector from '../components/NetworkSelector';
import ProtocolSelector from '../components/ProtocolSelector';
import ViewToggle from '../components/ViewToggle';
import type { ViewType } from '../components/ViewToggle';
import YieldsTable from '../components/YieldsTable';

const MyYieldsPage: React.FC = () => {
  const { assets, error, isLoading: loading } = useAssetStore();
  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [viewType, setViewType] = useState<ViewType>('cards');
  
  // Get the getBestApy method from the store
  const { getBestApy, lastUpdated, apyData } = useApyStore();
  
  // Get the earnings data from the earnStore
  const { 
    isLoading: earningsLoading
  } = useEarnStore();
  
  // No need to fetch manually here since it's now handled in Layout
  
  // Get total earnings for display

  // Get unique protocols from tokens
  const uniqueProtocols = useMemo(() => 
    Array.from(new Set(tokens
      .filter(token => token.protocol && token.yieldBearingToken)
      .map(token => token.protocol)
    )),
    []
  );

  // Get all yield-bearing assets without filtering by protocol
  const allYieldAssets = useMemo(() => 
    assets.filter(asset => asset.yieldBearingToken),
    [assets]
  );

  // Memoize filtered yield-bearing tokens for display only
  const filteredYieldAssets = useMemo(() => 
    allYieldAssets.filter(asset => {
      // Filter by network if selected
      if (selectedNetwork !== 'all' && asset.chainId !== selectedNetwork) return false;
      
      // Filter by protocol if selected
      if (selectedProtocol !== 'all') {
        const token = tokens.find(
          t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
        );
        if (!token || token.protocol !== selectedProtocol) return false;
      }
      
      return true;
    }),
    [allYieldAssets, selectedNetwork, selectedProtocol, tokens]
  );

  // Get unique chain IDs from assets for the network selector
  const uniqueChainIds = useMemo(() => 
    Array.from(new Set(assets.filter(asset => asset.yieldBearingToken).map(asset => asset.chainId))),
    [assets]
  );

  // Function to calculate optimization data for a single asset
  const getOptimizationDataForAsset = (asset: Asset): OptimizationData | undefined => {
    // Get APY info for the asset
    const token = tokens.find(
      t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
    );
    
    if (!token) return undefined;
    
    // Determine which protocol this yield-bearing token belongs to
    const currentProtocol = token.protocol;
    if (!currentProtocol) return undefined;
    
    // Find the underlying asset for this yield token
    const underlyingTokenSymbol = token.token.substring(1); // e.g., aUSDC -> USDC
    const underlyingToken = tokens.find(
      t => t.token === underlyingTokenSymbol && t.chainId === token.chainId && !t.yieldBearingToken
    );
    
    if (!underlyingToken) return undefined;
    
    // Get best APY from the store
    const { bestApy, bestProtocol } = getBestApy(
      underlyingToken.chainId,
      underlyingToken.address.toLowerCase()
    );
    
    // If no best APY found, skip this asset
    if (bestApy === null || !bestProtocol) return undefined;
    
    //@ts-ignore
    const currentApyEstimate = currentProtocol && apyData[token.chainId]?.[underlyingToken.address.toLowerCase()]?.[currentProtocol.toLowerCase()] || 0;
    
    // Check if there's a better APY available
    if (bestProtocol !== currentProtocol && bestApy > currentApyEstimate) {
      // Calculate additional yield if user switches to better protocol
      const balanceNum = parseFloat(asset.balance);
      const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
      const currentYearlyUsd = (balanceNum * (currentApyEstimate / 100)) * usdPrice;
      const betterYearlyUsd = (balanceNum * (bestApy / 100)) * usdPrice;
      const additionalYearlyUsd = betterYearlyUsd - currentYearlyUsd;
      const apyImprovement = ((bestApy - currentApyEstimate) / currentApyEstimate * 100);
      
      const betterProtocolName = bestProtocol && bestProtocol.toUpperCase() in PROTOCOL_NAMES 
        ? PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] 
        : bestProtocol;
      
      return {
        currentProtocol,
        currentApy: currentApyEstimate,
        betterProtocol: betterProtocolName,
        betterApy: bestApy,
        additionalYearlyUsd: formatNumber(additionalYearlyUsd, 2),
        apyImprovement: parseFloat(apyImprovement.toFixed(0))
      };
    }
    
    return undefined;
  };

  // Calculate total yields and check for optimizations
  // This effect uses allYieldAssets instead of filteredYieldAssets
  useEffect(() => {
    if (allYieldAssets.length === 0) return;

    let dailyYieldTotal = 0;
    let yearlyYieldTotal = 0;

    // Process each yield-bearing asset
    const processAssets = async () => {
      for (const asset of allYieldAssets) {
        // Get APY info for the asset
        const token = tokens.find(
          t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
        );
        
        if (!token) continue;
        
        // Determine which protocol this yield-bearing token belongs to
        let currentProtocol = token.protocol;
        
        // Find the underlying asset for this yield token
        const underlyingTokenSymbol = token.token.substring(1); // e.g., aUSDC -> USDC
        const underlyingToken = tokens.find(
          t => t.token === underlyingTokenSymbol && t.chainId === token.chainId && !t.yieldBearingToken
        );
        
        if (!underlyingToken) continue;
        
        //@ts-ignore
        const currentApyEstimate = currentProtocol && apyData[token.chainId]?.[underlyingToken.address.toLowerCase()]?.[currentProtocol.toLowerCase()] || 0;

        
        // Calculate daily and yearly yield
        const balanceNum = parseFloat(asset.balance);
        const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
        const dailyYield = (balanceNum * (currentApyEstimate / 100)) / 365;
        const dailyYieldUsd = dailyYield * usdPrice;
        const yearlyYieldUsd = dailyYieldUsd * 365;
        
        dailyYieldTotal += dailyYieldUsd;
        yearlyYieldTotal += yearlyYieldUsd;
      }
    };
    
    processAssets();
  }, [allYieldAssets, getBestApy, apyData, tokens, lastUpdated]);

  // Loading state
  if (loading || earningsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your yields...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading yield data: {error}</p>
      </div>
    );
  }

  // Empty state - no yield-bearing assets at all
  if (allYieldAssets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          {/* <h1>My Yields</h1> */}
        </div>
        <div className={styles.emptyState}>
          <h3>No yield-bearing assets found</h3>
          <p>You don't have any assets currently earning yield.</p>
          <button className={styles.exploreButton}>Explore Yield Opportunities</button>
        </div>
      </div>
    );
  }

  // Render the content
  return (
    <div className={styles.container}>
      {/* Filters container with earnings summary */}
      <div className={styles.filtersContainer}>
        {/* Network selector for filtering yields */}
        <div className={styles.filterItem}>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            networks={uniqueChainIds}
            //@ts-ignore
            onChange={setSelectedNetwork}
            className={styles.networkSelector}
          />
        </div>
        
        {/* View Toggle */}


        {/* Protocol selector for filtering yields */}
        <div className={`${styles.filterItem} ${styles.viewToggleContainer}`}>
        <div className={styles.filterItem}>
          <ViewToggle 
            currentView={viewType}
            onViewChange={setViewType}
          />
        </div>
          <ProtocolSelector
            selectedProtocol={selectedProtocol}
            //@ts-ignore
            protocols={uniqueProtocols}
            onChange={setSelectedProtocol}
            className={styles.protocolSelector}
          />
        </div>
      </div>

      {/* Current Yields Section - Uses filteredYieldAssets for display */}
      <div className={styles.section}>
        {filteredYieldAssets.length > 0 ? (
          viewType === 'cards' ? (
            <div className={styles.yieldGrid}>
              {filteredYieldAssets.map((asset) => {
                const optimizationData = getOptimizationDataForAsset(asset);
                
                // Handle optimization for this specific asset
                const handleOptimize = () => {
                  console.log('Starting optimization for:', asset.token);
                  if (optimizationData) {
                    console.log(`Optimizing ${asset.token} from ${optimizationData.currentProtocol} to ${optimizationData.betterProtocol}`);
                  }
                };
                
                return (
                  <YieldCard
                    key={`${asset.token}-${asset.chainId}`}
                    asset={asset}
                    optimizationData={optimizationData}
                    onOptimize={handleOptimize}
                  />
                );
              })}
            </div>
          ) : (
            <YieldsTable
              assets={filteredYieldAssets}
              loading={loading}
              getOptimizationDataForAsset={getOptimizationDataForAsset}
            />
          )
        ) : (
          <div className={styles.filteredEmptyState}>
            <div className={styles.filteredEmptyContent}>
              <div className={styles.filteredEmptyIcon}>🔍</div>
              <div className={styles.filteredEmptyText}>
                <h3>No matching assets found</h3>
                <p>
                  No yield-bearing assets match your current filters.
                  Try changing the network or protocol filter to see your assets.
                </p>
              </div>
              <button 
                className={styles.resetFiltersButton}
                onClick={() => {
                  setSelectedNetwork('all');
                  setSelectedProtocol('all');
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyYieldsPage;