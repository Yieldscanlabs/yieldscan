import React from 'react';
import Protocol from '../Protocol';
import WithdrawModal from '../WithdrawModal';
import LockAPYInformationModal from '../LockAPYInformationModal';
import OptimizeInformationModal from '../OptimizeInformationModal';
import OptimizationModal from '../OptimizationModal';
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
    optimizationData,
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

  // Add optimization modal states
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = React.useState(false);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = React.useState(false);

  // Handle optimization - open the explanation modal first
  const handleOptimize = () => {
    console.log('handleOptimize called in YieldCard', { optimizationData });
    if (optimizationData) {
      console.log('Opening optimization explanation modal');
      setIsOptimizeModalOpen(true);
    } else {
      console.log('No optimization data available');
    }
  };

  // Handle optimization confirm - close explanation modal and open transaction modal
  const handleOptimizeConfirm = () => {
    console.log('handleOptimizeConfirm called', { optimizationData, onOptimize });
    if (optimizationData) {
      console.log('Closing explanation modal and opening transaction modal');
      setIsOptimizeModalOpen(false);
      setIsOptimizationModalOpen(true);
    }
  };

  // Handle optimization modal close
  const closeOptimizeModal = () => {
    setIsOptimizeModalOpen(false);
  };

  // Handle optimization transaction complete
  const handleOptimizationComplete = (success: boolean) => {
    console.log('Optimization transaction completed:', success);
    setIsOptimizationModalOpen(false);
    if (success && onOptimize) {
      onOptimize();
    }
  };

  // Handle optimization transaction modal close
  const closeOptimizationModal = () => {
    setIsOptimizationModalOpen(false);
  };

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
        optimizationData={optimizationData}
        onWithdrawClick={openWithdrawModal}
        onOptimize={handleOptimize}
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
        <LockAPYInformationModal
          isOpen={isLockAPYModalOpen}
          onClose={closeLockAPYModal}
          onConfirm={handleLockAPYConfirm}
          asset={asset}
          protocol={lockYieldDetails.protocol}
          expirationDate={lockYieldDetails.expirationDate}
        />
      )}

      {/* Explanation Modal - shows what will happen */}
      {optimizationData && (
        <OptimizeInformationModal
          isOpen={isOptimizeModalOpen}
          onClose={closeOptimizeModal}
          onConfirm={handleOptimizeConfirm}
          asset={asset}
          optimizationData={optimizationData}
        />
      )}

      {/* Transaction Modal - actually executes the optimization */}
      {optimizationData && (
        <OptimizationModal
          isOpen={isOptimizationModalOpen}
          onClose={closeOptimizationModal}
          onComplete={handleOptimizationComplete}
          asset={asset}
          currentProtocol={optimizationData.currentProtocol}
          currentApy={optimizationData.currentApy}
          betterProtocol={optimizationData.betterProtocol}
          betterApy={optimizationData.betterApy}
          additionalYearlyUsd={optimizationData.additionalYearlyUsd}
        />
      )}
    </div>
  );
};

export default YieldCard; 