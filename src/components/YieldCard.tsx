import React from 'react';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import styles from '../pages/MyYieldsPage.module.css';
import tokens from '../utils/tokens';

interface YieldCardProps {
  asset: Asset;
  onOptimize?: () => void;
}

const YieldCard: React.FC<YieldCardProps> = ({ asset, onOptimize }) => {
  // Find the token details
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );
  
  // Determine which protocol this yield-bearing token belongs to
  let protocol = '';
  let apy = 0;
  
  if (token?.token.startsWith('a')) {
    protocol = PROTOCOL_NAMES.AAVE;
    apy = 3.2; // Example APY
  } else if (token?.token.startsWith('c')) {
    protocol = PROTOCOL_NAMES.COMPOUND;
    apy = 2.8; // Example APY
  }
  
  // Calculate yield
  const balanceNum = parseFloat(asset.balance);
  const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
  const dailyYield = (balanceNum * (apy / 100)) / 365;
  const dailyYieldUsd = dailyYield * usdPrice;
  const yearlyYieldUsd = dailyYieldUsd * 365;
  
  return (
    <div className={styles.yieldCard}>
      <div className={styles.assetHeader}>
        <div className={styles.assetInfo}>
          <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
          <div>
            <div className={styles.assetName}>{asset.token}</div>
            <div className={styles.assetProtocol}>{protocol}</div>
          </div>
        </div>
        <div className={styles.assetApy}>
          <div className={styles.apyValue}>{apy.toFixed(2)}%</div>
          <div className={styles.apyLabel}>APY</div>
        </div>
      </div>
      
      <div className={styles.assetBalances}>
        <div className={styles.balanceDetail}>
          <div className={styles.balanceLabel}>Balance</div>
          <div className={styles.balanceValue}>
            {formatNumber(balanceNum, asset.maxDecimalsShow)} {asset.token}
          </div>
          <div className={styles.balanceUsd}>${formatNumber(parseFloat(asset.balanceUsd), 2)}</div>
        </div>
      </div>
      
      <div className={styles.yieldDetails}>
        <div className={styles.yieldDetail}>
          <div className={styles.yieldLabel}>Daily Yield</div>
          <div className={styles.yieldValue}>${formatNumber(dailyYieldUsd, 2)}</div>
        </div>
        <div className={styles.yieldDetail}>
          <div className={styles.yieldLabel}>Yearly Yield</div>
          <div className={styles.yieldValue}>${formatNumber(yearlyYieldUsd, 2)}</div>
        </div>
      </div>
      
      {onOptimize && (
        <button 
          className={styles.optimizeButton} 
          onClick={onOptimize}
        >
          Optimize Yield
        </button>
      )}
    </div>
  );
};

export default YieldCard;