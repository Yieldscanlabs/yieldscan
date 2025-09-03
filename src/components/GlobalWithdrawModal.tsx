import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/helpers';
import { useWithdrawModalStore } from '../store/withdrawModalStore';
import { useAssetStore } from '../store/assetStore';
import useWalletConnection from '../hooks/useWalletConnection';
import useWithdrawSteps from '../hooks/useWithdrawSteps';
import styles from './WithdrawModal.module.css';
import Protocol from './Protocol';
import ThumbSlider from './ThumbSlider';

const GlobalWithdrawModal: React.FC = () => {
  const {
    isOpen,
    asset,
    protocol,
    balance,
    maxDecimals,
    isNativeToken,
    closeModal
  } = useWithdrawModalStore();

  const { wallet } = useWalletConnection();
  const { fetchAssets } = useAssetStore();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [hasStartedWithdraw, setHasStartedWithdraw] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Use the withdrawal steps hook
  const {
    steps,
    isLoading: isLoadingSteps,
    error: stepsError,
    currentStep,
    isExecuting,
    executedSteps,
    executionError,
    isConfirming,
    executeAllSteps,
    retryCurrentStep
  } = useWithdrawSteps({
    id: asset?.id || '',
    contractAddress: asset?.address || '',
    chainId: asset?.chainId || 1,
    protocol: protocol || '',
    amount: withdrawAmount,
    tokenDecimals: asset?.decimals || 18,
    asset: asset || undefined
  });
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount('');
      setPercentage(0);
      setHasStartedWithdraw(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  // Handle slider percentage change
  const handleSliderChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    
    // If 100% is selected, use the exact balance value to avoid rounding errors
    if (newPercentage === 100) {
      setWithdrawAmount(balance.toString());
    } else {
      const calculatedAmount = (balance * newPercentage / 100).toFixed(6);
      setWithdrawAmount(calculatedAmount);
    }
  };

  // Handle withdraw button click
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return;
    }

    setHasStartedWithdraw(true);

    try {
      const success = await executeAllSteps();
      if (success) {
        setIsCompleted(true);
        // Refresh assets after successful withdrawal
        if (wallet.address) {
          fetchAssets(wallet.address, false);
        }
        
        // Complete after a brief delay
        setTimeout(() => {
          closeModal();
        }, 1500);
      }
    } catch (err) {
      console.error('Withdrawal failed:', err);
    }
  };

  // Handle retry
  const handleRetry = () => {
    retryCurrentStep();
  };

  if (!isOpen || !asset) return null;
  
  // Calculate USD value
  const usdPrice = asset.usd;
  const amountUsd = (parseFloat(withdrawAmount || '0') * usdPrice).toFixed(2);

  // Determine if we should show steps (only if more than 1 step)
  const shouldShowSteps = steps.length > 1 && hasStartedWithdraw;
  const error = stepsError || executionError;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Withdraw {asset.token}</h3>
          <button className={styles.closeButton} onClick={closeModal}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          {isCompleted ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h4 className={styles.successTitle}>Withdrawal Successful!</h4>
              <p className={styles.successMessage}>
                Your {asset.token} has been successfully withdrawn from {protocol}.
              </p>
            </div>
          ) : (
            <>
              {!hasStartedWithdraw && (
                <div className={styles.withdrawDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Asset</span>
                    <span className={styles.detailValue}>
                      <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
                      {asset.token}
                      {isNativeToken && <span className={styles.nativeBadge}>(Native)</span>}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Available Balance</span>
                    <span className={styles.detailValue}>
                      {formatNumber(balance, maxDecimals)}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Protocol</span>
                    <Protocol name={protocol} className={styles.detailValue} />
                  </div>
                </div>
              )}

              {!hasStartedWithdraw ? (
                <div className={styles.amountContainer}>
                  <label className={styles.amountLabel}>Withdraw Amount</label>
                  <div className={styles.amountDisplay}>
                    <div>
                      <span className={styles.amountValue}>
                        {formatNumber(parseFloat(withdrawAmount || '0'), maxDecimals)}
                      </span>
                      <span className={styles.amountToken}>{asset.token}</span>
                    </div>
                    <div className={styles.amountUsd}>${amountUsd}</div>
                  </div>
                  
                  <ThumbSlider
                    value={percentage}
                    onChange={handleSliderChange}
                  />

                  <button 
                    className={styles.withdrawButton}
                    onClick={handleWithdraw}
                    disabled={isLoadingSteps || parseFloat(withdrawAmount || '0') <= 0}
                  >
                    <span className={styles.buttonIcon}>↓</span>
                    {isLoadingSteps ? 'Loading...' : `Withdraw ${asset.token}`}
                    {isNativeToken ? ' (Native)' : ''}
                  </button>
                </div>
              ) : (
                <div className={styles.progressContainer}>
                  {/* Withdrawal Summary Tab */}
                  <div className={styles.withdrawalSummary}>
                    <div className={styles.summaryHeader}>
                      <h4>Withdrawal Summary</h4>
                    </div>
                    <div className={styles.summaryContent}>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Amount</span>
                        <span className={styles.summaryValue}>
                          {formatNumber(parseFloat(withdrawAmount), maxDecimals)} {asset.token}
                          <span className={styles.summaryUsd}>${amountUsd}</span>
                        </span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>Protocol</span>
                        <span className={styles.summaryValue}>
                          <Protocol name={protocol} />
                        </span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span className={styles.summaryLabel}>APY Lost</span>
                        <span className={styles.summaryValue}>
                          <span className={styles.apyLost}>
                            {/* Calculate approximate APY based on asset data - this is a placeholder */}
                            ~{((parseFloat(withdrawAmount || '0') / balance) * 100).toFixed(1)}%
                          </span>
                          <span className={styles.apyNote}>of position</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {shouldShowSteps && steps.length > 0 ? (
                    <div className={styles.verticalProgressSteps}>
                      {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompletedStep = executedSteps.has(index);
                        const isCurrentlyExecuting = isActive && isExecuting;

                        return (
                          <div key={step.id}>
                            <div className={`${styles.verticalProgressStep} ${isActive || isCompletedStep ? styles.active : ''} ${isCompletedStep ? styles.completed : ''}`}>
                              <div className={styles.stepDot}>
                                {isCompletedStep ? '✓' : index + 1}
                              </div>
                              <div className={styles.stepContent}>
                                <div className={styles.stepLabel}>{step.title}</div>
                                <div className={styles.stepDescription}>
                                  {isCurrentlyExecuting ? (
                                    <>Executing {step.description.toLowerCase()}...</>
                                  ) : isCompletedStep ? (
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
                  ) : (
                    // Single step execution with improved design
                    <div className={styles.singleStepExecution}>
                      <div className={styles.executionCard}>
                        <div className={styles.executionHeader}>
                          <div className={styles.executionIcon}>
                            <div className={styles.pulsingSpinner}></div>
                          </div>
                          <h4>Processing Withdrawal</h4>
                        </div>
                        <div className={styles.executionStatus}>
                          {isExecuting || isConfirming ? (
                            <div className={styles.statusActive}>
                              <span className={styles.statusText}>
                                {isConfirming ? 'Confirming transaction...' : `Withdrawing from ${protocol}...`}
                              </span>
                              <div className={styles.statusIndicator}>
                                <div className={styles.progressDots}>
                                  <span className={styles.dot}></span>
                                  <span className={styles.dot}></span>
                                  <span className={styles.dot}></span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className={styles.statusText}>Preparing withdrawal...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className={styles.error}>
                      {error}
                      <button className={styles.retryButton} onClick={handleRetry}>
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalWithdrawModal; 