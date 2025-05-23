import React, { useState } from 'react';
import type { Asset } from '../types';
import styles from './YieldsTable.module.css';
import { CHAIN_NAMES } from '../utils/constants';
import { formatNumber } from '../utils/helpers';
import Protocol from './Protocol';
import type { OptimizationData } from './YieldCard/types';
import tokens from '../utils/tokens';
import { useOptimizationStore } from '../store/optimizationStore';
import OptimizeInformationModal from './OptimizeInformationModal';
import type { TokenWithLockYield } from './YieldCard/types';
import WithdrawModal from './WithdrawModal';
import LockAPYInformationModal from './LockAPYInformationModal';
import { useYieldCard } from './YieldCard/useYieldCard';
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
  const { openModal } = useOptimizationStore();
  const { apyData } = useApyStore();

  // Get current protocol and APY from the asset and token data
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );
  
  // Get current protocol from asset or token
  const currentProtocol = asset.protocol || token?.protocol;
  
  // Calculate current APY
  let currentApy = 0;
  if (token && currentProtocol && token.underlyingAsset) {
    const protocolKey = currentProtocol.toLowerCase();
    const underlyingAsset = token.underlyingAsset.toLowerCase();
    //@ts-ignore
    currentApy = apyData[asset.chainId]?.[underlyingAsset]?.[protocolKey] || 0;
  }

  // Use the same logic as YieldCard to determine if Lock APY is available
  const hasLockYield = token !== undefined && (token as unknown as TokenWithLockYield).lockYield !== undefined;
  const lockYieldDetails = hasLockYield ? (token as unknown as TokenWithLockYield).lockYield : undefined;

  // Use the YieldCard hook for withdraw and lock functionality
  const {
    isWithdrawModalOpen,
    isLockAPYModalOpen,
    isProcessingWithdrawal,
    isConfirming,
    isConfirmed,
    protocol,
    isNativeToken,
    balanceNum,
    openWithdrawModal,
    closeWithdrawModal,
    openLockAPYModal,
    closeLockAPYModal,
    handleLockAPYConfirm,
    handleWithdrawComplete,
    handleWithdraw
  } = useYieldCard({ 
    asset, 
    onOptimize: onOptimize ? () => onOptimize(asset) : undefined, 
    onLockAPY: onLockApy ? () => onLockApy(asset) : undefined
  });

  // Handle optimization - same logic as YieldCard
  const handleOptimizeClick = () => {
    if (optimizationData) {
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
      openWithdrawModal();
    }
  };

  return (
    <>
      <tr className={styles.assetRow}>
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
            <div className={styles.noProtocolData}>
              No protocol
            </div>
          )}
        </td>
        <td className={styles.apyCell}>
          {currentApy > 0 ? (
            <div className={styles.apyDisplay}>
              <div className={styles.apyMain}>
                {currentApy.toFixed(2)}% APY
              </div>
              <div className={styles.apyEarnings}>
                ${((parseFloat(asset.balance) * currentApy) / 100).toFixed(2)}/year
              </div>
            </div>
          ) : (
            <div className={styles.noApyData}>
              No yield data
            </div>
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

      {/* Modals - same as YieldCard */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        onComplete={handleWithdrawComplete}
        asset={asset}
        protocol={protocol}
        balance={balanceNum}
        maxDecimals={asset.maxDecimalsShow || 6}
        onWithdraw={handleWithdraw}
        isProcessing={isProcessingWithdrawal}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        isNativeToken={isNativeToken}
      />
      
      {lockYieldDetails && (
        <LockAPYInformationModal
          isOpen={isLockAPYModalOpen}
          onClose={closeLockAPYModal}
          onConfirm={handleLockAPYConfirm}
          asset={asset}
          protocol={lockYieldDetails.protocol}
          expirationDate={lockYieldDetails.expirationDate}
        />
      )}

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
              <th className={styles.chainHeader}>Chain</th>
              <th className={styles.balanceHeader}>Balance & Value</th>
              <th className={styles.protocolHeader}>Protocol</th>
              <th className={styles.apyHeader}>APY & Yield</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const assetKey = `${asset.token}-${asset.chain}`;
              const optimizationData = getOptimizationDataForAsset(asset);

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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YieldsTable; 