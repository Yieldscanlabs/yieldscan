import React from 'react';
import Protocol from '../Protocol';
import AssetIcon from '../AssetIcon';
import styles from '../../pages/MyYieldsPage.module.css';
import { useOptimizationStore } from '../../store/optimizationStore';
import { useOptimizeInformationStore } from '../../store/optimizeInformationStore';
import { useLockAPYInformationStore } from '../../store/lockApyInformationStore';
import { useWithdrawModalStore } from '../../store/withdrawModalStore';
import type { YieldCardProps } from './types';
import { useYieldCard } from './useYieldCard';
import MaturityBadge from './MaturityBadge';
import YieldInfo from './YieldInfo';
import YieldActions from './YieldActions';
import { API_BASE_URL } from '../../utils/constants';

const YieldCard: React.FC<YieldCardProps> = (props) => {
  const {
    asset,
    optimizationData,
    onOptimize,
    onLockAPY
  } = props;

  const { openModal } = useOptimizationStore();
  const { openInformationModal } = useOptimizeInformationStore();
  const { openLockAPYInformationModal } = useLockAPYInformationStore();
  const { openModal: openWithdrawModalGlobal } = useWithdrawModalStore();

  const {
    // Token and protocol info
    protocol,
    apy,
    hasLockYield,
    lockYieldDetails,
    showMaturity,
    formattedMaturityDate,
    daysUntilMaturity,
    isNativeToken,
    chainId,

    // Calculated values
    balanceNum,
    dailyYieldUsd,
    yearlyYieldUsd,

    // Event handlers
    handleLockAPYConfirm,
    handleWithdrawComplete,
    handleWithdraw
  } = useYieldCard(props);

  // Handle optimization - open the global information modal
  const handleOptimize = () => {
    console.log('handleOptimize called in YieldCard', { optimizationData });
    if (optimizationData) {
      console.log('Opening global optimization information modal');
      openInformationModal({
        asset,
        optimizationData,
        onConfirm: handleOptimizeConfirm
      });
    } else {
      console.log('No optimization data available');
    }
  };

  // Handle optimization confirm - close information modal and open transaction modal via store
  const handleOptimizeConfirm = () => {
    console.log('handleOptimizeConfirm called', { optimizationData });
    if (optimizationData) {
      console.log('Opening transaction modal via store');

      // Open the transaction modal using the global store (like Lock flow)
      openModal({
        asset,
        currentProtocol: optimizationData.currentProtocol,
        currentApy: optimizationData.currentApy,
        betterProtocol: optimizationData.betterProtocol,
        betterApy: optimizationData.betterApy,
        additionalYearlyUsd: optimizationData.additionalYearlyUsd,
        onOptimize: onOptimize || (() => { })
      });
    }
  };

  // Handle Lock APY - open the global information modal
  const handleLockAPY = () => {
    console.log('handleLockAPY called in YieldCard', { lockYieldDetails });
    if (lockYieldDetails) {
      console.log('Opening global Lock APY information modal');
      openLockAPYInformationModal({
        asset,
        protocol: lockYieldDetails.protocol,
        expirationDate: lockYieldDetails.expirationDate,
        currentAPY: apy,
        amountToLock: balanceNum,
        onConfirm: handleLockAPYConfirm
      });
    } else {
      console.log('No lock yield details available');
    }
  };

  // Handle Withdraw - open the global withdraw modal
  const handleWithdrawClick = () => {
    openWithdrawModalGlobal({
      asset,
      protocol,
      balance: asset.currentBalanceInProtocol || 0,
      maxDecimals: asset.maxDecimalsShow || 6,
      isNativeToken,
      onWithdraw: handleWithdraw,
      onComplete: () => handleWithdrawComplete(true)
    });
  };

  return (
    asset.totalDeposited && asset.totalDeposited > 0 ?
      <div className={styles.yieldCardSlim} style={{ position: 'relative' }}>
        <div className={styles.cardTopSection}>
          <div className={styles.assetInfoSlim}>
            <AssetIcon
              assetIcon={asset.icon ? API_BASE_URL + asset.icon : ''}
              assetName={asset.token}
              chainId={asset.chainId}
              size="medium"
            />
            <div>
              <div className={styles.assetNameBold} style={{ display: 'flex', alignItems: 'center' }}>
                {asset.token}
                {showMaturity && (
                  <MaturityBadge
                    maturityDate={formattedMaturityDate}
                    formattedMaturityDate={formattedMaturityDate}
                    daysUntilMaturity={daysUntilMaturity}
                  />
                )}
              </div>
              <div className={styles.detailsRow}>
                <Protocol name={protocol} showLogo={true} className={styles.protocolBadge} />
              </div>
            </div>
          </div>

          <div className={styles.apyBadge}>
            <span className={styles.apyValue}>{apy.toFixed(2)}%</span>
            <span className={styles.apyLabel}>APY</span>
          </div>
        </div>

        <YieldInfo
          asset={asset}
          apy={apy}
          balanceNum={balanceNum}
          dailyYieldUsd={dailyYieldUsd}
          yearlyYieldUsd={yearlyYieldUsd}
        />

        <YieldActions
          asset={asset}
          hasLockYield={hasLockYield}
          chainId={chainId}
          optimizationData={optimizationData}
          onWithdrawClick={handleWithdrawClick}
          onOptimize={handleOptimize}
          onLockAPYClick={handleLockAPY}
        />
      </div>
      : <></>
  );
};

export default YieldCard; 