import React from 'react';
import type { Asset } from '../types';
import { CHAIN_NAMES, TOKEN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';

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
    return <div className="loading">Loading assets...</div>;
  }
  
  if (assets.length === 0) {
    return <div className="no-assets">No assets found in your wallet</div>;
  }
  
  return (
    <div className="asset-list">
      <h2>Your Assets</h2>
      <div className="asset-grid">
        {assets.map((asset) => (
          <div 
            key={`${asset.token}-${asset.chain}`} 
            className={`asset-card ${selectedAsset === asset ? 'selected' : ''}`}
            onClick={() => onSelectAsset(asset)}
          >
            <div className="asset-header">
              <img src={asset.icon} alt={asset.token} className="asset-icon" />
              <div className="asset-chain">{CHAIN_NAMES[asset.chain]}</div>
            </div>
            <div className="asset-name">{TOKEN_NAMES[asset.token]}</div>
            <div className="asset-balance">
              <div>{formatNumber(asset.balance)} {asset.token}</div>
              <div className="asset-balance-usd">${formatNumber(asset.balanceUsd)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetList;