import React, { useMemo } from 'react';
import type { YieldOption as YieldOptionType } from '../types';
import type { Asset } from '../types';
import styles from './AssetList.module.css';
import useAaveApy from '../hooks/useAaveApy';

interface YieldOptionProps {
  loading: boolean;
  option?: YieldOptionType;
  yearlyYieldUsd: string;
  asset?: Asset;
}

const YieldOption: React.FC<YieldOptionProps> = ({ 
  loading, 
  option, 
  yearlyYieldUsd,
  asset 
}) => {
  // Get Aave APY data if available
  const { 
    apy: aaveApy, 
    loading: aaveLoading,
    error: aaveError
  } = asset?.address ? useAaveApy(asset.address) : { apy: null, loading: false, error: null };
  console.log(aaveApy, 'helloaaa', asset?.address)
  // Calculate the best APY to display (either from option or Aave)
  const displayApy = useMemo(() => {
    if (option?.protocol === 'Aave' && aaveApy !== null) {
      // Use real-time Aave APY if available
      return aaveApy.toFixed(2);
    }
    return option?.apy;
  }, [option, aaveApy]);

  // Calculate yearly yield using the best APY
  const calculatedYearlyYieldUsd = useMemo(() => {
    if (asset && displayApy) {
      const balanceNum = parseFloat(asset.balance || '0');
      const apyDecimal = parseFloat(displayApy.toString()) / 100;
      return (balanceNum * apyDecimal).toFixed(2);
    }
    return yearlyYieldUsd;
  }, [asset, displayApy, yearlyYieldUsd]);

  if (loading || aaveLoading) {
    return (
      <div className={styles['yield-loading']}>
        <div className={styles['yield-loading-spinner']}></div>
      </div>
    );
  }

  if (!option) {
    return (
      <div className={styles['no-yield']}>No yield options</div>
    );
  }

  return (
    <>
      <div className={styles['yield-apy']}>
        {displayApy}% APY
        {aaveLoading && <span className={styles['updating-icon']} title="Updating APY...">⟳</span>}
        {option.lockupDays > 0 && (
          <span className={styles['lock-icon']} title={`${option.lockupDays} days lockup`}>🔒</span>
        )}
      </div>
      <div className={styles['yield-details']}>
        <span className={styles['yield-protocol']}>{option.protocol}</span>
        <span className={styles['yield-earning']}>${calculatedYearlyYieldUsd}/year</span>
        {aaveError && <span className={styles['yield-error']} title={aaveError}>⚠️</span>}
      </div>
    </>
  );
};

export default YieldOption;