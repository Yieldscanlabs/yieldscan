import React, { useState, useEffect } from 'react';
import styles from './DepositModal.module.css';
import { formatNumber } from '../utils/helpers';
import type { Asset, SupportedToken } from '../types';
import useERC20 from '../hooks/useERC20';
import type {SupportedProtocol} from '../hooks/useUnifiedYield';
import useUnifiedYield from '../hooks/useUnifiedYield';
import { PROTOCOL_NAMES } from '../utils/constants';
import { useAssetStore } from '../store/assetStore';
import useWalletConnection from '../hooks/useWalletConnection';
import { AAVE_V3_MARKETS, RADIANT_V3_MARKETS, VENUS_V3_MARKETS, COMPOUND_V3_MARKETS } from '../utils/markets';
import Protocol from './Protocol';

export const setupProtocol = (protocol: string, token: SupportedToken, chainId: number) => {
    if(protocol === PROTOCOL_NAMES.COMPOUND) {
        return COMPOUND_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.AAVE) {
        return AAVE_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.VENUS) {
      return VENUS_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.RADIANT) {
      return RADIANT_V3_MARKETS[chainId][token] as `0x${string}`;
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
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { wallet }  = useWalletConnection()
  const [error, setError] = useState<string | null>(null);
  const { fetchAssets } = useAssetStore()
  
  // Check if the token is native (address is '0x')
  const isNativeToken = asset.address === '0x';
  
  // Protocol contract address - in a real app this would come from a config or lookup
  const protocolAddress: `0x${string}` = setupProtocol(protocol, asset.token as SupportedToken, asset.chainId);
  
  // Initialize ERC20 hook for approval checking
  const { 
    allowance,
    hasEnoughAllowance,
    approve,
    isApproving
  } = useERC20({
    tokenAddress: asset.address as `0x${string}`,
    spenderAddress: protocolAddress,
    chainId: asset.chainId,
    tokenDecimals: asset.decimals
  });

  const { 
    supply, 
    isSupplying, 
    isConfirmed,
    supplyETH,
    withdrawETH
  } = useUnifiedYield({
        protocol: protocol as SupportedProtocol,
        contractAddress: protocolAddress as `0x${string}` || '0x',
        tokenAddress: asset.address as `0x${string}`,
        tokenDecimals: asset.decimals,
        chainId: asset.chainId
    });

  // Check if we need approval or already have enough allowance
  useEffect(() => {
    if (isOpen) {
      // For native tokens, skip to deposit step
      if (isNativeToken) {
        setStep(1); // Only one step needed for native tokens
      } else {
        setStep(1); // Start at approval step for ERC20 tokens
      }
      setError(null);
      
      if (isNativeToken) {
        // Skip approval for native tokens
        handleSupply();
      } else {
        // Check approval for ERC20 tokens
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
    if (isNativeToken) {
      // Skip approval for native tokens
      handleSupply();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const didApprove = await hasEnoughAllowance(amount);
      if (didApprove) {
        handleSupply();
        return;
      }
      const success = await approve(amount, protocolAddress);
      
      if (success) {
        handleSupply()
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

  const handleSupply = async () => {
    // For ERC20 tokens, move to step 2
    // For native tokens, stay at step 1 (only step)
    if (!isNativeToken) {
      setStep(2);
    }
    
    setIsLoading(true);
    setError(null);
    try {
      let success = false;
      
      // For Aave protocol and native ETH, use the special depositETH function
      if (isNativeToken && protocol === PROTOCOL_NAMES.AAVE) {
        // For native ETH on Aave, we use the supplyETH function which calls depositETH on the gateway contract
        // onBehalfOf parameter is the user's address
        success = await supplyETH(amount, wallet.address);
      } else {
        // For all other tokens/protocols, use the regular supply function
        success = await supply(amount);
      }
      
      if (success) {
        // For ERC20 tokens, move to step 3
        // For native tokens, move to step 2 (complete)
        setStep(isNativeToken ? 2 : 3);
        // Move to complete after a brief delay
        fetchAssets(wallet.address, false);
        setTimeout(() => {
          onComplete(true);
        }, 1500);
      } else {
        setError("Deposit failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error during deposit:", err);
      setError("An error occurred during deposit. Please try again.");
      setIsLoading(false);
    }
  }
  
  // Handle retry if approval fails
  const handleRetry = () => {
    setError(null);
    if (isNativeToken) {
      handleSupply();
    } else {
      handleApprove();
    }
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
            <div className={styles.verticalProgressSteps}>
              {!isNativeToken && (
                <>
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
                </>
              )}
              
              <div className={`${styles.verticalProgressStep} ${step >= (isNativeToken ? 1 : 2) ? styles.active : ''}`}>
                <div className={styles.stepDot}>
                  {step > (isNativeToken ? 1 : 2) ? '✓' : isNativeToken ? '1' : '2'}
                </div>
                <div className={styles.stepContent}>
                  <div className={styles.stepLabel}>Deposit</div>
                  <div className={styles.stepDescription}>
                    {(isNativeToken && step === 1) || (!isNativeToken && step === 2) ? (
                      isLoading ? (
                        <>Depositing {formatNumber(parseFloat(amount), 4)} {asset.token} to {protocol}...</>
                      ) : (
                        <>Ready to deposit {formatNumber(parseFloat(amount), 4)} {asset.token} to {protocol}</>
                      )
                    ) : (
                      !isNativeToken && <>Waiting for approval...</>
                    )}
                  </div>
                  {((isNativeToken && step === 1) || (!isNativeToken && step === 2)) && isLoading && <div className={styles.stepSpinner}></div>}
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