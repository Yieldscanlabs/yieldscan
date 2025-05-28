import React, { useMemo } from 'react';
import type { Asset } from '../types';
import styles from './AssetList.module.css';
import type { BestApyResult } from '../hooks/useBestApy';
import Protocol from './Protocol';

interface YieldOptionProps {
  loading: boolean;
  asset?: Asset;
  bestApyData: BestApyResult;
}

const YieldOption: React.FC<YieldOptionProps> = ({ 
  loading, 
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
  }, [bestApy]);

  // Calculate yearly yield using the best APY
  const calculatedYearlyYieldUsd = useMemo(() => {
    if (asset && displayApy) {
      const balanceNum = parseFloat(asset.balance || '0');
      const apyDecimal = parseFloat(displayApy.toString()) / 100;
      return (balanceNum * apyDecimal).toFixed(2);
    }
  }, [asset, displayApy]);

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
    
        {/* {option.lockupDays > 0 && (
          <span className={styles['lock-icon']} title={`${option.lockupDays} days lockup`}>🔒</span>
        )} */}
      </div>
      <div className={styles['yield-details']}>
        <Protocol showTooltip={true} className={styles['yield-protocol']} name={bestProtocol} showLogo={true} /> 
        <span className={styles['yield-earning']}>${calculatedYearlyYieldUsd}/year</span>
        {apyError && !bestApy && <span className={styles['yield-error']} title={apyError}></span>}
      </div>
    </>
  );
};

export default YieldOption;