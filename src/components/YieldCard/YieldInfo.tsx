import React from "react";
import { formatNumber } from "../../utils/helpers";
import type { YieldInfoProps } from "./types";
import styles from "../../pages/MyYieldsPage.module.css";

const PERIODS = [
  { label: "1h", multiplier: 1 / 24 },
  { label: "1d", multiplier: 1 },
  { label: "1w", multiplier: 7 },
  { label: "1m", multiplier: 30 },
  { label: "1y", multiplier: 365 },
] as const;

const YieldInfo: React.FC<YieldInfoProps> = ({
  asset,
  apy,
  balanceNum,
  dailyYieldUsd,
  yearlyYieldUsd,
  showAllPeriods,
}) => {
  return (
    <>
      <div className={styles.cardMiddleSection}>
        <div className={styles.balanceColumn}>
          <div className={styles.balanceAmount}>
            {formatNumber(Number(asset.currentBalanceInProtocol))} {asset.token}
          </div>
          <div className={styles.balanceUsd}>
            ${formatNumber(Number(asset.currentBalanceInProtocolUsd))}
          </div>
        </div>

        {!showAllPeriods ? (
          // Default view: daily + yearly
          <div className={styles.yieldsColumn}>
            <div className={styles.yieldRow}>
              <span>Daily:</span>
              <span>${formatNumber(dailyYieldUsd, 2)}</span>
            </div>
            <div className={styles.yieldRow}>
              <span>Yearly:</span>
              <span className={styles.yearlyYield}>
                ${formatNumber(yearlyYieldUsd, 2)}
              </span>
            </div>
          </div>
        ) : (
          // Expanded view: all 5 periods
          <div className={styles.allPeriodsGrid}>
            {PERIODS.map(({ label, multiplier }) => (
              <div key={label} className={styles.periodItem}>
                <span className={styles.periodLabel}>{label}</span>
                <span className={styles.periodValue}>
                  ${formatNumber(dailyYieldUsd * multiplier, 2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default YieldInfo;
