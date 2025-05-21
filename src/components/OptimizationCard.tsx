import React from 'react';
import styles from '../pages/MyYieldsPage.module.css';
import type { Asset } from '../types';
import { useChainId, useSwitchChain } from 'wagmi';
import { useOptimizationStore } from '../store/optimizationStore';
import Protocol from './Protocol';

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
  
  return (
    <div className={styles.optimizationCardCompact}>
      <div className={styles.cardHeader}>
        <div className={styles.assetInfoCompact}>
          <img src={asset.icon} alt={asset.token} className={styles.assetIconSmall} />
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
          <span className={styles.arrow}>→</span>
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
          <span className={styles.loadingIndicatorSmall}></span>
        ) : (
          'Optimize'
        )}
      </button>
    </div>
  );
};

export default OptimizationCard;