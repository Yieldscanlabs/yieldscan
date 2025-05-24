import React from 'react';
import type { YieldActionsProps } from './types';
import styles from '../../pages/MyYieldsPage.module.css';
import tableStyles from '../YieldsTable.module.css';

const YieldActions: React.FC<YieldActionsProps> = ({
  asset,
  hasLockYield,
  chainId,
  optimizationData,
  onWithdrawClick,
  onOptimize,
  onLockAPYClick
}) => {
  return (
    <div className={styles.cardActionSection}>
      {/* Action Buttons */}
      <div className={styles.cardActionRow}>
        {asset.withdrawUri ? (
          <a 
            href={asset.withdrawUri} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.actionButton}
          >
            <span className={styles.buttonIcon}>↗</span> 
            Withdraw
          </a>
        ) : (
          <button className={styles.actionButton} onClick={onWithdrawClick}>
            <span className={styles.buttonIcon}>↓</span> 
            {chainId !== asset.chainId 
              ? `Withdraw`
              : 'Withdraw'
            }
          </button>
        )}
        
        {optimizationData && onOptimize && (
          <button className={`${tableStyles.actionButton} ${tableStyles.optimizeButton} ${styles.actionButtonAccent}`} onClick={onOptimize}>
            <span>Optimize</span>
          </button>
        )}

        {hasLockYield && (
          <button className={`${tableStyles.actionButton} ${tableStyles.lockApyButton} ${styles.actionButtonAccent}`} onClick={onLockAPYClick}>
            <span>Lock APY</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default YieldActions; 