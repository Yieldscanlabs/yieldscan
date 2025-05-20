import React, { useCallback } from 'react';
import type { Asset, YieldOption } from '../types';
import { CHAIN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import YieldOptionComponent from './YieldOption';
import styles from './AssetList.module.css';
import { type BestApyResult } from '../hooks/useBestApy';
import { useApyStore } from '../store/apyStore';
import { getBestYield } from '../utils/getBestYield';

interface AssetComponentProps {
  asset: Asset;
  price?: number;
  yieldInfo: {
    loading: boolean;
    option?: YieldOption;
    yearlyYieldUsd: string;
  };
  isSelected: boolean;
  onSelect: (asset: Asset, bestApyData?: BestApyResult) => void;
}

const AssetComponent: React.FC<AssetComponentProps> = ({
  asset,
  yieldInfo,
  isSelected,
  price,
  onSelect
}) => {
  
  // Move useBestApy here from YieldOption component
  const { apyData, isLoading: apyLoading, error: apyError } = useApyStore();
  const bestApyData = getBestYield(apyData, asset.chainId, asset.address);
  
  // Enhanced onSelect handler that includes bestApy data
  const handleSelect = useCallback(() => {
    onSelect(asset, bestApyData);

  }, [onSelect, asset, bestApyData]);
  
  return (
    <div 
      className={`${styles['asset-card']} ${isSelected ? styles.selected : ''}`}
      onClick={handleSelect}
    >
      <div className={styles['asset-main']}>
        <div className={styles['asset-info']}>
          <img src={asset.icon} alt={asset.token} className={styles['asset-icon']} />
          <div>
            <div className={styles['asset-name-row']}>
              <span className={styles['asset-name']}>{asset.token}</span>
              <span className={styles['asset-chain']}>{CHAIN_NAMES[asset.chain]}</span>
            </div>
            <div className={styles['asset-balance']}>
              {formatNumber(asset.balance, asset.maxDecimalsShow)} <span className={styles['asset-balance-usd']}>(${formatNumber(price ? price * Number(asset.balance) : asset.balanceUsd)})</span>
            </div>
          </div>
        </div>
        
        <div className={styles['yield-info']}>
          <YieldOptionComponent 
            loading={apyLoading}
            asset={asset}
            bestApyData={bestApyData}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetComponent;