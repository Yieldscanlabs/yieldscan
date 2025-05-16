import React from 'react';
import type { Asset } from '../types';
import { formatNumber } from '../utils/helpers';
import styles from './DepositSuccess.module.css';

interface DepositSuccessProps {
  asset: Asset;
  amount: string;
  amountUsd: string;
  dailyYieldUsd: string;
  yearlyYieldUsd: string;
  protocol: string;
  onReturn: () => void;
}

const DepositSuccess: React.FC<DepositSuccessProps> = ({
  asset,
  amount,
  amountUsd,
  dailyYieldUsd,
  yearlyYieldUsd,
  protocol,
  onReturn
}) => {
  return (
    <div className={styles['deposit-success']}>
      <div className={styles['success-icon']}>
        <div className={styles['success-icon-inner']}>✓</div>
      </div>
      <h2 className={`${styles['success-title']} ${styles['success-animation']}`}>
        Deposit Successful!
      </h2>
      <p className={`${styles['success-message']} ${styles['success-animation']}`}>
        Your {asset.token} has been successfully deposited to {protocol} and is now generating yield.
      </p>
      
      <div className={`${styles['deposit-details']} ${styles['success-animation']}`}>
        <div className={styles['deposit-detail-row']}>
          <span className={styles['deposit-detail-label']}>Amount Deposited</span>
          <span className={styles['deposit-detail-value']}>
            {formatNumber(parseFloat(amount), asset.maxDecimalsShow)} {asset.token}
          </span>
        </div>
        <div className={styles['deposit-detail-row']}>
          <span className={styles['deposit-detail-label']}>USD Value</span>
          <span className={styles['deposit-detail-value']}>${amountUsd}</span>
        </div>
        <div className={styles['deposit-detail-row']}>
          <span className={styles['deposit-detail-label']}>Expected Daily Earnings</span>
          <span className={styles['deposit-detail-value']}>${dailyYieldUsd}/day</span>
        </div>
        <div className={styles['deposit-detail-row']}>
          <span className={styles['deposit-detail-label']}>Expected Yearly Earnings</span>
          <span className={styles['deposit-detail-value']}>${yearlyYieldUsd}/year</span>
        </div>
      </div>
      
      <button 
        className={`${styles['return-button']} ${styles['success-animation']}`} 
        onClick={onReturn}
      >
        Return to Assets
      </button>
    </div>
  );
};

export default DepositSuccess;