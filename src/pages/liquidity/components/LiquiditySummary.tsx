import React, { useMemo } from 'react';
import type { LiquidityData } from '../../../store/liquidityStore';
import styles from '../styles/Liquidity.module.css';
import WalletLabel from '../../../components/common/WalletLabel';

interface Props {
  data: LiquidityData | null;
  isLoading: boolean;
}

const LiquiditySummary: React.FC<Props> = ({ data, isLoading }) => {

  const { activeAssetsCount, activeProtocolsCount } = useMemo(() => {
    if (!data || !data.matrix) {
      return { activeAssetsCount: 0, activeProtocolsCount: 0 };
    }

    const activeAssets = new Set<string>();
    const activeProtocols = new Set<string>();

    Object.entries(data.matrix).forEach(([asset, protocols]) => {
      Object.entries(protocols).forEach(([protocol, value]) => {
        if (value > 0) {
          activeAssets.add(asset);
          activeProtocols.add(protocol);
        }
      });
    });

    return {
      activeAssetsCount: activeAssets.size,
      activeProtocolsCount: activeProtocols.size,
    };
  }, [data]);

  if (isLoading) {
    return (
      <>
        <div className={`${styles.walletCard} ${styles.skeleton}`} style={{ height: 56 }} />
        <div className={styles.summaryRow}>
          {[1, 2, 3].map(i => (
            <div key={i} className={`${styles.skeletonCard} ${styles.skeleton}`} />
          ))}
        </div>
      </>
    );
  }

  if (!data) return null;  

  return (
    <>
      {/* Wallet Address Card */}
      <div className={styles.walletCard}>
        <WalletLabel address={data.walletAddress} showEditButton={false} />
      </div>

      {/* Summary Stats */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total USD Value</div>
          <div className={styles.summaryValue}>
            ${data.totalUsd < 1 ? data.totalUsd.toFixed(4) : data.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Assets</div>
          <div className={styles.summaryValue}>{activeAssetsCount}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Protocols</div>
          <div className={styles.summaryValue}>{activeProtocolsCount}</div>
        </div>
      </div>
    </>
  );
};

export default LiquiditySummary;