import React from 'react';
import type { Asset } from '../types';
import AssetIcon from './AssetIcon';
import styles from './AssetTable.module.css';
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
  const { apyData } = useApyStore();

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
              <th className={styles.balanceHeader}>Balance & Value</th>
              <th className={styles.earningsHeader}>Yearly Earnings</th>
              <th className={styles.protocolHeader}>Protocol</th>
              <th className={styles.apyHeader}>APY</th>
              <th className={styles.yieldHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const assetKey = `${asset.token}-${asset.chain}-${asset.protocol}`;
              const price = getPrice(asset.token.toLowerCase());
              const bestApyData = getBestYield(apyData, asset.chainId, asset.address);
              const isSelected = selectedAsset === asset;
              const balanceValue = price ? price * Number(asset.balance) : Number(asset.balanceUsd);
              if (asset.protocol === bestApyData.bestProtocol) {

                return (
                  <tr
                    key={assetKey}
                    className={`${styles.assetRowButton} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleSelectAsset(asset)}
                  >
                    <td className={styles.assetCell}>
                      <div className={styles.assetInfo}>
                        <AssetIcon
                          assetIcon={asset.icon || ''}
                          assetName={asset.token}
                          chainId={asset.chainId}
                          size="small"
                        />
                        <span className={styles.assetName}>{asset.token}</span>
                      </div>
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
                    <td className={styles.earningsCell}>
                      <div className={styles.earningsGroup}>
                        {bestApyData?.bestApy ? (
                          <span className={styles.earningsAmount}>
                            ${((parseFloat(asset.balance) * bestApyData.bestApy) / 100).toFixed(2)}/year
                          </span>
                        ) : (
                          <span className={styles.noEarningsData}>
                            No data
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.protocolCell}>
                      {bestApyData?.bestProtocol ? (
                        <Protocol
                          name={bestApyData.bestProtocol}
                          showLogo={true}
                          showName={true}
                          size="small"
                          className={styles.protocolDisplay}
                        />
                      ) : (
                        <span className={styles.noProtocolData}>
                          No protocol
                        </span>
                      )}
                    </td>
                    <td className={styles.apyCell}>
                      {bestApyData?.bestApy ? (
                        <span className={styles.apyAmount}>
                          {bestApyData.bestApy.toFixed(2)}% APY
                        </span>
                      ) : (
                        <span className={styles.noApyData}>
                          No data
                        </span>
                      )}
                    </td>
                    <td className={styles.yieldCell}>
                      <button className={styles.actionButtonAccent} onClick={() => handleSelectAsset(asset)}>
                        Earn
                      </button>
                    </td>
                  </tr>
                );
              }
              return <></>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetTable; 