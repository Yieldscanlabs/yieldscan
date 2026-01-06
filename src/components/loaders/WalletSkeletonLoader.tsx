import type { ViewType } from '../ViewToggle';
import styles from './WalletSkeletonLoader.module.css';

export const WalletSkeletonLoader = ({ viewType }: { viewType: ViewType }) => {
  const skeletonItems = Array.from({ length: 4 }, (_, i) => i);

  if (viewType === 'table') {
    return (
      <div className={styles.wsTableSkeleton}>
        {skeletonItems.map((i) => (
          <div key={i} className={`${styles.wsTableRow} ${styles.walletSkeletonShimmer}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.walletSkeletonGrid}>
      {skeletonItems.map((i) => (
        <div key={i} className={styles.walletSkeletonCard}>
          
          {/* Header: Icon & Balance Info */}
          <div className={styles.wsHeader}>
            <div className={`${styles.wsIconCircle} ${styles.walletSkeletonShimmer}`} />
            <div className={styles.wsHeaderContent}>
              <div className={`${styles.wsSymbolBar} ${styles.walletSkeletonShimmer}`} />
              <div className={`${styles.wsBalanceBar} ${styles.walletSkeletonShimmer}`} />
            </div>
          </div>

          {/* Body: APY Panel */}
          <div className={styles.wsApyPanel}>
            <div className={`${styles.wsApyBar} ${styles.walletSkeletonShimmer}`} />
            
            <div className={styles.wsPanelFooter}>
              <div className={styles.wsProtocolGroup}>
                 <div className={`${styles.wsProtocolIcon} ${styles.walletSkeletonShimmer}`} />
                 <div className={`${styles.wsProtocolText} ${styles.walletSkeletonShimmer}`} />
              </div>
              <div className={`${styles.wsEarningsBar} ${styles.walletSkeletonShimmer}`} />
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};