import React, { useState, useEffect } from 'react';
import styles from './DepositModal.module.css';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import Protocol from './Protocol';
import useDepositSteps from '../hooks/useDepositSteps';
import useWalletConnection from '../hooks/useWalletConnection';
import { useAssetStore } from '../store/assetStore';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  onLockInitiate?: () => void;
  isLocked?: boolean;
  asset: Asset;
  amount: string;
  amountUsd: string;
  protocol: string;
  dailyYieldUsd: string;
  yearlyYieldUsd: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onLockInitiate,
  isLocked = false,
  asset,
  amount,
  amountUsd,
  protocol,
  yearlyYieldUsd
}) => {
  const { wallet } = useWalletConnection();
  const { fetchAssets } = useAssetStore();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Use the new dynamic steps hook
  const {
    steps,
    isLoading: isLoadingSteps,
    error: stepsError,
    currentStep,
    isExecuting,
    executedSteps,
    executionError,
    isConfirming,
    isConfirmed,
    executeAllSteps,
    retryCurrentStep
  } = useDepositSteps({
    contractAddress: asset.address,
    chainId: asset.chainId,
    protocol: protocol.toLowerCase(),
    amount,
    tokenDecimals: asset.decimals
  });

  // Auto-start execution when modal opens and steps are loaded
  useEffect(() => {
    if (isOpen && steps.length > 0 && !hasStarted && !isExecuting && !isCompleted) {
      setHasStarted(true);
      
      // Call onLockInitiate when starting
      if (onLockInitiate) {
        onLockInitiate();
      }
      
      // Start executing all steps
      executeAllSteps().then((success) => {
        if (success) {
          setIsCompleted(true);
          // Refresh assets after successful deposit
          if (wallet.address) {
            fetchAssets(wallet.address, false);
          }
          
          // Complete after a brief delay
          setTimeout(() => {
            onComplete(true);
          }, 1500);
        }
      });
    }
  }, [isOpen, steps.length, hasStarted, isExecuting, isCompleted]);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setHasStarted(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  // Handle retry
  const handleRetry = () => {
    retryCurrentStep();
  };

  if (!isOpen) return null;

  // Create a handler that checks if modal can be closed
  const handleCloseAttempt = (e: React.MouseEvent) => {
    if (!isLocked) {
      onClose();
    } else {
      // Prevent closing if locked
      e.stopPropagation();
    }
  };

  const error = stepsError || executionError;

  return (
    <div className={styles.overlay} onClick={handleCloseAttempt}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Deposit {asset.token}</h3>
          <button 
            className={`${styles.closeButton} ${isLocked ? styles.disabled : ''}`} 
            onClick={handleCloseAttempt}
            disabled={isLocked}
          >×</button>
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
                {formatNumber(parseFloat(amount), asset.maxDecimalsShow)} {asset.token}
                <span className={styles.subDetail}>(${amountUsd})</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Protocol</span>
              <Protocol name={protocol} className={styles.detailValue} />
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Expected Yield</span>
              <span className={styles.detailValue}>
                <span className={styles.yieldValue}>${yearlyYieldUsd}/year</span>
              </span>
            </div>
          </div>

          <div className={styles.progressContainer}>
            {isLoadingSteps ? (
              <div className={styles.loadingSteps}>
                <div className={styles.stepSpinner}></div>
                <span>Loading deposit steps...</span>
              </div>
            ) : steps.length > 0 ? (
              <div className={styles.verticalProgressSteps}>
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = executedSteps.has(index);
                  const isCurrentlyExecuting = isActive && isExecuting;

                  return (
                    <div key={step.id}>
                      <div className={`${styles.verticalProgressStep} ${isActive || isCompleted ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
                        <div className={styles.stepDot}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className={styles.stepContent}>
                          <div className={styles.stepLabel}>{step.title}</div>
                          <div className={styles.stepDescription}>
                            {isCurrentlyExecuting ? (
                              <>Executing {step.description.toLowerCase()}...</>
                            ) : isCompleted ? (
                              <span className={styles.successText}>{step.title} completed</span>
                            ) : isActive && error ? (
                              <span className={styles.errorText}>{step.title} failed. Please retry.</span>
                            ) : (
                              step.description
                            )}
                          </div>
                          {isCurrentlyExecuting && <div className={styles.stepSpinner}></div>}
                        </div>
                      </div>
                      
                      {index < steps.length - 1 && (
                        <div className={styles.verticalProgressLine}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
            
            {error && (
              <div className={styles.error}>
                {error}
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}
            
            {isLocked && (isExecuting || isConfirming) && (
              <div className={styles.lockWarning}>
                Please wait for the transaction to complete. This modal cannot be closed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;