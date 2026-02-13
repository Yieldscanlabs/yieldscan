import React from 'react';
import styles from '../styles/Liquidity.module.css';

interface Props {
  assets: string[];
  protocols: string[];
  matrix: Record<string, Record<string, number>>;
  isLoading: boolean;
}

const LiquidityMatrix: React.FC<Props> = ({ assets, protocols, matrix, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h2 className={styles.sectionTitle}>Asset / Protocol Matrix</h2>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`${styles.skeletonRow} ${styles.skeleton}`} />
        ))}
      </div>
    );
  }

  if (assets.length === 0 || protocols.length === 0) {
    return (
      <div>
        <h2 className={styles.sectionTitle}>Asset / Protocol Matrix</h2>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No matrix data available</div>
        </div>
      </div>
    );
  }

  const formatCell = (val: number) => {
    if (val === 0) return '0';
    if (val < 0.01) return val.toFixed(6);
    return val.toFixed(4);
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>Asset / Protocol Matrix</h2>
      <div className={styles.matrixWrapper}>
        <div className={styles.matrixScrollable}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Asset</th>
                {protocols.map(protocol => (
                  <th key={protocol}>{protocol}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset}>
                  <td>{asset}</td>
                  {protocols.map(protocol => {
                    const value = matrix[asset]?.[protocol] ?? 0;
                    return (
                      <td
                        key={protocol}
                        className={value > 0 ? styles.cellNonZero : styles.cellZero}
                      >
                        {formatCell(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiquidityMatrix;