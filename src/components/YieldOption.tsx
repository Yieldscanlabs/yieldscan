import React, { useMemo } from 'react';
import type { YieldOption as YieldOptionType } from '../types';
import type { Asset } from '../types';
import styles from './AssetList.module.css';
import type { BestApyResult } from '../hooks/useBestApy';

interface YieldOptionProps {
  loading: boolean;
  option?: YieldOptionType;
  yearlyYieldUsd: string;
  asset?: Asset;
  bestApyData: BestApyResult;
}

const YieldOption: React.FC<YieldOptionProps> = ({ 
  loading, 
  option, 
  yearlyYieldUsd,
  asset,
  bestApyData
}) => {
  // Extract bestApy data from props instead of using the hook directly
  const { 
    bestApy,
    bestProtocol,
    loading: apyLoading,
    error: apyError
  } = bestApyData;
  
  // Calculate the best APY to display (either from option or real-time data)
  const displayApy = useMemo(() => {
    if (bestApy !== null) {
      // Use the best APY across protocols if available
      return bestApy.toFixed(2);
    }
    return option?.apy;
  }, [bestApy, option]);

  // Calculate yearly yield using the best APY
  const calculatedYearlyYieldUsd = useMemo(() => {
    if (asset && displayApy) {
      const balanceNum = parseFloat(asset.balance || '0');
      const apyDecimal = parseFloat(displayApy.toString()) / 100;
      return (balanceNum * apyDecimal).toFixed(2);
    }
    return yearlyYieldUsd;
  }, [asset, displayApy, yearlyYieldUsd]);

  if (loading || apyLoading) {
    return (
      <div className={styles['yield-loading']}>
        <div className={styles['yield-loading-spinner']}></div>
      </div>
    );
  }

  if (!bestApy) {
    return (
      <div className={styles['no-yield']}>No yield options</div>
    );
  }

  return (
    <>
      <div className={styles['yield-apy']}>
        {displayApy}% APY
        {apyLoading && <span className={styles['updating-icon']} title="Updating APY...">⟳</span>}
        {bestProtocol && bestProtocol !== option?.protocol && (
          <span className={styles['best-rate-icon']} title={`${bestProtocol} offers better rates`}>★</span>
        )}
        {/* {option.lockupDays > 0 && (
          <span className={styles['lock-icon']} title={`${option.lockupDays} days lockup`}>🔒</span>
        )} */}
      </div>
      <div className={styles['yield-details']}>
        <span className={styles['yield-protocol']}>{bestProtocol}</span>
        <span className={styles['yield-earning']}>${calculatedYearlyYieldUsd}/year</span>
        {apyError && !bestApy && <span className={styles['yield-error']} title={apyError}>⚠️</span>}
      </div>
    </>
  );
};

export default YieldOption;