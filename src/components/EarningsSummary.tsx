import React from 'react';
import styles from './EarningsSummary.module.css';

interface EarningsSummaryProps {
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  lifetimeEarnings: number;
  className?: string;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  dailyEarnings,
  weeklyEarnings,
  monthlyEarnings,
  yearlyEarnings,
  lifetimeEarnings,
  className = ''
}) => {
  // Format numbers with commas for thousands
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={`${styles.earningsSummary} ${className}`}>
      <div className={styles.earningsRow}>
        <div className={styles.lifetimeWrapper}>
          <div className={styles.star}></div>
          <div className={styles.lifetimeContent}>
            <div className={styles.lifetimeValue}>${formatCurrency(lifetimeEarnings)}</div>
            <div className={styles.lifetimeLabel}>total</div>
          </div>
        </div>
        
        <div className={styles.periodCards}>
          <div className={styles.periodCard}>
            <div className={styles.periodBadge}>24h</div>
            <div className={styles.periodValue}>${formatCurrency(dailyEarnings)}</div>
          </div>
          
          <div className={styles.periodCard}>
            <div className={styles.periodBadge}>7d</div>
            <div className={styles.periodValue}>${formatCurrency(weeklyEarnings)}</div>
          </div>
          
          <div className={styles.periodCard}>
            <div className={styles.periodBadge}>30d</div>
            <div className={styles.periodValue}>${formatCurrency(monthlyEarnings)}</div>
          </div>
          
          <div className={styles.periodCard}>
            <div className={styles.periodBadge}>1y</div>
            <div className={styles.periodValue}>${formatCurrency(yearlyEarnings)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsSummary;