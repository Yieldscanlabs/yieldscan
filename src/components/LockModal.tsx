import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './LockModal.module.css';
import { formatNumber } from '../utils/helpers';
import Protocol from './Protocol';
import { getNetworkIcon, getNetworkName } from '../utils/networkIcons';
import type { Asset } from '../types';
import useUnifiedLock from '../hooks/useUnifiedLock';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  asset: Asset;
  protocol: string;
  expirationDate: string;
  lockDetails: {
    name: string;
    swap: boolean;
    ytAddress: string;
    ptAddress: string;
    swapAddress: string;
    ytMarketAddress: string;
    ytDecimals: number;
    ptDecimals: number;
  };
}

const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  asset,
  protocol,
  expirationDate,
  lockDetails
}) => {
  // State for handling the lock process
  const [error, setError] = useState<string | null>(null);
  
  // Initialize useUnifiedLock hook based on protocol
  const {
    lock,
    isLocking,
    isApproving,
    isSwapping,
    isConfirming,
    isConfirmed,
    currentStep,
    totalSteps
  } = useUnifiedLock({
    protocol,
    lockDetails,
    asset,
    expirationDate
  });
  
  // Format expiration date for display - memoize to prevent recalculation
  const formattedExpirationDate = useMemo(() => {
    return new Date(expirationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [expirationDate]);
  
  // Get chain information - memoize to prevent recalculation
  const chainIcon = useMemo(() => getNetworkIcon(asset.chainId), [asset.chainId]);
  const chainName = useMemo(() => getNetworkName(asset.chainId), [asset.chainId]);
  
  // Add a ref to track if the process has been started
  const hasStartedRef = React.useRef(false);
  
  // Handle the lock process with useCallback to prevent unnecessary recreations
  const handleLock = useCallback(async () => {
    setError(null);
    
    try {
      const success = await lock(asset.balance);
      
      if (!success) {
        setError("Lock process failed. Please try again.");
      }
      // Wait for confirmation via the useEffect
    } catch (err) {
      console.error("Error during lock process:", err);
      setError("An error occurred during the lock process. Please try again.");
    }
  }, [lock, asset.balance]);
  
  // Start the lock process when modal opens
  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      // Set the ref to true to prevent multiple executions
      hasStartedRef.current = true;
      
      // Reset error state
      setError(null);
      
      // Begin the lock process
      handleLock();
    } else if (!isOpen) {
      // Reset the ref when modal is closed
      hasStartedRef.current = false;
    }
  }, [isOpen]);
  
  // Monitor the confirmation
  useEffect(() => {
    if (isConfirmed) {
      // Complete the process
      setTimeout(() => {
        onComplete(true);
      }, 1500);
    }
  }, [isConfirmed, onComplete]);
  
  // Handle retry if any step fails
  const handleRetry = useCallback(() => {
    setError(null);
    handleLock();
  }, []);
  
  // Get the steps based on protocol - memoize to prevent recreation on each render
  const steps = useMemo(() => {
    if (protocol.toLowerCase() === 'pendle') {
      return [
        { label: 'Approve Asset', description: 'Approve your tokens for swapping' },
        { label: 'Swap to PT/YT', description: 'Swap tokens to Principal and Yield tokens' },
        { label: 'Approve YT', description: 'Approve Yield tokens for selling' },
        { label: 'Sell YT', description: 'Sell Yield tokens to lock in returns' }
      ];
    } else {
      return [
        { label: 'Approve', description: 'Approve your tokens for the lock' },
        { label: 'Lock', description: 'Lock your tokens to guarantee yield' }
      ];
    }
  }, [protocol]);
  
  // Get current step status description
  const getStepDescription = useCallback((index: number) => {
    const stepInfo = steps[index - 1];
    
    if (!stepInfo) return '';
    
    if (currentStep === index) {
      if (isApproving) return `Approving ${asset.token}...`;
      if (isSwapping) return `Swapping ${asset.token}...`;
      if (isLocking) return `Locking ${asset.token}...`;
      return `Processing ${stepInfo.label.toLowerCase()}...`;
    } else if (currentStep === index && error) {
      return <span className={styles.errorText}>{stepInfo.label} failed. Please retry.</span>;
    } else if (currentStep > index) {
      return <span className={styles.successText}>{stepInfo.label} successful</span>;
    } else {
      return stepInfo.description;
    }
  }, [currentStep, isApproving, isSwapping, isLocking, error, asset.token, steps]);
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Lock APY for {asset.token}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.depositDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Asset</span>
              <span className={styles.detailValue}>
                <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
                {asset.token}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount</span>
              <span className={styles.detailValue}>
                {formatNumber(parseFloat(asset.balance), asset.maxDecimalsShow)} {asset.token}
                <span className={styles.subDetail}>(${formatNumber(parseFloat(asset.balanceUsd), 2)})</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Protocol</span>
              <span className={styles.detailValue}>
                <Protocol name={protocol} showLogo={true} />
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Network</span>
              <span className={styles.detailValue}>
                <img src={chainIcon} alt={chainName} className={styles.chainIconSmall} />
                {chainName}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Locked Until</span>
              <span className={styles.detailValue}>
                {formattedExpirationDate}
              </span>
            </div>
          </div>
          
          {/* <div className={styles.explanation}>
            {getProtocolExplanation}
          </div> */}
          
          <div className={styles.progressContainer}>
            <div className={styles.verticalProgressSteps}>
              {steps.map((stepInfo, index) => (
                <React.Fragment key={index}>
                  <div className={`${styles.verticalProgressStep} ${currentStep >= index + 1 ? styles.active : ''} ${currentStep > index + 1 ? styles.completed : ''}`}>
                    <div className={styles.stepDot}>
                      {currentStep > index + 1 ? '✓' : (index + 1)}
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepLabel}>{stepInfo.label}</div>
                      <div className={styles.stepDescription}>
                        {getStepDescription(index + 1)}
                      </div>
                      {currentStep === index + 1 && (isLocking || isApproving || isSwapping) && <div className={styles.stepSpinner}></div>}
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={styles.verticalProgressLine}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {error && (
              <div className={styles.error}>
                {error}
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}
            
            {isConfirmed && (
              <div className={styles.successContainer}>
                <div className={styles.successIcon}>✓</div>
                <h4 className={styles.successTitle}>Lock Complete!</h4>
                <p className={styles.successMessage}>
                  Your {asset.token} yield has been successfully locked until {formattedExpirationDate}.
                </p>
                <button className={styles.completeButton} onClick={() => onComplete(true)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockModal; 