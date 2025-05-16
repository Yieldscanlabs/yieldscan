import React, { useState } from 'react';
import styles from '../pages/MyYieldsPage.module.css';
import type { Asset } from '../types';
import OptimizationModal from './OptimizationModal';
import { useChainId, useSwitchChain } from 'wagmi';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [networkSwitchStatus, setNetworkSwitchStatus] = useState<'idle' | 'switching' | 'success' | 'error'>('idle');
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  
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
          setIsModalOpen(true);
        }, 500);
      } catch (error) {
        console.error('Failed to switch networks:', error);
        setNetworkSwitchStatus('error');
        setIsSwitchingNetwork(false);
      }
    } else {
      setIsModalOpen(true);
    }
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setNetworkSwitchStatus('idle');
  };
  
  const handleModalComplete = (success: boolean) => {
    setIsModalOpen(false);
    if (success) {
      onOptimize();
    }
    setNetworkSwitchStatus('idle');
  };
  
  return (
    <>
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
              <span className={styles.protocolName}>{currentProtocol}</span>
              <span className={styles.currentApy}>{currentApy.toFixed(2)}%</span>
            </div>
          </div>
          
          <div className={styles.arrowContainer}>
            <span className={styles.arrow}>→</span>
          </div>
          
          <div className={styles.protocolItem}>
            <span className={styles.protocolLabel}>Recommended</span>
            <div className={styles.protocolDetails}>
              <span className={styles.protocolName}>{betterProtocol}</span>
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
      
      <OptimizationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onComplete={handleModalComplete}
        asset={asset}
        currentProtocol={currentProtocol}
        currentApy={currentApy}
        betterProtocol={betterProtocol}
        betterApy={betterApy}
        additionalYearlyUsd={additionalYearlyUsd}
      />
    </>
  );
};

export default OptimizationCard;