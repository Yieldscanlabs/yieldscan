import React from 'react';
import styles from '../Header.module.css';

interface EarningsDisplayProps {
  isConnected: boolean;
  totalValue: number;
  formatValue: (value: number) => string;
}

const EarningsDisplay: React.FC<EarningsDisplayProps> = ({
  isConnected,
  totalValue,
  formatValue,
}) => {
  if (!isConnected) return null;

  return (
    <div className={styles.earningsContainer}>
      <div className={styles.earningsBadgeTotal}>
        <span className={styles.earningsLabel}>Yield Capital:</span>
        <span className={styles.earningsAmount}>
          ~${formatValue(totalValue)}
        </span>
      </div>
    </div>
  );
};

export default EarningsDisplay; 