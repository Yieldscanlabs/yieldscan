import React from 'react';
import styles from '../pages/MyYieldsPage.module.css';
import type { Asset } from '../types';
import { useChainId, useSwitchChain } from 'wagmi';
import { useOptimizationStore } from '../store/optimizationStore';
import Protocol from './Protocol';
import { getNetworkIcon } from '../utils/networkIcons';

interface OptimizationCardProps {
  asset: Asset;
  currentProtocol: string;
  currentApy: number;
  betterProtocol: string;
  betterApy: number;
  additionalYearlyUsd: string;
  onOptimize: () => void;
}

const OptimizationCard: React.FC<OptimizationCardProps> = ({
  asset,
  currentProtocol,
  currentApy,
  betterProtocol,
  betterApy,
  additionalYearlyUsd,
  onOptimize
}) => {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
  // Use the global store instead of local state
  const { 
    isSwitchingNetwork,
    networkSwitchStatus,
    setIsSwitchingNetwork,
    setNetworkSwitchStatus,
    openModal
  } = useOptimizationStore();
  
  // Calculate percentage improvement
  const apyImprovement = ((betterApy - currentApy) / currentApy * 100).toFixed(0);
  
  const handleOpenModal = async () => {
    if (chainId !== asset.chainId) {
      try {
        setIsSwitchingNetwork(true);
        setNetworkSwitchStatus('switching');
        await switchChain({ chainId: asset.chainId });
        
        setTimeout(() => {
          setNetworkSwitchStatus('success');
          setIsSwitchingNetwork(false);
          
          // Use the store action to open the modal
          openModal({
            asset,
            currentProtocol,
            currentApy,
            betterProtocol,
            betterApy,
            additionalYearlyUsd,
            onOptimize
          });
        }, 500);
      } catch (error) {
        console.error('Failed to switch networks:', error);
        setNetworkSwitchStatus('error');
        setIsSwitchingNetwork(false);
      }
    } else {
      // Use the store action to open the modal
      openModal({
        asset,
        currentProtocol,
        currentApy,
        betterProtocol,
        betterApy,
        additionalYearlyUsd,
        onOptimize
      });
    }
  };

  // Get chain icon based on asset's chainId
  const chainIcon = getNetworkIcon(asset.chainId);
  
  return (
    <div className={styles.optimizationCardCompact}>
      <div className={styles.cardHeader}>
        <div className={styles.assetInfoCompact}>
          <div className={styles.assetIconWrapper}>
            <img src={asset.icon} alt={asset.token} className={styles.assetIconSmall} />
            <img src={chainIcon} alt="Chain" className={styles.chainIconOverlay} />
          </div>
          <span className={styles.assetNameBold}>{asset.token}</span>
        </div>
        <div className={styles.improvementBadge}>+{apyImprovement}%</div>
      </div>
      
      <div className={styles.protocolComparison}>
        <div className={styles.protocolItem}>
          <span className={styles.protocolLabel}>Current</span>
          <div className={styles.protocolDetails}>
            <Protocol className={styles.protocolName} name={currentProtocol} showLogo={true} />
            <span className={styles.currentApy}>{currentApy.toFixed(2)}%</span>
          </div>
        </div>
        
        <div className={styles.arrowContainer}>
          <svg className={styles.arrowIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className={styles.protocolItem}>
          <span className={styles.protocolLabel}>Recommended</span>
          <div className={styles.protocolDetails}>
            <Protocol className={styles.protocolName} name={betterProtocol} showLogo={true} />
            <span className={styles.betterApy}>{betterApy.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className={styles.benefitRow}>
        <span>Additional yearly earnings:</span>
        <span className={styles.benefitAmount}>+${additionalYearlyUsd}</span>
      </div>
      
      <button 
        className={styles.optimizeButtonCompact} 
        onClick={handleOpenModal}
        disabled={isSwitchingNetwork}
      >
        {networkSwitchStatus === 'switching' ? (
          <div className={styles.loadingContainer}>
            <span className={styles.loadingIndicatorSmall}></span>
            <span>Switching network...</span>
          </div>
        ) : (
          <>
            <span>Optimize</span>
            <svg className={styles.arrowRightIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5L20 12L13 19M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

export default OptimizationCard;