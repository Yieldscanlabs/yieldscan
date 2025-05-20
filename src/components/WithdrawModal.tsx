import React, { useState, useEffect } from 'react';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import styles from './WithdrawModal.module.css';
import { useAssetStore } from '../store/assetStore';
import useWalletConnection from '../hooks/useWalletConnection';
import Protocol from './Protocol';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
  asset: Asset;
  protocol: string;
  balance: number;
  maxDecimals: number;
  onWithdraw: (amount: string) => Promise<boolean>;
  isProcessing: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  asset,
  protocol,
  balance,
  maxDecimals,
  onWithdraw,
  isProcessing,
  isConfirming,
  isConfirmed
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
    const { wallet } = useWalletConnection();
  const {fetchAssets} = useAssetStore()
  const [error, setError] = useState<string | null>(null);
  const [activePercentage, setActivePercentage] = useState<number | null>(null);
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount('');
      setPercentage(0);
      setError(null);
      setActivePercentage(null);
    }
  }, [isOpen]);

  // Update withdrawal amount when slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPercentage(value);
    const calculatedAmount = (balance * value / 100).toFixed(6);
    setWithdrawAmount(calculatedAmount);
    setActivePercentage(null);
  };
  
  // Set predefined percentages
  const handleQuickPercentage = (percent: number) => {
    setPercentage(percent);
    setActivePercentage(percent);
    const calculatedAmount = (balance * percent / 100).toFixed(6);
    setWithdrawAmount(calculatedAmount);
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance) {
      setError('Please enter a valid amount');
      return;
    }

    setError(null);
    try {
      const success = await onWithdraw(withdrawAmount);
      if (success) {
        // Wait briefly before signaling completion
        fetchAssets(wallet.address, false)
        setTimeout(() => {
          onComplete(true);
        }, 1500);

      } else {
        setError('Withdrawal failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during withdrawal:', err);
      setError('An error occurred. Please try again.');
    }
  };

  if (!isOpen) return null;
  
  // Calculate USD value
  const usdPrice = parseFloat(asset.balanceUsd) / balance;
  const amountUsd = (parseFloat(withdrawAmount || '0') * usdPrice).toFixed(2);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Withdraw {asset.token}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.modalContent}>
          {isConfirmed ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h4 className={styles.successTitle}>Withdrawal Successful!</h4>
              <p className={styles.successMessage}>
                Your {asset.token} has been successfully withdrawn from {protocol}.
              </p>
              <button 
                className={styles.completeButton} 
                onClick={() => onComplete(true)}
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className={styles.withdrawDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Asset</span>
                  <span className={styles.detailValue}>
                    <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
                    {asset.token}
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
                
                <div className={styles.sliderContainer}>
                  <div className={styles.sliderTrack}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={handleSliderChange}
                      className={styles.amountSlider}
                    />
                    <div 
                      className={styles.sliderProgress} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <div 
                      className={styles.sliderThumb}
                      style={{ left: `${percentage}%` }}
                    >
                      <span className={styles.sliderPercentage}>{percentage}%</span>
                    </div>
                  </div>
                  
                  <div className={styles.percentageButtons}>
                    <button 
                      onClick={() => handleQuickPercentage(25)}
                      className={activePercentage === 25 ? styles.active : ''}
                    >25%</button>
                    <button 
                      onClick={() => handleQuickPercentage(50)}
                      className={activePercentage === 50 ? styles.active : ''}
                    >50%</button>
                    <button 
                      onClick={() => handleQuickPercentage(75)}
                      className={activePercentage === 75 ? styles.active : ''}
                    >75%</button>
                    <button 
                      onClick={() => handleQuickPercentage(100)}
                      className={activePercentage === 100 ? styles.active : ''}
                    >Max</button>
                  </div>
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}
              
              <button 
                className={`${styles.withdrawButton} ${isProcessing || isConfirming ? styles.loading : ''}`} 
                onClick={handleWithdraw}
                disabled={isProcessing || isConfirming || parseFloat(withdrawAmount || '0') <= 0}
              >
                <span className={styles.buttonIcon}>↓</span>
                Withdraw {asset.token}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;