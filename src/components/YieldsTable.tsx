import React, { useState } from 'react';
import type { Asset } from '../types';
import AssetIcon from './AssetIcon';
import styles from './YieldsTable.module.css';
import { formatNumber } from '../utils/helpers';
import Protocol from './Protocol';
import type { OptimizationData } from './YieldCard/types';
import tokens from '../utils/tokens';
import { useOptimizationStore } from '../store/optimizationStore';
import OptimizeInformationModal from './OptimizeInformationModal';
import type { TokenWithLockYield } from './YieldCard/types';
import { useWithdrawModalStore } from '../store/withdrawModalStore';
import LockAPYInformationModal from './LockAPYInformationModal';
import { useApyStore } from '../store/apyStore';

interface YieldsTableProps {
  assets: Asset[];
  loading: boolean;
  getOptimizationDataForAsset: (asset: Asset) => OptimizationData | undefined;
  onOptimize?: (asset: Asset) => void;
  onWithdraw?: (asset: Asset) => void;
  onLockApy?: (asset: Asset) => void;
}

const YieldsTableRow: React.FC<{
  asset: Asset;
  optimizationData?: OptimizationData;
  onOptimize?: (asset: Asset) => void;
  onWithdraw?: (asset: Asset) => void;
  onLockApy?: (asset: Asset) => void;
}> = ({ asset, optimizationData, onOptimize, onWithdraw, onLockApy }) => {
  const balanceValue = parseFloat(asset.balanceUsd);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isLockAPYModalOpen, setIsLockAPYModalOpen] = useState(false);
  const { openModal } = useOptimizationStore();
  const { openModal: openWithdrawModal } = useWithdrawModalStore();
  const { apyData } = useApyStore();

  // Get current protocol and APY from the asset and token data
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );

  // Get current protocol from asset or token
  const currentProtocol = asset.protocol || token?.protocol;

  // Calculate current APY
  let currentApy = 0;
  // if (token && currentProtocol && token.underlyingAsset) {
  //   const protocolKey = currentProtocol.toLowerCase();
  //   const underlyingAsset = token.underlyingAsset.toLowerCase();
  //   //@ts-ignore
  //   currentApy = apyData[asset.chainId]?.[underlyingAsset]?.[protocolKey] || 0;
  // }

  const tokenApyData = apyData[asset.chainId]?.[asset.address.toLowerCase()];
  let protocolKey: string | undefined;
  if (asset.protocol) {
    protocolKey = asset.protocol.toLowerCase();
    currentApy = tokenApyData[protocolKey as keyof typeof tokenApyData] || 0;
  } else {
    currentApy = 0;
  }

  // Use the same logic as YieldCard to determine if Lock APY is available
  const hasLockYield = token !== undefined && (token as unknown as TokenWithLockYield).lockYield !== undefined;
  const lockYieldDetails = hasLockYield ? (token as unknown as TokenWithLockYield).lockYield : undefined;

  // Handle optimization - same logic as YieldCard
  const handleOptimizeClick = () => {
    if (optimizationData) {
      console.log({optimizationData});
      
      setIsOptimizeModalOpen(true);
    }
  };

  // Handle optimization confirm - same logic as YieldCard
  const handleOptimizeConfirm = () => {
    if (optimizationData) {
      setIsOptimizeModalOpen(false);

      openModal({
        asset,
        currentProtocol: optimizationData.currentProtocol,
        currentApy: optimizationData.currentApy,
        betterProtocol: optimizationData.betterProtocol,
        betterApy: optimizationData.betterApy,
        additionalYearlyUsd: optimizationData.additionalYearlyUsd,
        onOptimize: () => onOptimize?.(asset)
      });
    }
  };

  const closeOptimizeModal = () => {
    setIsOptimizeModalOpen(false);
  };

  // Handle withdraw action - use external handler if available, otherwise use modal
  const handleWithdrawClick = () => {
    if (asset.withdrawUri) {
      window.open(asset.withdrawUri, '_blank', 'noopener noreferrer');
    } else {
      // Use the new withdrawal modal store
      openWithdrawModal({
        asset,
        protocol: currentProtocol || '',
        balance: asset.totalDeposited || 0,
        maxDecimals: asset.maxDecimalsShow || 6,
        isNativeToken: asset.address === '0x',
        onWithdraw: async (amount: string) => {
          // Placeholder for withdrawal logic
          console.log('Withdrawing', amount, asset.token);
          return true;
        },
        onComplete: () => {
          // Placeholder for completion logic
          console.log('Withdrawal completed');
        }
      });
    }
  };

  // Handle Lock APY modal
  const openLockAPYModal = () => {
    setIsLockAPYModalOpen(true);
  };

  const closeLockAPYModal = () => {
    setIsLockAPYModalOpen(false);
  };

  const handleLockAPYConfirm = () => {
    setIsLockAPYModalOpen(false);
    // Handle lock APY confirmation logic here
  };

  return (
    <>
      <tr className={styles.assetRow}>
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
              {formatNumber(asset.totalDeposited || 0, asset.maxDecimalsShow)}
            </span>
            <span className={styles.usdValue}>
              ${formatNumber(asset.totalDepositedUsd || 0)}
            </span>
          </div>
        </td>
        <td className={styles.protocolCell}>
          {currentProtocol ? (
            <Protocol
              name={currentProtocol}
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
          {currentApy > 0 ? (
            <span className={styles.apyAmount}>
              {currentApy.toFixed(2)}% APY
            </span>
          ) : (
            <span className={styles.noApyData}>
              -
            </span>
          )}
        </td>
        <td className={styles.actionsCell}>
          <div className={styles.actionsContainer}>
            {/* Withdraw Button - Always available */}
            <button
              className={`${styles.actionButton} ${styles.withdrawButton}`}
              onClick={handleWithdrawClick}
              title="Withdraw funds"
            >
              {asset.withdrawUri ? (
                <>
                  <span>Withdraw</span>
                </>
              ) : (
                <>
                  <span>Withdraw</span>
                </>
              )}
            </button>

            {/* Optimize Button - Only if optimization data available */}
            {optimizationData && (
              <button
                className={`${styles.actionButton} ${styles.optimizeButton}`}
                onClick={handleOptimizeClick}
                title={`Switch to ${optimizationData.betterProtocol} for ${optimizationData.betterApy.toFixed(2)}% APY (+${optimizationData.apyImprovement}%)`}
              >
                <span>Optimize</span>
              </button>
            )}

            {/* Lock APY Button - Only if hasLockYield is true */}
            {hasLockYield && (
              <button
                className={`${styles.actionButton} ${styles.lockApyButton}`}
                onClick={openLockAPYModal}
                title="Lock current APY rate"
              >
                <span>Lock APY</span>
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Lock APY Modal */}
      {lockYieldDetails && (
        <LockAPYInformationModal
          isOpen={isLockAPYModalOpen}
          onClose={closeLockAPYModal}
          onConfirm={handleLockAPYConfirm}
          asset={asset}
          protocol={lockYieldDetails.protocol}
          expirationDate={lockYieldDetails.expirationDate}
          currentAPY={currentApy}
          amountToLock={parseFloat(asset.balance)}
        />
      )}

      {/* Optimization Modal */}
      {optimizationData && (
        <OptimizeInformationModal
          isOpen={isOptimizeModalOpen}
          onClose={closeOptimizeModal}
          onConfirm={handleOptimizeConfirm}
          asset={asset}
          optimizationData={optimizationData}
        />
      )}
    </>
  );
};

const YieldsTable: React.FC<YieldsTableProps> = ({
  assets,
  loading,
  getOptimizationDataForAsset,
  onOptimize,
  onWithdraw,
  onLockApy
}) => {

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>Loading your yields...</div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={styles.noAssets}>
        <p>No yield-bearing assets found</p>
      </div>
    );
  }

  return (
    <div className={styles.yieldsTable}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.assetHeader}>Asset</th>
              <th className={styles.balanceHeader}>Balance & Value</th>
              <th className={styles.protocolHeader}>Protocol</th>
              <th className={styles.apyHeader}>APY</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const assetKey = `${asset.token}-${asset.chain}-${asset.protocol}`;
              const optimizationData = getOptimizationDataForAsset(asset);
              if (asset.totalDeposited && asset.totalDeposited > 0) {
                return (
                  <YieldsTableRow
                    key={assetKey}
                    asset={asset}
                    optimizationData={optimizationData}
                    onOptimize={onOptimize}
                    onWithdraw={onWithdraw}
                    onLockApy={onLockApy}
                  />
                );
              }
              return <></>
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YieldsTable; 