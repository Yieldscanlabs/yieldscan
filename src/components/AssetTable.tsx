import React from 'react';
import type { Asset } from '../types';
import styles from './AssetTable.module.css';
import { CHAIN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import { usePriceStore } from '../store/priceStore';
import { useApyStore } from '../store/apyStore';
import { getBestYield } from '../utils/getBestYield';
import { type BestApyResult } from '../hooks/useBestApy';
import Protocol from './Protocol';

interface AssetTableProps {
  assets: Asset[];
  loading: boolean;
  onSelectAsset: (asset: Asset, bestApyData?: BestApyResult) => void;
  selectedAsset: Asset | null;
}

const AssetTable: React.FC<AssetTableProps> = ({ 
  assets, 
  loading, 
  onSelectAsset,
  selectedAsset 
}) => {
  const { getPrice } = usePriceStore();
  const { apyData, isLoading: apyLoading } = useApyStore();

  const handleSelectAsset = (asset: Asset) => {
    const bestApyData = getBestYield(apyData, asset.chainId, asset.address);
    onSelectAsset(asset, bestApyData);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your assets...</div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={styles.noAssets}>
        <p>No valid assets found in your wallet</p>
      </div>
    );
  }

  return (
    <div className={styles.assetTable}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.assetHeader}>Asset</th>
              <th className={styles.chainHeader}>Chain</th>
              <th className={styles.balanceHeader}>Balance & Value</th>
              <th className={styles.yieldHeader}>Best Yield</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const assetKey = `${asset.token}-${asset.chain}`;
              const price = getPrice(asset.token.toLowerCase());
              const bestApyData = getBestYield(apyData, asset.chainId, asset.address);
              const isSelected = selectedAsset === asset;
              const balanceValue = price ? price * Number(asset.balance) : Number(asset.balanceUsd);

              return (
                <tr 
                  key={assetKey}
                  className={`${styles.assetRowButton} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleSelectAsset(asset)}
                >
                  <td className={styles.assetCell}>
                    <div className={styles.assetInfo}>
                      <img 
                        src={asset.icon} 
                        alt={asset.token} 
                        className={styles.assetIcon}
                        onError={(e) => {
                          const fallbackSvg = `data:image/svg+xml;base64,${btoa(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#6366f1"/><text x="12" y="16" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">${asset.token.charAt(0)}</text></svg>`)}`;
                          e.currentTarget.src = fallbackSvg;
                        }}
                      />
                      <span className={styles.assetName}>{asset.token}</span>
                    </div>
                  </td>
                  <td className={styles.chainCell}>
                    <span className={styles.chainBadge}>
                      {CHAIN_NAMES[asset.chain]}
                    </span>
                  </td>
                  <td className={styles.balanceCell}>
                    <div className={styles.balanceGroup}>
                      <span className={styles.balanceAmount}>
                        {formatNumber(asset.balance, asset.maxDecimalsShow)}
                      </span>
                      <span className={styles.usdValue}>
                        ${formatNumber(balanceValue)}
                      </span>
                    </div>
                  </td>
                  <td className={styles.yieldCell}>
                    <div className={styles.yieldButton}>
                      {apyLoading ? (
                        <div className={styles.yieldLoading}>
                          <div className={styles.yieldSpinner}></div>
                          <span>Loading...</span>
                        </div>
                      ) : bestApyData?.bestApy ? (
                        <>
                          <div className={styles.yieldApyMain}>
                            <span>{bestApyData.bestApy.toFixed(2)}% APY</span>
                            <span className={styles.yieldEarnings}>
                              ${((parseFloat(asset.balance) * bestApyData.bestApy) / 100).toFixed(2)}/year
                            </span>
                          </div>
                          <div className={styles.yieldDetails}>
                            <Protocol 
                              name={bestApyData.bestProtocol}
                              showLogo={true}
                              showName={true}
                              size="small"
                              className={styles.yieldProtocol}
                            />
                            <span style={{color: 'var(--text-tertiary)', fontSize: '0.65rem'}}>
                              Click to deposit
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className={styles.noYieldAvailable}>
                          No yield options
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetTable; 