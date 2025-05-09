import React from 'react';
import type { YieldOption } from '../types';
import { CHAIN_NAMES } from '../utils/constants';
import { getChainColor } from '../utils/helpers';
import styles from './YieldOptions.module.css';

interface YieldOptionsProps {
  options: YieldOption[];
  loading: boolean;
  onSelectOption: (option: YieldOption) => void;
  selectedOption: YieldOption | null;
}

const YieldOptions: React.FC<YieldOptionsProps> = ({
  options,
  loading,
  onSelectOption,
  selectedOption
}) => {
  if (loading) {
    return <div className={styles.loading}>Loading yield options...</div>;
  }
  
  if (options.length === 0) {
    return <div className={styles['no-options']}>No yield options available for this asset</div>;
  }
  
  return (
    <div className={styles['yield-options']}>
      <h2>Yield Options</h2>
      <div className={styles['options-list']}>
        {options.map((option) => (
          <div 
            key={option.id}
            className={`${styles['option-card']} ${selectedOption?.id === option.id ? styles.selected : ''}`}
            onClick={() => onSelectOption(option)}
          >
            <div className={styles['option-header']}>
              <h3>{option.protocol}</h3>
              <div 
                className={styles['chain-badge']} 
                style={{ backgroundColor: getChainColor(option.chain) }}
              >
                {CHAIN_NAMES[option.chain]}
              </div>
            </div>
            <div className={styles['option-details']}>
              <div className={styles['option-apy']}>
                <span className={styles.label}>APY:</span>
                <span className={styles.value}>{option.apy}%</span>
              </div>
              <div className={styles['option-tvl']}>
                <span className={styles.label}>TVL:</span>
                <span className={styles.value}>{option.tvl}</span>
              </div>
              <div className={styles['option-risk']}>
                <span className={styles.label}>Risk:</span>
                <span className={`${styles['risk-badge']} ${styles[`risk-${option.risk.toLowerCase()}`]}`}>
                  {option.risk}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldOptions;