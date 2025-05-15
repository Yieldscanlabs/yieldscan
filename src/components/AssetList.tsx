import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { formatNumber, getBestYieldOptionForAsset, calculateDailyYield } from '../utils/helpers';
import AssetComponent from './AssetComponent';
import styles from './AssetList.module.css';

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  onSelectAsset: (asset: Asset, bestApyData?: any) => void;
  selectedAsset: Asset | null;
}

const AssetList: React.FC<AssetListProps> = ({ 
  assets, 
  loading, 
  onSelectAsset,
  selectedAsset 
}) => {
  // Track best yield options for each asset
  const [assetYields, setAssetYields] = useState<Record<string, {
    loading: boolean;
    option?: YieldOption;
    yearlyYieldUsd: string;
  }>>({});

  // Handler for asset selection that passes along the bestApy data
  const handleSelectAsset = (asset: Asset, bestApyData?: any) => {
    onSelectAsset(asset, bestApyData);
  };

  // Fetch best yield options when assets are loaded
  useEffect(() => {
    if (assets.length === 0) return;

    // Initialize loading state for all assets
    const initialYieldState: Record<string, {
      loading: boolean;
      option?: YieldOption;
      yearlyYieldUsd: string;
    }> = {};
    
    assets.forEach(asset => {
      const assetKey = `${asset.token}-${asset.chain}`;
      initialYieldState[assetKey] = {
        loading: true,
        yearlyYieldUsd: '0.00'
      };
    });
    
    setAssetYields(initialYieldState);
    
    // Fetch yield options
    const fetchYieldOptions = async () => {
      const updatedYields = { ...initialYieldState };
      
      for (const asset of assets) {
        const assetKey = `${asset.token}-${asset.chain}`;
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Get best yield option for this asset
        const bestOption = getBestYieldOptionForAsset(asset.token, asset.chain);
        
        if (bestOption) {
          // Calculate earnings
          const balanceNum = parseFloat(asset.balance);
          const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
          const dailyEarningsToken = calculateDailyYield(balanceNum, bestOption.apy);
          const dailyEarningsUsd = dailyEarningsToken * usdPrice;
          const yearlyEarningsUsd = dailyEarningsUsd * 365;
          
          updatedYields[assetKey] = {
            loading: false,
            option: bestOption,
            yearlyYieldUsd: formatNumber(yearlyEarningsUsd, 2)
          };
        } else {
          updatedYields[assetKey] = {
            loading: false,
            yearlyYieldUsd: '0.00'
          };
        }
        
        // Update state after each asset's data is fetched
        setAssetYields(prev => ({
          ...prev,
          [assetKey]: updatedYields[assetKey]
        }));
      }
    };
    
    fetchYieldOptions();
  }, [assets]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles['loading-spinner']}></div>
        <div className={styles['loading-text']}>Loading your assets...</div>
      </div>
    );
  }
  const regularAssets = assets.filter(asset => !asset.yieldBearingToken);
  if (regularAssets.length === 0) {
    return (
      <div className={styles['no-assets']}>
        <p>No valid assets found in your wallet</p>
      </div>
    );
  }
  
  return (
    <div className={styles['asset-list']}>
      <h2>Your Assets</h2>
      <div className={styles['asset-grid']}>
        {regularAssets.map((asset) => {
          const assetKey = `${asset.token}-${asset.chain}`;
          const yieldInfo = assetYields[assetKey];
          
          return (
            <AssetComponent
              key={assetKey}
              asset={asset}
              yieldInfo={yieldInfo}
              isSelected={selectedAsset === asset}
              onSelect={handleSelectAsset}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AssetList;