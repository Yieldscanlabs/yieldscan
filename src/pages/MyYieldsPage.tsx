import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import { useApyStore } from '../store/apyStore';
import { useEarnStore } from '../store/earnStore';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import YieldCard from '../components/YieldCard';
import OptimizationCard from '../components/OptimizationCard';
import { useAssetStore } from '../store/assetStore';
import NetworkSelector from '../components/NetworkSelector';
import ProtocolSelector from '../components/ProtocolSelector';

const MyYieldsPage: React.FC = () => {
  const { address } = useAccount();
  const { assets, error, isLoading: loading } = useAssetStore();
  const [totalDailyYield, setTotalDailyYield] = useState('0.00');
  const [totalYearlyYield, setTotalYearlyYield] = useState('0.00');
  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | 'all'>('all');
  const [optimizations, setOptimizations] = useState<{
    asset: Asset;
    currentProtocol: string;
    currentApy: number;
    betterProtocol: string;
    betterApy: number;
    additionalYearlyUsd: string;
  }[]>([]);
  
  // Get the getBestApy method from the store
  const { getBestApy, lastUpdated, apyData } = useApyStore();
  
  // Get the earnings data from the earnStore
  const { 
    earningsData, 
    getTotalEarnings,
    isLoading: earningsLoading
  } = useEarnStore();
  
  // Setup auto-refresh for earnings data
  
  // No need to fetch manually here since it's now handled in Layout
  
  // Get total earnings for display
  const totalEarnings = useMemo(() => getTotalEarnings(), [getTotalEarnings]);

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

  // Calculate total yields and check for optimizations
  // This effect uses allYieldAssets instead of filteredYieldAssets
  useEffect(() => {
    if (allYieldAssets.length === 0) return;

    let dailyYieldTotal = 0;
    let yearlyYieldTotal = 0;
    const potentialOptimizations: typeof optimizations = [];

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
        
        // Get best APY from the store instead of using the hook directly
        const { bestApy, bestProtocol } = getBestApy(
          underlyingToken.chainId,
          underlyingToken.address.toLowerCase()
        );
        // If no best APY found, skip this asset
        if (bestApy === null) continue;
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
        
        // Check if there's a better APY available
        if (
          currentProtocol &&
          bestProtocol !== currentProtocol
        ) {
          // Calculate additional yield if user switches to better protocol
          const betterYearlyYield = (balanceNum * (bestApy / 100));
          const betterYearlyYieldUsd = betterYearlyYield * usdPrice;
          const additionalYearlyUsd = betterYearlyYieldUsd - yearlyYieldUsd;
          
          potentialOptimizations.push({
            asset,
            currentProtocol,
            currentApy: currentApyEstimate,
            betterProtocol: bestProtocol && bestProtocol.toUpperCase() in PROTOCOL_NAMES 
              ? PROTOCOL_NAMES[bestProtocol.toUpperCase() as keyof typeof PROTOCOL_NAMES] 
              : '',
            betterApy: bestApy,
            additionalYearlyUsd: formatNumber(additionalYearlyUsd, 2)
          });
        }
      }
      setTotalDailyYield(formatNumber(dailyYieldTotal, 2));
      setTotalYearlyYield(formatNumber(yearlyYieldTotal, 2));
      setOptimizations(potentialOptimizations);
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

  // Add a handler for optimization button clicks
  const handleOptimize = (optimization: typeof optimizations[0]) => {
    // Implement the optimization logic here
    // In a real app, this would initiate the token migration process
  };

  // Render the content
  return (
    <div className={styles.container}>
      {/* Lifetime earnings hero section */}
      <div className={styles.lifetimeHero}>
        <div className={styles.lifetimeContent}>
          <div className={styles.lifetimeLabelContainer}>
            <h2 className={styles.lifetimeLabel}>Lifetime Earnings</h2>
            <div className={styles.lifetimeBadge}>Total</div>
          </div>
          <div className={styles.lifetimeAmount}>${totalEarnings.lifetime.toFixed(2)}</div>
        </div>
      </div>

      {/* Other earnings summary cards */}
      <div className={styles.header}>
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Daily Earnings</div>
            <div className={styles.summaryAmount}>${totalEarnings.daily.toFixed(2)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Weekly Earnings</div>
            <div className={styles.summaryAmount}>${totalEarnings.weekly.toFixed(2)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Monthly Earnings</div>
            <div className={styles.summaryAmount}>${totalEarnings.monthly.toFixed(2)}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Yearly Projection</div>
            <div className={styles.summaryAmount}>${totalEarnings.yearly.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filters container */}
      <div className={styles.filtersContainer}>
        {/* Network selector for filtering yields */}
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Network</label>
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            networks={uniqueChainIds}
            onChange={setSelectedNetwork}
            className={styles.networkSelector}
          />
        </div>
        
        {/* Protocol selector for filtering yields */}
        <div className={styles.filterItem}>
          <label className={styles.filterLabel}>Protocol</label>
          <ProtocolSelector
            selectedProtocol={selectedProtocol}
            protocols={uniqueProtocols}
            onChange={setSelectedProtocol}
            className={styles.protocolSelector}
          />
        </div>
      </div>

      {/* Current Yields Section - Uses filteredYieldAssets for display */}
      <div className={styles.section}>
        {filteredYieldAssets.length > 0 ? (
          <div className={styles.yieldGrid}>
            {filteredYieldAssets.map((asset) => (
              <YieldCard
                key={`${asset.token}-${asset.chainId}`}
                asset={asset}
              />
            ))}
          </div>
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

      {/* Optimizations Section - Always uses all optimizations regardless of filters */}
      <div className={styles.section}>
        <h2>Optimize</h2>
        
        {optimizations.length > 0 ? (
          <>
            <div className={styles.optimizationsGrid}>
              {optimizations.map((opt, index) => (
                <OptimizationCard
                  key={index}
                  asset={opt.asset}
                  currentProtocol={opt.currentProtocol}
                  currentApy={opt.currentApy}
                  betterProtocol={opt.betterProtocol}
                  betterApy={opt.betterApy}
                  additionalYearlyUsd={opt.additionalYearlyUsd}
                  onOptimize={() => handleOptimize(opt)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className={styles.optimizationEmptyState}>
            <div className={styles.optimizationEmptyContent}>
              <div className={styles.optimizationEmptyIcon}>✓</div>
              <div className={styles.optimizationEmptyText}>
                <h3>Your yields are optimized</h3>
                <p>
                  You're already earning the best possible yields on all your assets.
                  We'll notify you when better opportunities become available.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyYieldsPage;