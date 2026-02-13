import React from 'react';
import type { LiquidityData } from '../../../store/liquidityStore';
import styles from '../styles/Liquidity.module.css';

interface Props {
  data: LiquidityData | null;
  isLoading: boolean;
}

const LiquiditySummary: React.FC<Props> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <>
        <div className={`${styles.walletCard} ${styles.skeleton}`} style={{ height: 56 }} />
        <div className={styles.summaryRow}>
          {[1, 2, 3].map(i => (
            <div key={i} className={`${styles.skeletonCard} ${styles.skeleton}`} />
          ))}
        </div>
      </>
    );
  }

  if (!data) return null;

  const truncatedAddress = `${data.walletAddress.slice(0, 6)}…${data.walletAddress.slice(-4)}`;

  return (
    <>
      {/* Wallet Address Card */}
      <div className={styles.walletCard}>
        <div className={styles.walletAvatar}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
            <circle cx="18" cy="16" r="2" />
          </svg>
        </div>
        <span className={styles.walletAddress}>{truncatedAddress}</span>
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total USD Value</div>
          <div className={styles.summaryValue}>
            ${data.totalUsd < 1 ? data.totalUsd.toFixed(4) : data.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Assets</div>
          <div className={styles.summaryValue}>{data.assets.length}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Protocols</div>
          <div className={styles.summaryValue}>{data.protocols.length}</div>
        </div>
      </div>
    </>
  );
};

export default LiquiditySummary;