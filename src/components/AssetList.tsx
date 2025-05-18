import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { formatNumber, getBestYieldOptionForAsset, calculateDailyYield } from '../utils/helpers';
import AssetComponent from './AssetComponent';
import NetworkSelector from './NetworkSelector';
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
  
  // Add state for network filtering
  const [selectedNetwork, setSelectedNetwork] = useState<number | 'all'>('all');

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
 
  }, [assets]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles['loading-spinner']}></div>
        <div className={styles['loading-text']}>Loading your assets...</div>
      </div>
    );
  }
  
  // Get unique chain IDs from assets for the network selector
  const uniqueChainIds = Array.from(new Set(assets.map(asset => asset.chain)))
  
  // Filter assets by selected network
  const regularAssets = assets.filter(asset => 
    !asset.yieldBearingToken && 
    (selectedNetwork === 'all' || asset.chainId === selectedNetwork)
  );
  
  if (regularAssets.length === 0) {
    return (
      <div className={styles['no-assets']}>
        <p>No valid assets found in your wallet</p>
      </div>
    );
  }
  
  return (
    <div className={styles['asset-list']}>
      {/* Network selector for filtering assets */}
      <div className={styles['network-filter']}>
        <NetworkSelector
          selectedNetwork={selectedNetwork}
          networks={[1, 42161]} // Example chain IDs
          //@ts-ignore
          onChange={setSelectedNetwork}
          className={styles.networkSelector}
        />
      </div>
      
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