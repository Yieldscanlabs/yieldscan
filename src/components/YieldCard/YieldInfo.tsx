import React from 'react';
import { formatNumber } from '../../utils/helpers';
import type { YieldInfoProps } from './types';
import styles from '../../pages/MyYieldsPage.module.css';

const YieldInfo: React.FC<YieldInfoProps> = ({
  asset,
  apy,
  balanceNum,
  dailyYieldUsd,
  yearlyYieldUsd
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

        <div className={styles.yieldsColumn}>
          <div className={styles.yieldRow}>
            <span>Daily:</span> <span>${formatNumber(dailyYieldUsd, 2)}</span>
          </div>
          <div className={styles.yieldRow}>
            <span>Yearly:</span> <span className={styles.yearlyYield}>${formatNumber(yearlyYieldUsd, 2)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default YieldInfo; 