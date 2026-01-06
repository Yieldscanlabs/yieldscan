import React, { useState, useEffect } from 'react';
import styles from './MyYieldSkeletonLoader.module.css';

// 1. Loader for the Top Summary Cards (Deposit, Earned, Withdrawn)
export const MyYieldSummaryCardsSkeleton = () => {
  return (
    <div className={styles.myYieldSummaryGrid}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.myYieldSummaryCard}>
          <div className={`${styles.myYieldSummaryTitle} ${styles.myYieldShimmer}`} />
          <div className={`${styles.myYieldSummaryValue} ${styles.myYieldShimmer}`} />
          <div className={`${styles.myYieldSummarySub} ${styles.myYieldShimmer}`} />
        </div>
      ))}
    </div>
  );
};

// 2. Loader for the Asset Yield Cards
interface MyYieldSkeletonLoaderProps {
  count?: 3; 
  viewType?: 'cards' | 'table';
}

export const MyYieldSkeletonLoader: React.FC<MyYieldSkeletonLoaderProps> = ({ count: propsCount, viewType = 'cards' }) => {
  const [displayCount, setDisplayCount] = useState(3);

  useEffect(() => {
    // If user provided a specific count, use it
    if (propsCount !== undefined) {
      setDisplayCount(propsCount);
      return;
    }

    // Only run auto-calculation for Grid/Cards view
    if (viewType === 'cards') {
      const updateCount = () => {
        const width = window.innerWidth;
        if (width >= 1280) {
          setDisplayCount(4); // XL: 4 cards
        } else if (width >= 1169) {
          setDisplayCount(3); // LG: 3 cards
        } else if (width >= 768) {
          setDisplayCount(4); // MD: 4 cards
        } else {
          setDisplayCount(3); // Small: 3 cards
        }
      };

      updateCount();
      window.addEventListener('resize', updateCount);
      return () => window.removeEventListener('resize', updateCount);
    } else {
      // Default for Table view (just a reasonable list length)
      setDisplayCount(5);
    }
  }, [propsCount, viewType]);

  const items = Array.from({ length: displayCount }, (_, i) => i);

  // ✅ 1. Render Table View
  if (viewType === 'table') {
    return (
      <div className={styles.myYieldTableContainer}>
        {items.map((i) => (
          <div key={i} className={styles.myYieldTableRow}>
            {/* Icon */}
            <div className={`${styles.myYieldTableIcon} ${styles.myYieldShimmer}`} />
            
            {/* Asset Name */}
            <div className={`${styles.myYieldTableAsset} ${styles.myYieldShimmer}`} />
            
            {/* Fake Columns for Protocol, Balance, APY */}
            <div className={`${styles.myYieldTableData} ${styles.myYieldShimmer}`} />
            <div className={`${styles.myYieldTableData} ${styles.myYieldShimmer}`} />
            <div className={`${styles.myYieldTableData} ${styles.myYieldShimmer}`} />
            
            {/* Action Button */}
            <div className={`${styles.myYieldTableActions} ${styles.myYieldShimmer}`} />
          </div>
        ))}
      </div>
    );
  }

  // ✅ 2. Render Cards View (Existing Logic)
  return (
    <div className={styles.myYieldGrid}>
      {items.map((i) => (
        <div key={i} className={styles.myYieldCard}>
          
          {/* Header */}
          <div className={styles.myYieldHeaderRow}>
            <div className={styles.myYieldHeaderLeft}>
              <div className={`${styles.myYieldIconCircle} ${styles.myYieldShimmer}`} />
              <div className={styles.myYieldTitleGroup}>
                <div className={`${styles.myYieldSymbolBar} ${styles.myYieldShimmer}`} />
                <div className={`${styles.myYieldProtocolBar} ${styles.myYieldShimmer}`} />
              </div>
            </div>
            <div className={`${styles.myYieldApyBar} ${styles.myYieldShimmer}`} />
          </div>

          {/* Stats Rows */}
          <div className={styles.myYieldStatsContainer}>
            <div className={styles.myYieldStatRow}>
              <div className={`${styles.myYieldBalanceBar} ${styles.myYieldShimmer}`} />
              <div className={`${styles.myYieldYieldBar} ${styles.myYieldShimmer}`} />
            </div>
            <div className={styles.myYieldStatRow}>
              <div className={`${styles.myYieldFiatBar} ${styles.myYieldShimmer}`} />
              <div className={`${styles.myYieldYieldBar} ${styles.myYieldShimmer}`} />
            </div>
          </div>

          {/* Buttons */}
          <div className={styles.myYieldButtonRow}>
            <div className={`${styles.myYieldBtnSkeleton} ${styles.myYieldShimmer}`} />
            <div className={`${styles.myYieldBtnSkeleton} ${styles.myYieldShimmer}`} />
          </div>

        </div>
      ))}
    </div>
  );
};