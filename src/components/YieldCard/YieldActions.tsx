import React from 'react';
import type { YieldActionsProps } from './types';
import styles from '../../pages/MyYieldsPage.module.css';

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
          <button className={styles.actionButtonAccent} onClick={onOptimize}>
     
            Optimize
          </button>
        )}

        {hasLockYield && (
          <button className={styles.actionButtonAccent} onClick={onLockAPYClick}>
           Lock APY
          </button>
        )}
      </div>
    </div>
  );
};

export default YieldActions; 