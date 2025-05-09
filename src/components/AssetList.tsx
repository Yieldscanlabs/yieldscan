import React from 'react';
import type { Asset } from '../types';
import { CHAIN_NAMES, TOKEN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import styles from './AssetList.module.css';

interface AssetListProps {
  assets: Asset[];
  loading: boolean;
  onSelectAsset: (asset: Asset) => void;
  selectedAsset: Asset | null;
}

const AssetList: React.FC<AssetListProps> = ({ 
  assets, 
  loading, 
  onSelectAsset,
  selectedAsset 
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading assets...</div>;
  }
  
  if (assets.length === 0) {
    return <div className={styles['no-assets']}>No assets found in your wallet</div>;
  }
  
  return (
    <div className={styles['asset-list']}>
      <h2>Your Assets</h2>
      <div className={styles['asset-grid']}>
        {assets.map((asset) => (
          <div 
            key={`${asset.token}-${asset.chain}`} 
            className={`${styles['asset-card']} ${selectedAsset === asset ? styles.selected : ''}`}
            onClick={() => onSelectAsset(asset)}
          >
            <div className={styles['asset-header']}>
              <img src={asset.icon} alt={asset.token} className={styles['asset-icon']} />
              <div className={styles['asset-chain']}>{CHAIN_NAMES[asset.chain]}</div>
            </div>
            <div className={styles['asset-name']}>{TOKEN_NAMES[asset.token]}</div>
            <div className={styles['asset-balance']}>
              <div>{formatNumber(asset.balance)} {asset.token}</div>
              <div className={styles['asset-balance-usd']}>${formatNumber(asset.balanceUsd)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetList;