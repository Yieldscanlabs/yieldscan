import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const stepsRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stepsContainerRef = useRef<HTMLDivElement | null>(null);

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
        title: `${step.title}`,
        type: 'withdraw' as const,
        originalIndex: index
      });
    });

    // Add deposit steps with "Deposit" prefix
    depositSteps.steps.forEach((step, index) => {
      combined.push({
        ...step,
        title: `${step.title}`,
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
    }
    //  else if (!isOpen) {
    //   // setHasStarted(false);
    //   setCurrentStepIndex(0);
    //   setCompletedSteps(new Set());
    //   setError(null);
    //   setIsExecuting(false);
    // }
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

  // Auto-scroll the current step into view for long step lists
  useEffect(() => {
    const currentEl = stepsRefs.current[currentStepIndex];
    if (currentEl && stepsContainerRef.current) {
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStepIndex]);

  const retryCurrentStep = () => {
    setError(null);
    executeStep(currentStepIndex);
  };

  if (!isOpen) return null;

  const isLoading = withdrawSteps.isLoading || depositSteps.isLoading;
  const allCompleted = currentStepIndex >= allSteps.length && allSteps.length > 0;
  const progressPercent = allSteps.length === 0 ? 0 : Math.min(100, Math.round((completedSteps.size / allSteps.length) * 100));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Optimize {asset.token} Yield</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Top inline progress bar */}
        {allSteps.length > 0 && (
          <div
            style={{
              width: '100%',
              height: 6,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #36d1dc, #5b86e5)',
                transition: 'width 400ms ease',
              }}
            />
          </div>
        )}

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
                <Protocol name={betterProtocol} /> <span className={styles.subDetail}>({betterApy.toFixed(2)}% APY)</span>
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
                <span
                  className={styles.stepCounter}
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: 999,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(11,18,32,0.6)'
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(90deg, rgba(86,224,145,0.18), rgba(91,134,229,0.18))',
                      width: `${progressPercent}%`,
                      transition: 'width 300ms ease',
                    }}
                  />
                  <span style={{ position: 'relative', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ fontWeight: 700 }}>{completedSteps.size}</span>
                    <span style={{ opacity: 0.7 }}> / {allSteps.length}</span>
                    <span style={{ opacity: 0.6 }}> completed</span>
                  </span>
                </span>
              </div>

              {/* Horizontal Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0 16px 0' }}>
                {allSteps.map((step, index) => {
                  const isCompleted = completedSteps.has(index);
                  const isCurrent = currentStepIndex === index;
                  const isPending = index > currentStepIndex;

                  const nodeBorder = isPending ? '1px solid rgba(255,255,255,0.2)' : 'none';
                  const nodeBg = isCompleted
                    ? 'linear-gradient(135deg, #2AF598 0%, #00C6FF 100%)'
                    : isCurrent
                      ? 'linear-gradient(135deg, #5e8bff 0%, #7b61ff 100%)'
                      : 'rgba(255,255,255,0.08)';
                  const nodeColor = isPending ? 'rgba(255,255,255,0.6)' : '#0b1220';
                  const connectorColor = isCompleted
                    ? 'rgba(42,245,152,0.8)'
                    : isCurrent
                      ? 'rgba(94,139,255,0.8)'
                      : 'rgba(255,255,255,0.15)';

                  return (
                    <React.Fragment key={`${step.type}-${step.originalIndex}-h`}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            background: nodeBg,
                            border: nodeBorder,
                            color: nodeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                            boxShadow: isCurrent ? '0 0 0 3px rgba(123,97,255,0.25)' : 'none'
                          }}
                        >
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 11, color: isPending ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 80 }}>
                          {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                        </div>
                      </div>
                      {index < allSteps.length - 1 && (
                        <div style={{ flex: 1, height: 4, minWidth: 40, background: connectorColor, borderRadius: 4 }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Current Step Details */}
              <div style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: "8px 14px 8px 8px"
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
                  <div style={{ fontWeight: 600 }}>{allSteps[currentStepIndex]?.title}</div>
                  {error ? (
                    <span style={{ fontSize: 11, color: '#ff8a8a', padding: '2px 8px', background: 'rgba(255,138,138,0.12)', borderRadius: 6 }}>Failed</span>
                  ) : isExecuting ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#99e1ff', padding: '2px 8px', background: 'rgba(153,225,255,0.12)', borderRadius: 6 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          border: '2px solid rgba(153,225,255,0.35)',
                          borderTopColor: '#99e1ff',
                          animation: 'spin 0.8s linear infinite'
                        }}
                      />
                      Executing
                    </span>
                  ) : completedSteps.has(currentStepIndex) ? (
                    <span style={{ fontSize: 11, color: '#7af7ba', padding: '2px 6px', background: 'rgba(122,247,186,0.12)', borderRadius: 6 }}>Completed</span>
                  ) : null}
                </div>
                <div style={{ opacity: 0.8, fontSize: 13 }}>
                  {allSteps[currentStepIndex]?.description}
                </div>
                {/* {isExecuting && <div className={styles.stepSpinner} />} */}
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