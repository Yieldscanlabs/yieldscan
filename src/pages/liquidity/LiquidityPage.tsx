import React, { useEffect } from 'react';
import { useLiquidityStore } from '../../store/liquidityStore';
import { useManualWalletStore } from '../../store/manualWalletStore';
import { useAccount } from 'wagmi';
import useWalletConnection from '../../hooks/useWalletConnection';
import PageHeader from '../../components/PageHeader';
import WalletModal from '../../components/WalletModal';
import LiquiditySummary from './components/LiquiditySummary';
import LiquidityMatrix from './components/LiquidityMatrix';
import PositionsList from './components/PositionsList';
import WalletLabel from '../../components/common/WalletLabel';
import styles from './styles/Liquidity.module.css';

const LiquidityPage: React.FC = () => {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
  const { manualAddresses, isConsolidated } = useManualWalletStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();
  const { 
    data, 
    liquidityDataByAddress,
    isLoading, 
    error, 
    fetchLiquidityForSingle, 
    fetchLiquidityForMultiple,
    updateActiveView 
  } = useLiquidityStore();

  useEffect(() => {
    if (isConsolidated) {
      // Consolidated mode: fetch all wallets
      const allAddresses = [...manualAddresses];
      if (isMetamaskConnected && metamaskAddress) {
        allAddresses.push(metamaskAddress);
      }

      if (allAddresses.length > 0) {
        fetchLiquidityForMultiple(allAddresses, true);
      } else {
        updateActiveView(null, true, []);
      }
    } else {
      // Single wallet mode: fetch active wallet
      if (wallet.isConnected && wallet.address) {
        fetchLiquidityForSingle(wallet.address, true);
      } else {
        updateActiveView(null, false);
      }
    }
  }, [
    wallet.isConnected,
    wallet.address,
    manualAddresses,
    isConsolidated,
    isMetamaskConnected,
    metamaskAddress,
    fetchLiquidityForSingle,
    fetchLiquidityForMultiple,
    updateActiveView,
  ]);

  useEffect(() => {
    const allAddresses = [...manualAddresses];
    if (isMetamaskConnected && metamaskAddress) {
      allAddresses.push(metamaskAddress);
    }

    if (isConsolidated) {
      updateActiveView(null, true, allAddresses);
    } else {
      updateActiveView(wallet.address, false);
    }
  }, [isConsolidated, manualAddresses, wallet.address, isMetamaskConnected, metamaskAddress, updateActiveView]);

  // Render single wallet view
  const renderSingleWallet = () => {
    if (isLoading && !data) {
      return (
        <>
          <LiquiditySummary data={null} isLoading={true} />
          <PositionsList positions={[]} isLoading={true} />
          <LiquidityMatrix assets={[]} protocols={[]} matrix={{}} isLoading={true} />
        </>
      );
    }

    if (!data) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No liquidity data available for this wallet</div>
        </div>
      );
    }

    return (
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
    );
  };

  // Render consolidated (multiple wallets) view
  const renderConsolidatedView = () => {
    const allAddresses = [...manualAddresses];
    if (isMetamaskConnected && metamaskAddress) {
      allAddresses.push(metamaskAddress);
    }

    if (allAddresses.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <div className={styles.emptyText}>No wallets connected</div>
        </div>
      );
    }

    return (
      <>
        {allAddresses.map((address) => {
          const walletData = liquidityDataByAddress[address.toLowerCase()];
          const isMetamask = isMetamaskConnected && address.toLowerCase() === metamaskAddress?.toLowerCase();

          return (
            <div key={address} className={styles.walletSection}>
              <div className={styles.walletSectionHeader}>
                <div className={styles.headerLeft}>
                  <WalletLabel address={address} showEditButton={false} />
                  {isMetamask && <span className={styles.metamaskBadge}>🦊 MetaMask</span>}
                </div>
              </div>

              {isLoading && !walletData ? (
                <>
                  <LiquiditySummary data={null} isLoading={true} showWalletCard={false} />
                  <PositionsList positions={[]} isLoading={true} />
                  <LiquidityMatrix assets={[]} protocols={[]} matrix={{}} isLoading={true} />
                </>
              ) : walletData ? (
                <>
                  <LiquiditySummary data={walletData} isLoading={false} showWalletCard={false} />
                  <PositionsList positions={walletData.positions} isLoading={false} />
                  <LiquidityMatrix
                    assets={walletData.assets}
                    protocols={walletData.protocols}
                    matrix={walletData.matrix}
                    isLoading={false}
                  />
                </>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📊</div>
                  <div className={styles.emptyText}>No liquidity data available for this wallet</div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Liquidity"
        subtitle="View your DeFi liquidity positions across protocols"
      />

      {!wallet.isConnected && manualAddresses.length === 0 ? (
        <div className={styles.connectPrompt}>
          <p>Connect your wallet to view your liquidity positions</p>
          <button className={styles.connectButton} onClick={openConnectModal}>
            Connect Wallet
          </button>
        </div>
      ) : isConsolidated ? (
        renderConsolidatedView()
      ) : (
        renderSingleWallet()
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