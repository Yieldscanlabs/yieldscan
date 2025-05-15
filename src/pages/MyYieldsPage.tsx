import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import styles from './MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import tokens from '../utils/tokens';
import useAssets from '../hooks/useAssets';
import useBestApy from '../hooks/useBestApy';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import YieldCard from '../components/YieldCard';

const MyYieldsPage: React.FC = () => {
  const { address } = useAccount();
  const { assets, loading, error } = useAssets(address || '');
  const [totalDailyYield, setTotalDailyYield] = useState('0.00');
  const [totalYearlyYield, setTotalYearlyYield] = useState('0.00');
  const [optimizations, setOptimizations] = useState<{
    asset: Asset;
    currentProtocol: string;
    currentApy: number;
    betterProtocol: string;
    betterApy: number;
    additionalYearlyUsd: string;
  }[]>([]);

  // Filter for yield-bearing tokens only
  const yieldAssets = assets.filter(asset => asset.yieldBearingToken);

  // Calculate total yields and check for optimizations
  useEffect(() => {
    if (yieldAssets.length === 0) return;

    let dailyYieldTotal = 0;
    let yearlyYieldTotal = 0;
    const potentialOptimizations: typeof optimizations = [];

    // Process each yield-bearing asset
    const processAssets = async () => {
      for (const asset of yieldAssets) {
        // Get APY info for the asset
        const token = tokens.find(
          t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
        );
        
        if (!token) continue;
        
        // Determine which protocol this yield-bearing token belongs to
        let currentProtocol = '';
        if (token.token.startsWith('a')) {
          currentProtocol = PROTOCOL_NAMES.AAVE;
        } else if (token.token.startsWith('c')) {
          currentProtocol = PROTOCOL_NAMES.COMPOUND;
        }
        
        // Get current APY estimate (this would ideally come from an API)
        // For now, we'll use a simplified approach based on the token name
        const currentApyEstimate = token.token.startsWith('a') ? 3.2 : 2.8;
        
        // Find the underlying asset for this yield token
        const underlyingTokenSymbol = token.token.substring(1); // e.g., aUSDC -> USDC
        const underlyingToken = tokens.find(
          t => t.token === underlyingTokenSymbol && t.chainId === token.chainId && !t.yieldBearingToken
        );
        
        if (!underlyingToken) continue;
        
        // Create a dummy underlying asset to use with our hooks
        const underlyingAsset: Asset = {
          token: underlyingToken.token,
          address: underlyingToken.address,
          maxDecimalsShow: underlyingToken.maxDecimalsShow,
          chain: underlyingToken.chain,
          chainId: underlyingToken.chainId,
          balance: asset.balance,
          balanceUsd: asset.balanceUsd,
          decimals: underlyingToken.decimals,
          yieldBearingToken: false,
          icon: underlyingToken.icon
        };
        
        // Get best APY for the underlying asset
        const bestApyData = useBestApy(underlyingAsset);
        
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
          bestApyData.bestApy !== null && 
          bestApyData.bestApy > currentApyEstimate &&
          bestApyData.bestProtocol !== currentProtocol
        ) {
          // Calculate additional yield if user switches to better protocol
          const betterYearlyYield = (balanceNum * (bestApyData.bestApy / 100));
          const betterYearlyYieldUsd = betterYearlyYield * usdPrice;
          const additionalYearlyUsd = betterYearlyYieldUsd - yearlyYieldUsd;
          
          potentialOptimizations.push({
            asset,
            currentProtocol,
            currentApy: currentApyEstimate,
            betterProtocol: bestApyData.bestProtocol || '',
            betterApy: bestApyData.bestApy,
            additionalYearlyUsd: formatNumber(additionalYearlyUsd, 2)
          });
        }
      }
      
      setTotalDailyYield(formatNumber(dailyYieldTotal, 2));
      setTotalYearlyYield(formatNumber(yearlyYieldTotal, 2));
      setOptimizations(potentialOptimizations);
    };
    
    processAssets();
  }, [yieldAssets]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your yields...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading yield data: {error}</p>
      </div>
    );
  }

  if (yieldAssets.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Yields</h1>
        </div>
        <div className={styles.emptyState}>
          <h3>No yield-bearing assets found</h3>
          <p>You don't have any assets currently earning yield.</p>
          <button className={styles.exploreButton}>Explore Yield Opportunities</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Yields</h1>
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Daily Earnings</div>
            <div className={styles.summaryAmount}>${totalDailyYield}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Yearly Earnings</div>
            <div className={styles.summaryAmount}>${totalYearlyYield}</div>
          </div>
        </div>
      </div>

      {/* Current Yields Section */}
      <div className={styles.section}>
        <h2>Current Yield-Bearing Assets</h2>
        <div className={styles.yieldGrid}>
          {yieldAssets.map((asset) => (
            <YieldCard
              key={`${asset.token}-${asset.chainId}`}
              asset={asset}
            />
          ))}
        </div>
      </div>

      {/* Optimizations Section */}
      {optimizations.length > 0 && (
        <div className={styles.section}>
          <h2>Yield Optimizations</h2>
          <p className={styles.sectionDescription}>
            These optimizations could increase your yield earnings.
          </p>
          
          <div className={styles.optimizationsGrid}>
            {optimizations.map((opt, index) => (
              <div key={index} className={styles.optimizationCard}>
                <div className={styles.optimizationHeader}>
                  <img src={opt.asset.icon} alt={opt.asset.token} className={styles.assetIcon} />
                  <div className={styles.optimizationTitle}>
                    Optimize your {opt.asset.token} yield
                  </div>
                </div>
                
                <div className={styles.comparisonRow}>
                  <div className={styles.currentOption}>
                    <div className={styles.optionProtocol}>{opt.currentProtocol}</div>
                    <div className={styles.optionApy}>{opt.currentApy.toFixed(2)}% APY</div>
                    <div className={styles.optionLabel}>Current</div>
                  </div>
                  
                  <div className={styles.comparisonArrow}>→</div>
                  
                  <div className={styles.betterOption}>
                    <div className={styles.optionProtocol}>{opt.betterProtocol}</div>
                    <div className={styles.optionApy}>{opt.betterApy.toFixed(2)}% APY</div>
                    <div className={styles.optionLabel}>Recommended</div>
                  </div>
                </div>
                
                <div className={styles.optimizationBenefit}>
                  <div className={styles.benefitLabel}>Additional yearly earnings</div>
                  <div className={styles.benefitValue}>+${opt.additionalYearlyUsd}</div>
                </div>
                
                <button className={styles.optimizeButton}>Optimize Now</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyYieldsPage;