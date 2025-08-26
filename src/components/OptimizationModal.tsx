import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './DepositModal.module.css'; // Reuse the deposit modal styles
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import Protocol from './Protocol';
import useWithdrawSteps from '../hooks/useWithdrawSteps';
import useDepositSteps from '../hooks/useDepositSteps';
import { useAssetStore } from '../store/assetStore';
import { useAccount } from 'wagmi';

interface OptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  asset: Asset;
  currentProtocol: string;
  currentApy: number;
  betterProtocol: string;
  betterApy: number;
  additionalYearlyUsd: string;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  asset,
  currentProtocol,
  currentApy,
  betterProtocol,
  betterApy,
  additionalYearlyUsd
}) => {
  const { address } = useAccount();
  const { fetchAssets } = useAssetStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Get withdrawal steps
  const withdrawSteps = useWithdrawSteps({
    id: asset.id,
    contractAddress: asset.address,
    chainId: asset.chainId,
    protocol: currentProtocol,
    amount: asset.balance,
    tokenDecimals: asset.decimals,
    asset
  });

  // Get deposit steps for the underlying asset
  const depositSteps = useDepositSteps({
    id: asset.id,
    contractAddress: asset.underlyingAsset || asset.address,
    chainId: asset.chainId,
    protocol: betterProtocol,
    amount: asset.balance,
    tokenDecimals: asset.decimals
  });

  // Combine all steps into a single array
  const allSteps = useMemo(() => {
    interface CombinedStep {
      title: string;
      description: string;
      type: 'withdraw' | 'deposit';
      originalIndex: number;
      [key: string]: any; // Allow other properties from the original steps
    }
    
    const combined: CombinedStep[] = [];
    
    // Add withdrawal steps with "Withdraw" prefix
    withdrawSteps.steps.forEach((step, index) => {
      combined.push({
        ...step,
        title: `Withdraw: ${step.title}`,
        type: 'withdraw' as const,
        originalIndex: index
      });
    });
    
    // Add deposit steps with "Deposit" prefix
    depositSteps.steps.forEach((step, index) => {
      combined.push({
        ...step,
        title: `Deposit: ${step.title}`,
        type: 'deposit' as const,
        originalIndex: index
      });
    });
    
    return combined;
  }, [withdrawSteps.steps, depositSteps.steps]);

  const executeStep = useCallback(async (stepIndex: number) => {
    if (stepIndex >= allSteps.length || isExecuting) return false;

    const currentStep = allSteps[stepIndex];
    setIsExecuting(true);
    setError(null);

    try {
      let success = false;

      if (currentStep.type === 'withdraw') {
        success = await withdrawSteps.executeStep(currentStep.originalIndex);
      } else {
        success = await depositSteps.executeStep(currentStep.originalIndex);
      }

      if (success) {
        setCompletedSteps(prev => new Set([...prev, stepIndex]));
        setCurrentStepIndex(stepIndex + 1);
      } else {
        setError(`Failed to execute ${currentStep.title}`);
      }
      
      setIsExecuting(false);
      return success;
    } catch (err) {
      console.error('Error executing step:', err);
      setError(`Error executing ${currentStep.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsExecuting(false);
      return false;
    }
  }, [allSteps, withdrawSteps, depositSteps, isExecuting]);

  // Auto-start when modal opens
  useEffect(() => {
    if (isOpen && !hasStarted && allSteps.length > 0) {
      setHasStarted(true);
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setError(null);
      executeStep(0);
    } else if (!isOpen) {
      setHasStarted(false);
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setError(null);
      setIsExecuting(false);
    }
  }, [isOpen, allSteps.length, hasStarted, executeStep]);

  // Handle step progression
  useEffect(() => {
    if (hasStarted && !isExecuting && !error && currentStepIndex > 0 && currentStepIndex < allSteps.length) {
      const timer = setTimeout(() => {
        executeStep(currentStepIndex);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (currentStepIndex >= allSteps.length && allSteps.length > 0 && hasStarted) {
      // All steps completed - refresh assets then complete
      const completeOptimization = async () => {
        if (address) {
          await fetchAssets(address, false); // Refresh assets silently
        }
        setTimeout(() => {
          onComplete(true);
        }, 1500);
      };
      completeOptimization();
    }
  }, [currentStepIndex, isExecuting, error, hasStarted, allSteps.length, executeStep, onComplete, address, fetchAssets]);

  const retryCurrentStep = () => {
    setError(null);
    executeStep(currentStepIndex);
  };

  if (!isOpen) return null;

  const isLoading = withdrawSteps.isLoading || depositSteps.isLoading;
  const allCompleted = currentStepIndex >= allSteps.length && allSteps.length > 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Optimize {asset.token} Yield</h3>
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
              <span className={styles.detailLabel}>From</span>
              <span className={styles.detailValue}>
                <Protocol name={currentProtocol} /> <span className={styles.subDetail}>({currentApy.toFixed(2)}% APY)</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>To</span>
              <span className={styles.detailValue}>
                <Protocol name={betterProtocol}/> <span className={styles.subDetail}>({betterApy.toFixed(2)}% APY)</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Yearly Benefit</span>
              <span className={styles.detailValue}>
                <span className={styles.yieldValue}>+${additionalYearlyUsd}</span>
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading optimization steps...</p>
            </div>
          ) : allSteps.length === 0 ? (
            <div className={styles.errorContainer}>
              <p>No optimization steps available</p>
            </div>
          ) : allCompleted ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h4 className={styles.successTitle}>Optimization Complete!</h4>
              <p className={styles.successMessage}>
                Your {asset.token} has been successfully moved from {currentProtocol} to {betterProtocol} for higher yield.
              </p>
              <button className={styles.completeButton} onClick={() => onComplete(true)}>
                Done
              </button>
            </div>
          ) : (
            <div className={styles.stepsContainer}>
              <div className={styles.stepsHeader}>
                <h4>Optimization Progress</h4>
                <span className={styles.stepCounter}>{completedSteps.size} of {allSteps.length} completed</span>
              </div>
              
              <div className={styles.stepsList}>
                {allSteps.map((step, index) => {
                  const isCompleted = completedSteps.has(index);
                  const isCurrent = currentStepIndex === index;
                  const isPending = index > currentStepIndex;
                  
                  return (
                    <div 
                      key={`${step.type}-${step.originalIndex}`}
                      className={`${styles.stepItem} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.active : ''} ${isPending ? styles.pending : ''}`}
                    >
                      <div className={styles.stepNumber}>
                        {isCompleted ? '✓' : index + 1}
                      </div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepTitle}>{step.title}</div>
                        <div className={styles.stepDescription}>
                          {step.description}
                        </div>
                        {isCurrent && isExecuting && (
                          <div className={styles.stepSpinner}></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className={styles.errorContainer}>
                  <p className={styles.errorText}>{error}</p>
                  <button className={styles.retryButton} onClick={retryCurrentStep}>
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;