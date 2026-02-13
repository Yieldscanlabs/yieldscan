import React from 'react';
import type { LiquidityPosition } from '../../../store/liquidityStore';
import styles from '../styles/Liquidity.module.css';

interface Props {
  positions: LiquidityPosition[];
  isLoading: boolean;
}

const PositionsList: React.FC<Props> = ({ positions, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h2 className={styles.sectionTitle}>DeFi Positions</h2>
        <div className={styles.positionsGrid}>
          {[1, 2].map(i => (
            <div key={i} className={`${styles.skeletonCard} ${styles.skeleton}`} />
          ))}
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div>
        <h2 className={styles.sectionTitle}>DeFi Positions</h2>
        <div className={styles.emptyState}>
          <div className={styles.emptyText}>No active DeFi positions found</div>
        </div>
      </div>
    );
  }

  const isBorrowed = (label: string) =>
    label.toLowerCase().includes('borrow') || label.toLowerCase().includes('debt');

  return (
    <div>
      <h2 className={styles.sectionTitle}>DeFi Positions</h2>
      <div className={styles.positionsGrid}>
        {positions.map((pos, idx) => (
          <div key={idx} className={styles.positionCard}>
            <div className={styles.positionHeader}>
              {pos.protocolName} – {pos.poolLabel}
            </div>
            <div
              className={`${styles.positionBadge} ${
                isBorrowed(pos.poolLabel) ? styles.badgeBorrowed : styles.badgeSupplied
              }`}
            >
              Total: ${pos.balanceUsd < 1
                ? pos.balanceUsd.toFixed(6)
                : pos.balanceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={styles.positionTokens}>
              {pos.tokens.map((t, i) => (
                <div key={i}>
                  {t.symbol} <span>— {t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PositionsList;