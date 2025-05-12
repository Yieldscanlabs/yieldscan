import React, { useCallback } from 'react';
import type { Asset, YieldOption } from '../types';
import { CHAIN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import YieldOptionComponent from './YieldOption';
import styles from './AssetList.module.css';
import useBestApy from '../hooks/useBestApy';

interface AssetComponentProps {
  asset: Asset;
  yieldInfo: {
    loading: boolean;
    option?: YieldOption;
    yearlyYieldUsd: string;
  };
  isSelected: boolean;
  onSelect: (asset: Asset, bestApyData?: any) => void;
}

const AssetComponent: React.FC<AssetComponentProps> = ({
  asset,
  yieldInfo,
  isSelected,
  onSelect
}) => {
  
  // Move useBestApy here from YieldOption component
  const bestApyData = useBestApy(asset);
  
  const { 
    bestApy,
    bestProtocol,
    aaveApy,
    compoundApy,
    loading: apyLoading,
    error: apyError
  } = bestApyData;

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
              {formatNumber(asset.balance)} <span className={styles['asset-balance-usd']}>(${formatNumber(asset.balanceUsd)})</span>
            </div>
          </div>
        </div>
        
        <div className={styles['yield-info']}>
          <YieldOptionComponent 
            loading={yieldInfo?.loading || false}
            option={yieldInfo?.option}
            yearlyYieldUsd={yieldInfo?.yearlyYieldUsd || '0.00'}
            asset={asset}
            bestApyData={{
              bestApy,
              bestProtocol,
              aaveApy,
              compoundApy,
              loading: apyLoading,
              error: apyError
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetComponent;