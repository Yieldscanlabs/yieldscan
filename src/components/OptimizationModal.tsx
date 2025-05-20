import React, { useState, useEffect } from 'react';
import styles from './DepositModal.module.css'; // Reuse the deposit modal styles
import { formatNumber } from '../utils/helpers';
import type { Asset, SupportedToken } from '../types';
import useERC20 from '../hooks/useERC20';
import { COMPOUND_V3_MARKETS } from '../hooks/useCompoundApy';
import type { SupportedProtocol } from '../hooks/useUnifiedYield';
import useUnifiedYield from '../hooks/useUnifiedYield';
import { AAVE_V3_MARKETS } from '../hooks/useAaveYield';
import { PROTOCOL_NAMES } from '../utils/constants';
import tokens from '../utils/tokens';
import { setupProtocol } from './DepositModal';
import Protocol from './Protocol';

// Helper to get the protocol contract address


// Helper to find the underlying token
const getUnderlyingToken = (asset: Asset) => {
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );
  
  if (!token || !token.underlyingAsset) return null;
  
  return tokens.find(
    t => t.address.toLowerCase() === token.underlyingAsset?.toLowerCase() && t.chainId === asset.chainId && !t.yieldBearingToken
  );
};

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
  // Current step: 1 = withdraw, 2 = approve, 3 = deposit
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get underlying token for deposit after withdrawal
  const underlyingToken = getUnderlyingToken(asset);
  // Protocol addresses
  const betterProtocolAddress = underlyingToken ? 
    setupProtocol(betterProtocol, underlyingToken.token as SupportedToken, asset.chainId) : 
    '0x' as `0x${string}`;
  
  // Initialize yield hooks for both protocols
  const { 
    withdraw,
    isWithdrawing,
    isConfirming: isConfirmingWithdraw,
    isConfirmed: isConfirmedWithdraw
  } = useUnifiedYield({
    protocol: currentProtocol as SupportedProtocol,
    contractAddress: asset.withdrawContract as `0x${string}` || '0x',
    tokenAddress: underlyingToken?.address as `0x${string}` || '0x',
    tokenDecimals: asset.decimals || 18,
    chainId: asset.chainId
  });
  
  const {
    supply,
    isSupplying,
    isConfirming: isConfirmingSupply,
    isConfirmed: isConfirmedSupply
  } = useUnifiedYield({
    protocol: betterProtocol as SupportedProtocol,
    contractAddress: betterProtocolAddress,
    tokenAddress: underlyingToken?.address as `0x${string}` || '0x',
    tokenDecimals: underlyingToken?.decimals || 18,
    chainId: asset.chainId
  });
  
  // For approval of underlying token to better protocol
  const {
    hasEnoughAllowance,
    approve,
    isApproving
  } = useERC20({
    tokenAddress: underlyingToken?.address as `0x${string}` || '0x',
    spenderAddress: betterProtocolAddress,
    tokenDecimals: underlyingToken?.decimals || 18,
    chainId: asset.chainId
  });

  // Add a ref to track if the process has been started
  const hasStartedRef = React.useRef(false);

  // Start the optimization process when opened
  useEffect(() => {
    console.log(isOpen, 'asdkaslk')
    if (isOpen && !hasStartedRef.current) {
      // Set the ref to true to prevent multiple executions
      hasStartedRef.current = true;
      
      // Reset states
      setStep(1);
      setError(null);
      setIsLoading(false);
      
      // Begin withdrawal immediately when modal opens
      handleWithdraw();
    } else if (!isOpen) {
      // Reset the ref when modal is closed
      hasStartedRef.current = false;
    }
  }, [isOpen, asset.balance]);
  
  // Monitor the withdraw confirmation
  useEffect(() => {
    if (isConfirmedWithdraw && step === 1) {
      // Move to approval step once withdrawal is confirmed
      setStep(2);
      handleApprove();
    }
  }, [isConfirmedWithdraw]);
  
  // Monitor the supply confirmation
  useEffect(() => {
    if (isConfirmedSupply && step === 3) {
      // Complete the process
      setIsLoading(false);
      setTimeout(() => {
        onComplete(true);
      }, 1500);
    }
  }, [isConfirmedSupply]);
  
  // Step 1: Withdraw from current protocol
  const handleWithdraw = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
        console.log('hello')
      const success = await withdraw(asset.balance);
      
      if (!success) {
        setError("Withdrawal failed. Please try again.");
        setIsLoading(false);
      }
      // We don't move to step 2 here - we wait for confirmation via the useEffect
    } catch (err) {
      console.error("Error during withdrawal:", err);
      setError("An error occurred during withdrawal. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Step 2: Approve the underlying token for the new protocol
  const handleApprove = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we already have allowance
      const hasAllowance = await hasEnoughAllowance(asset.balance);
      if (hasAllowance) {
        // Skip to deposit if already approved
        setStep(3);
        handleDeposit();
        return;
      }
      
      const success = await approve(asset.balance, betterProtocolAddress);
      
      if (success) {
        setStep(3);
        handleDeposit();
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
  
  // Step 3: Deposit to the better protocol
  const handleDeposit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await supply(asset.balance);
      
      if (!success) {
        setError("Deposit failed. Please try again.");
        setIsLoading(false);
      }
      // We wait for confirmation via the useEffect
    } catch (err) {
      console.error("Error during deposit:", err);
      setError("An error occurred during deposit. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle retry if any step fails
  const handleRetry = () => {
    setError(null);
    
    if (step === 1) {
      handleWithdraw();
    } else if (step === 2) {
      handleApprove();
    } else if (step === 3) {
      handleDeposit();
    }
  };

  if (!isOpen) return null;
  
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
          
          <div className={styles.progressContainer}>
            <div className={styles.verticalProgressSteps}>
              <div className={`${styles.verticalProgressStep} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>
                <div className={styles.stepDot}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Withdraw</div>
                  <div className={styles.stepDescription}>
                    {step === 1 && isLoading ? (
                      <>Withdrawing {asset.token} from {currentProtocol}...</>
                    ) : step === 1 && error ? (
                      <span className={styles.errorText}>Withdrawal failed. Please retry.</span>
                    ) : step > 1 ? (
                      <span className={styles.successText}>Withdrawal successful</span>
                    ) : null}
                  </div>
                  {step === 1 && isLoading && <div className={styles.stepSpinner}></div>}
                </div>
              </div>
              
              <div className={styles.verticalProgressLine}></div>
              
              <div className={`${styles.verticalProgressStep} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>
                <div className={styles.stepDot}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Approve</div>
                  <div className={styles.stepDescription}>
                    {step === 2 && isLoading ? (
                      <>Approving transfer to {betterProtocol}...</>
                    ) : step === 2 && error ? (
                      <span className={styles.errorText}>Approval failed. Please retry.</span>
                    ) : step > 2 ? (
                      <span className={styles.successText}>Approval successful</span>
                    ) : null}
                  </div>
                  {step === 2 && isLoading && <div className={styles.stepSpinner}></div>}
                </div>
              </div>
              
              <div className={styles.verticalProgressLine}></div>
              
              <div className={`${styles.verticalProgressStep} ${step >= 3 ? styles.active : ''}`}>
                <div className={styles.stepDot}>
                  {step > 3 ? '✓' : '3'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Deposit</div>
                  <div className={styles.stepDescription}>
                    {step === 3 && isLoading ? (
                      <>Depositing into {betterProtocol}...</>
                    ) : step === 3 && error ? (
                      <span className={styles.errorText}>Deposit failed. Please retry.</span>
                    ) : step > 3 ? (
                      <span className={styles.successText}>Deposit successful</span>
                    ) : null}
                  </div>
                  {step === 3 && isLoading && <div className={styles.stepSpinner}></div>}
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
            
            {step === 3 && isConfirmedSupply && (
              <div className={styles.successContainer}>
                <div className={styles.successIcon}>✓</div>
                <h4 className={styles.successTitle}>Optimization Complete!</h4>
                <p className={styles.successMessage}>
                  Your {asset.token} has been successfully moved to {betterProtocol} for higher yield.
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

export default OptimizationModal;