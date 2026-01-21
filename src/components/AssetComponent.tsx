import React, { useCallback } from 'react';
import type { Asset, YieldOption } from '../types';
import { formatNumber } from '../utils/helpers';
import AssetIcon from './AssetIcon';
import YieldOptionComponent from './YieldOption';
import styles from './AssetList.module.css';
import { type BestApyResult } from '../hooks/useBestApy';
import { useApyStore } from '../store/apyStore';
import { getBestYield } from '../utils/getBestYield';
import { API_BASE_URL } from '../utils/constants';

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
  isSelected,
  price,
  onSelect
}) => {

  // Move useBestApy here from YieldOption component
  const { apyData, isLoading: apyLoading } = useApyStore();
  const bestApyData = getBestYield(apyData, asset.chainId, asset.address);

  // Enhanced onSelect handler that includes bestApy data
  const handleSelect = useCallback(() => {
    onSelect(asset, bestApyData);

  }, [onSelect, asset, bestApyData]);

  if (
    asset.protocol &&
    bestApyData.bestProtocol &&
    asset.protocol.toLowerCase() === bestApyData.bestProtocol.toLowerCase()
  ) {
    return (
      <div
        className={`${styles['asset-card']} ${isSelected ? styles.selected : ''}`}
        onClick={handleSelect}
      >
        <div className={styles['asset-main']}>
          <div className={styles['asset-info']}>
            <AssetIcon
              assetIcon={asset.icon ? API_BASE_URL + asset.icon : ''}
              assetName={asset.token}
              chainId={asset.chainId}
              size="medium"
            />
            <div>
              <div className={styles['asset-name-row']}>
                <span className={styles['asset-name']}>{asset.token}</span>
              </div>
              <div className={styles['asset-balance']} title={asset.balance}>
                <small>Balance: </small>{formatNumber(asset.balance || '0', asset.maxDecimalsShow || 2)} <span className={styles['asset-balance-usd']}>
                  (${formatNumber(
                    price && asset.balance
                      ? price * Number(asset.balance)
                      : asset.balanceUsd || 0
                  )})
                </span>
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
  }

  return <></>;
};

export default AssetComponent;