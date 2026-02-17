import React from 'react';
import styles from '../Header.module.css';
import { Link } from 'react-router-dom';
import { useCurrencyFormatter } from '../../../hooks/useCurrencyFormatter';

interface EarningsDisplayProps {
  isConnected: boolean;
  totalValue: number;
  dormantCapital: number;
}

const EarningsDisplay: React.FC<EarningsDisplayProps> = ({
  isConnected,
  totalValue,
  dormantCapital,
}) => {
  if (!isConnected) return null;
    const formatValue = useCurrencyFormatter();

  return (
    <div className={styles.earningsContainer}>
      <Link to="/" className={styles.earningsBadgeTotal}>
        <span className={styles.earningsLabel}>Dormant Capital:</span>
        <span className={styles.earningsAmount}>
          ~${formatValue(dormantCapital)}
          <span className={styles.infoTooltipWrapperDown}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className={styles.infoTooltipDown}>
              <strong>Dormant Capital</strong>Funds currently in your wallet that are not  generating returns yet.
            </span>
          </span>
        </span>
      </Link>
      <Link to="/yields" className={styles.earningsBadgeTotal}>
        <span className={styles.earningsLabel}>Working Capital:</span>
        <span className={styles.earningsAmount}>
          ~${formatValue(totalValue)}
          <span className={styles.infoTooltipWrapperDown}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className={styles.infoTooltipDown}>
              <strong>Working Capital</strong> Compounded value (deposit + earned profit).
            </span>
          </span>
        </span>
      </Link>
    </div>
  );
};

export default EarningsDisplay;