import React, { useState, useEffect } from 'react';
import styles from './DepositModal.module.css';
import { formatNumber } from '../utils/helpers';
import type { Asset, SupportedToken } from '../types';
import useERC20 from '../hooks/useERC20';
import { COMPOUND_V3_MARKETS } from '../hooks/useCompoundApy';

const setupProtocol = (protocol: string, token: SupportedToken, chainId: number) => {
    console.log(protocol, token, chainId);
    if(protocol === 'Compound') {
        return COMPOUND_V3_MARKETS[chainId][token] as `0x${string}`;
    }
    return '0x'
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
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
  asset,
  amount,
  amountUsd,
  protocol,
  dailyYieldUsd,
  yearlyYieldUsd
}) => {
  const [step, setStep] = useState(1); // Start directly at step 1 (approval)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Protocol contract address - in a real app this would come from a config or lookup
  const protocolAddress: `0x${string}` = setupProtocol(protocol, asset.token, asset.chainId);
  
  // Initialize ERC20 hook for approval checking
  const { 
    allowance,
    hasEnoughAllowance,
    approve,
    isApproving
  } = useERC20({
    tokenAddress: asset.address as `0x${string}`,
    spenderAddress: protocolAddress,
  });

  // Check if we need approval or already have enough allowance
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      const hasEnough = hasEnoughAllowance(amount);
      // Check if we already have approval
      if (hasEnough) {
        // If already approved, skip to step 2
        setStep(2);
        // Move to complete after a brief delay
        setTimeout(() => {
          onComplete(true);
        }, 1500);
      } else {
        // Start approval process
        handleApprove();
      }
    }
  }, [isOpen, hasEnoughAllowance]);
  
  // Update loading state when approval status changes
  useEffect(() => {
    setIsLoading(isApproving);
  }, [isApproving]);
  
  // Handle the approval
  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await approve(amount, protocolAddress);
      
      if (success) {
        setStep(2);
        // Move to complete after a brief delay
        setTimeout(() => {
          onComplete(true);
        }, 1500);
      } else {
        setError("Approval failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error during approval:", err);
      setError("An error occurred during approval. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle retry if approval fails
  const handleRetry = () => {
    setError(null);
    handleApprove();
  };

  if (!isOpen) return null;
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Deposit {asset.token}</h3>
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
                {formatNumber(parseFloat(amount), 6)} {asset.token}
                <span className={styles.subDetail}>(${amountUsd})</span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Protocol</span>
              <span className={styles.detailValue}>{protocol}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Expected Yield</span>
              <span className={styles.detailValue}>
                <span className={styles.yieldValue}>${yearlyYieldUsd}/year</span>
              </span>
            </div>
          </div>
          
          <div className={styles.progressContainer}>
            <div className={styles.verticalProgressSteps}>
              <div className={`${styles.verticalProgressStep} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
                <div className={styles.stepDot}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Approval</div>
                  <div className={styles.stepDescription}>
                    {step === 1 && isLoading ? (
                      <>Approving {asset.token} to be used by {protocol}...</>
                    ) : step === 1 && error ? (
                      <span className={styles.errorText}>Approval failed. Please retry.</span>
                    ) : step > 1 ? (
                      <span className={styles.successText}>Approval successful</span>
                    ) : null}
                  </div>
                  {step === 1 && isLoading && <div className={styles.stepSpinner}></div>}
                </div>
              </div>
              
              <div className={styles.verticalProgressLine}></div>
              
              <div className={`${styles.verticalProgressStep} ${step >= 2 ? styles.active : ''}`}>
                <div className={styles.stepDot}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Deposit</div>
                  <div className={styles.stepDescription}>
                    {step === 2 ? (
                      <>Ready to deposit {formatNumber(parseFloat(amount), 4)} {asset.token} to {protocol}</>
                    ) : (
                      <>Waiting for approval...</>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className={styles.error}>
                {error}
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;