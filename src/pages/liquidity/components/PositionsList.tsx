import React from "react";
import type { LiquidityPosition } from "../../../store/liquidityStore";
import styles from "../styles/Liquidity.module.css";
import InfoIcon from "../../../components/common/InfoIcon";

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
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`${styles.skeletonCard} ${styles.skeleton}`}
            />
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
    label.toLowerCase().includes("borrow") ||
    label.toLowerCase().includes("debt");

  const isAerodrome = (pos: LiquidityPosition) =>
    pos.protocolName.toLowerCase().includes("aerodrome");

  return (
    <div>
      <h2 className={styles.sectionTitle}>DeFi Positions</h2>
      <div className={styles.positionsGrid}>
        {positions.map((pos, idx) => (
          <div key={idx} className={styles.positionCard}>
            {/* Header */}
            <div className={styles.positionHeader}>
              {pos.protocolName} – {pos.poolLabel}
            </div>

            {/* Aerodrome-specific badges and messages */}
            {isAerodrome(pos) && (
              <div className={styles.aerodromeSection}>
                {/* In Range badge */}
                {pos.inRange === true && (
                  <div className={styles.aerodromeBadgeRow}>
                    <span className={styles.badgeInRange}>In Range</span>
                    <span className={styles.badgeMessage}>
                      This position is actively earning trading fees.
                    </span>
                  </div>
                )}

                {/* Out of Range badge with helpful message */}
                {pos.inRange === false && (
                  <div className={styles.aerodromeOutRangeSection}>
                    <div className={styles.aerodromeBadgeRow}>
                      <span className={styles.badgeOutRange}>
                        ⚠️ Out of Range
                      </span>
                      <span className={styles.badgeMessage}>
                        This position is not earning fees.
                      </span>
                      <InfoIcon
                        tooltipTitle="Out of Range"
                        tooltipText="The price has moved outside your selected range. Your funds are safe but idle. To resume earning, visit aerodrome.finance/liquidity and rebalance your position by removing liquidity and adding it again with a new price range."
                      />
                    </div>
                  </div>
                )}

                {/* Pending AERO rewards */}
                {/* Commented it for now it can be uncommented in future */}
                {/* {pos.pendingAeroRewards != null &&
                  pos.pendingAeroRewards > 0 && (
                    <div className={styles.aeroRewards}>
                      Pending AERO Rewards: {pos.pendingAeroRewards.toFixed(6)}
                      <InfoIcon
                        tooltipText="Unclaimed AERO token rewards from staking your LP position in the gauge."
                        tooltipTitle="Pending Rewards"
                      />
                    </div>
                  )} */}
              </div>
            )}

            {/* USD Value */}
            <div
              className={`${styles.positionBadge} ${
                isBorrowed(pos.poolLabel)
                  ? styles.badgeBorrowed
                  : styles.badgeSupplied
              }`}
            >
              Total: $
              {pos.balanceUsd < 1
                ? pos.balanceUsd.toFixed(6)
                : pos.balanceUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </div>
            <InfoIcon
              tooltipText="The total USD value of this position across all tokens in the pool."
              tooltipTitle="Total Value"
            />

            {/* Token amounts */}
            <div className={styles.positionTokens}>
              {pos.tokens.map((t, i) => (
                <div key={i}>
                  {t.symbol} <span>— {t.amount}</span>
                  <InfoIcon
                    tooltipText="The quantity of the token in the position."
                    tooltipTitle="Token Amount"
                  />
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
