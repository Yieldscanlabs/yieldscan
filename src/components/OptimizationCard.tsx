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
  
  const handleOpenModal = async () => {
    // Check if we're on the correct network before opening the modal
    if (chainId !== asset.chainId) {
      try {
        setIsSwitchingNetwork(true);
        setNetworkSwitchStatus('switching');
        
        // Switch to the correct network first
        await switchChain({ chainId: asset.chainId });
        
        // Add a small delay to ensure UI updates
        setTimeout(() => {
          setNetworkSwitchStatus('success');
          setIsSwitchingNetwork(false);
          // Once switched successfully, open the modal
          setIsModalOpen(true);
        }, 500);
      } catch (error) {
        console.error('Failed to switch networks:', error);
        setNetworkSwitchStatus('error');
        setIsSwitchingNetwork(false);
        // Could add user notification here
      }
    } else {
      // Already on correct network, just open the modal
      setIsModalOpen(true);
    }
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset status when modal closes
    setNetworkSwitchStatus('idle');
  };
  
  const handleModalComplete = (success: boolean) => {
    setIsModalOpen(false);
    if (success) {
      onOptimize();
    }
    // Reset status when modal completes
    setNetworkSwitchStatus('idle');
  };
  
  // Button text and class based on network switch status
  const getButtonText = () => {
    if (networkSwitchStatus === 'switching') return 'Optimizing...';
    return 'Optimize Now';
  };
  
  const getButtonClass = () => {
    let baseClass = styles.optimizeButton;
    return baseClass;
  };
  
  return (
    <>
      <div className={styles.optimizationCard}>
        <div className={styles.optimizationHeader}>
          <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
          <div className={styles.optimizationTitle}>
            {asset.token} can earn more
          </div>
        </div>
        
        <div className={styles.comparisonRow}>
          <div className={styles.currentOption}>
            <div className={styles.optionProtocol}>{currentProtocol}</div>
            <div className={styles.optionApy}>{currentApy.toFixed(2)}% APY</div>
            <div className={styles.optionLabel}>Current</div>
          </div>
          
          <div className={styles.comparisonArrow}>→</div>
          
          <div className={styles.betterOption}>
            <div className={styles.optionProtocol}>{betterProtocol}</div>
            <div className={styles.optionApy}>{betterApy.toFixed(2)}% APY</div>
            <div className={styles.optionLabel}>Recommended</div>
          </div>
        </div>
        
        <div className={styles.optimizationBenefit}>
          <div className={styles.benefitLabel}>Additional yearly earnings</div>
          <div className={styles.benefitValue}>+${additionalYearlyUsd}</div>
        </div>
        
        <button 
          className={getButtonClass()} 
          onClick={handleOpenModal}
          disabled={isSwitchingNetwork}
        >
          {getButtonText()}
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