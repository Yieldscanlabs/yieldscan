import React, { useEffect } from 'react';
import { useLiquidityStore } from '../../store/liquidityStore';
import useWalletConnection from '../../hooks/useWalletConnection';
import PageHeader from '../../components/PageHeader';
import WalletModal from '../../components/WalletModal';
import LiquiditySummary from './components/LiquiditySummary.tsx';
import LiquidityMatrix from './components/LiquidityMatrix.tsx';
import PositionsList from './components/PositionsList.tsx';
import styles from './styles/Liquidity.module.css';

const LiquidityPage: React.FC = () => {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { data, isLoading, error, fetchLiquidity } = useLiquidityStore();

  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      fetchLiquidity(wallet.address);
    }
  }, [wallet.isConnected, wallet.address, fetchLiquidity]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Liquidity"
        subtitle="View your DeFi liquidity positions across protocols"
      />

      {!wallet.isConnected ? (
        <div className={styles.connectPrompt}>
          <p>Connect your wallet to view your liquidity positions</p>
          <button className={styles.connectButton} onClick={openConnectModal}>
            Connect Wallet
          </button>
        </div>
      ) : isLoading && !data ? (
        <>
          <LiquiditySummary data={null} isLoading={true} />
          <PositionsList positions={[]} isLoading={true} />
          <LiquidityMatrix assets={[]} protocols={[]} matrix={{}} isLoading={true} />
        </>
      ) : data ? (
        <>
          <LiquiditySummary data={data} isLoading={false} />
          <PositionsList positions={data.positions} isLoading={false} />
          <LiquidityMatrix
            assets={data.assets}
            protocols={data.protocols}
            matrix={data.matrix}
            isLoading={false}
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No liquidity data available for this wallet</div>
        </div>
      )}

      {error && (
        <div className={styles.errorCard}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <WalletModal isOpen={isModalOpen} onClose={closeConnectModal} />
    </div>
  );
};

export default LiquidityPage;