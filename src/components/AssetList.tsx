import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import AssetComponent from './AssetComponent';
import styles from './AssetList.module.css';
import { usePriceStore } from '../store/priceStore';

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
  const { getPrice } = usePriceStore();
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

  if (assets.length === 0) {
    return (
      <div className={styles['no-assets']}>
        <p>No valid assets found in your wallet</p>
      </div>
    );
  }

  return (
    <div className={styles['asset-list']}>
      <div className={styles['asset-grid']}>
        {assets
          .filter(asset => Number(asset.balance) > 0)
          .map((asset) => {
            const assetKey = `${asset.token}-${asset.chain}-${asset.protocol}`;
            const yieldInfo = assetYields[assetKey];
            const price = getPrice(asset.token.toLowerCase());
            return (
              <AssetComponent
                key={assetKey}
                asset={asset}
                price={price ? price : undefined}
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