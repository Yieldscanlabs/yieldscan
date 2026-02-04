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
        </span>
      </Link>
      <Link to="/yields" className={styles.earningsBadgeTotal}>
        <span className={styles.earningsLabel}>Working Capital:</span>
        <span className={styles.earningsAmount}>
          ~${formatValue(totalValue)}
        </span>
      </Link>
    </div>
  );
};

export default EarningsDisplay;