import React from 'react';
import Protocol from '../Protocol';
import WithdrawModal from '../WithdrawModal';
import LockAPYModal from '../LockAPYModal';
import styles from '../../pages/MyYieldsPage.module.css';
import { getNetworkIcon } from '../../utils/networkIcons';
import type { YieldCardProps } from './types';
import { useYieldCard } from './useYieldCard';
import MaturityBadge from './MaturityBadge';
import YieldInfo from './YieldInfo';
import YieldActions from './YieldActions';

const YieldCard: React.FC<YieldCardProps> = (props) => {
  const { 
    asset,
    onOptimize, 
    onLockAPY 
  } = props;
  
  const {
    // State
    isWithdrawModalOpen,
    isLockAPYModalOpen,
    isProcessingWithdrawal,
    isConfirming,
    isConfirmed,
    
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
    openWithdrawModal,
    closeWithdrawModal,
    openLockAPYModal,
    closeLockAPYModal,
    handleLockAPYConfirm,
    handleWithdrawComplete,
    handleWithdraw
  } = useYieldCard(props);

  // Get chain icon for overlay
  const chainIcon = getNetworkIcon(asset.chainId);
  
  return (
    <div className={styles.yieldCardSlim} style={{ position: 'relative' }}>
      <div className={styles.cardTopSection}>
        <div className={styles.assetInfoSlim}>
          <div className={styles.assetIconWrapper}>
            <img src={asset.icon} alt={asset.token} className={styles.assetIconSmall} />
            <img src={chainIcon} alt="Chain" className={styles.chainIconOverlay} />
          </div>
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
        onWithdrawClick={openWithdrawModal}
        onOptimize={onOptimize}
        onLockAPYClick={openLockAPYModal}
      />
      
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
        <LockAPYModal
          isOpen={isLockAPYModalOpen}
          onClose={closeLockAPYModal}
          onConfirm={handleLockAPYConfirm}
          asset={asset}
          protocol={lockYieldDetails.protocol}
          expirationDate={lockYieldDetails.expirationDate}
        />
      )}
    </div>
  );
};

export default YieldCard; 