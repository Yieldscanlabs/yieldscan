import React, { useState, useEffect } from 'react';
import styles from './LockModal.module.css';
import { formatNumber } from '../utils/helpers';
import Protocol from './Protocol';
import { getNetworkIcon, getNetworkName } from '../utils/networkIcons';
import type { Asset } from '../types';

// Mock hook until the real one is implemented
const useUnifiedLock = ({ protocol, lockDetails, asset, expirationDate }: any) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLocking, setIsLocking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const lock = async (amount: string) => {
    // Simulate a protocol-specific flow
    if (protocol.toLowerCase() === 'pendle') {
      // Pendle flow: approve > swap > approve YT > sell YT
      setIsApproving(true);
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate approval
      setIsApproving(false);
      
      setIsSwapping(true);
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate swap
      setIsSwapping(false);
      
      setIsApproving(true);
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate YT approval
      setIsApproving(false);
      
      setIsSwapping(true);
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate YT sale
      setIsSwapping(false);
    } else {
      // Generic flow: approve > lock
      setIsApproving(true);
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate approval
      setIsApproving(false);
      
      setIsLocking(true);
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate locking
      setIsLocking(false);
    }
    
    // Confirm transaction
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsConfirming(false);
    setIsConfirmed(true);
    
    return true;
  };
  
  return {
    lock,
    isLocking,
    isApproving,
    isSwapping,
    isConfirming,
    isConfirmed,
    currentStep,
    totalSteps: protocol.toLowerCase() === 'pendle' ? 4 : 2
  };
};

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
  // Current step tracking (dynamic based on protocol)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format expiration date for display
  const formattedExpirationDate = new Date(expirationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get chain information
  const chainIcon = getNetworkIcon(asset.chainId);
  const chainName = getNetworkName(asset.chainId);
  
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
    protocol: protocol,
    lockDetails,
    asset,
    expirationDate
  });
  
  // Add a ref to track if the process has been started
  const hasStartedRef = React.useRef(false);
  
  // Start the lock process when modal opens
  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      // Set the ref to true to prevent multiple executions
      hasStartedRef.current = true;
      
      // Reset states
      setStep(1);
      setError(null);
      setIsLoading(false);
      
      // Begin the lock process
      handleLock();
    } else if (!isOpen) {
      // Reset the ref when modal is closed
      hasStartedRef.current = false;
    }
  }, [isOpen]);
  
  // Update step based on current step from the hook
  useEffect(() => {
    if (currentStep) {
      setStep(currentStep);
    }
  }, [currentStep]);
  
  // Monitor the confirmation
  useEffect(() => {
    if (isConfirmed) {
      // Complete the process
      setIsLoading(false);
      setTimeout(() => {
        onComplete(true);
      }, 1500);
    }
  }, [isConfirmed, onComplete]);
  
  // Handle the lock process
  const handleLock = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await lock(asset.balance);
      
      if (!success) {
        setError("Lock process failed. Please try again.");
        setIsLoading(false);
      }
      // Wait for confirmation via the useEffect
    } catch (err) {
      console.error("Error during lock process:", err);
      setError("An error occurred during the lock process. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle retry if any step fails
  const handleRetry = () => {
    setError(null);
    handleLock();
  };
  
  // Get protocol-specific explanation
  const getProtocolExplanation = () => {
    switch (protocol.toLowerCase()) {
      case 'pendle':
        return (
          <p>
            Your {asset.token} will be swapped to Principal Tokens (PT) and Yield Tokens (YT) on Pendle.
            The YT will be sold to guarantee your yield until {formattedExpirationDate}.
          </p>
        );
      default:
        return (
          <p>
            Your {asset.token} will be locked to guarantee the yield until {formattedExpirationDate}.
          </p>
        );
    }
  };
  
  // Get the steps based on protocol
  const getSteps = () => {
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
  };
  
  // Get current step status description
  const getStepDescription = (index: number) => {
    const steps = getSteps();
    const stepInfo = steps[index - 1];
    
    if (!stepInfo) return '';
    
    if (step === index && isLoading) {
      if (isApproving) return `Approving ${asset.token}...`;
      if (isSwapping) return `Swapping ${asset.token}...`;
      if (isLocking) return `Locking ${asset.token}...`;
      return `Processing ${stepInfo.label.toLowerCase()}...`;
    } else if (step === index && error) {
      return <span className={styles.errorText}>{stepInfo.label} failed. Please retry.</span>;
    } else if (step > index) {
      return <span className={styles.successText}>{stepInfo.label} successful</span>;
    } else {
      return stepInfo.description;
    }
  };
  
  if (!isOpen) return null;
  
  const steps = getSteps();
  
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
            {getProtocolExplanation()}
          </div> */}
          
          <div className={styles.progressContainer}>
            <div className={styles.verticalProgressSteps}>
              {steps.map((stepInfo, index) => (
                <React.Fragment key={index}>
                  <div className={`${styles.verticalProgressStep} ${step >= index + 1 ? styles.active : ''} ${step > index + 1 ? styles.completed : ''}`}>
                    <div className={styles.stepDot}>
                      {step > index + 1 ? '✓' : (index + 1)}
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepLabel}>{stepInfo.label}</div>
                      <div className={styles.stepDescription}>
                        {getStepDescription(index + 1)}
                      </div>
                      {step === index + 1 && isLoading && <div className={styles.stepSpinner}></div>}
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