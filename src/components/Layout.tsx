import { Outlet } from 'react-router-dom';
import Header from './Header/index';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh } from '../store/apyStore';
import { useAssetStore } from '../store/assetStore';
import { useEarnStore, useEarningsAutoRefresh } from '../store/earnStore';
import { useDepositsAndWithdrawalsStore } from '../store/depositsAndWithdrawalsStore';
import { useEffect } from 'react';
import GlobalLockModal from './GlobalLockModal';
import GlobalOptimizeInformationModal from './GlobalOptimizeInformationModal';
import GlobalLockAPYInformationModal from './GlobalLockAPYInformationModal';
import GlobalWithdrawModal from './GlobalWithdrawModal';
import { useTheme } from '../hooks/useTheme';
import GlobalManualWalletModal from './GlobalManualWalletModal';
import { useManualWalletStore } from '../store/manualWalletStore';
import { useAccount } from 'wagmi';
import ScanProgressBar from './loaders/ScanProgressBar';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const {
    openManualModal,
    manualAddresses,
    activeManualAddressIndex,
    isConsolidated
  } = useManualWalletStore();
  const {
    fetchAssets,
    fetchAssetsForMultiple,
    updateActiveView
  } = useAssetStore();
  const {
    fetchEarnings,
    lastUpdated: earningsLastUpdated
  } = useEarnStore();
  const {
    fetchUserActivity,
    lastUpdated: activityLastUpdated
  } = useDepositsAndWithdrawalsStore();
  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();

  // Initialize theme on app startup
  useTheme();

  // Global Ctrl/Cmd+K to open manual wallet modal
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event?.key?.toLowerCase() === 'k') {
        event.preventDefault();
        openManualModal();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openManualModal]);
  // Initialize auto-refresh for APY, Assets, and Earnings (no auto-refresh for deposits/withdrawals due to long fetch time)
  useApyAutoRefresh();
  useEarningsAutoRefresh(wallet.address);

  // Fetch assets, earnings, and user activity when wallet connection changes
  useEffect(() => {
    if (isConsolidated) {
      // Consolidated mode: fetch all wallets
      const allAddresses = [...manualAddresses];
      if (isMetamaskConnected && metamaskAddress) {
        allAddresses.push(metamaskAddress);
      }

      if (allAddresses.length > 0) {
        fetchAssetsForMultiple(allAddresses, true);
        // For earnings and activity, we'll use the active wallet address
        // if (wallet.address) {
        allAddresses.forEach(addr => {
          fetchEarnings(addr, true);
          fetchUserActivity(addr, true);
        })
        // }
      } else {
        updateActiveView(null, true, []);
      }
    } else {
      // Single wallet mode: fetch active wallet
      if (wallet.address) {
        fetchAssets(wallet.address, true);
        fetchEarnings(wallet.address, true);
        fetchUserActivity(wallet.address, true);
      } else {
        updateActiveView(null, false);
      }
    }
  }, [
    wallet.address,
    manualAddresses,
    activeManualAddressIndex,
    isConsolidated,
    isMetamaskConnected,
    metamaskAddress,
    fetchAssets,
    fetchAssetsForMultiple,
    fetchEarnings,
    fetchUserActivity,
    updateActiveView
  ]);

  // Update active view when consolidation mode or wallet selection changes
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
  }, [isConsolidated, manualAddresses, activeManualAddressIndex, wallet.address, isMetamaskConnected, metamaskAddress, updateActiveView]);


  useEffect(() => {
    if (earningsLastUpdated && wallet.isConnected) {
      // Any code to run when Earnings data is refreshed
    }
  }, [earningsLastUpdated, wallet.isConnected]);

  useEffect(() => {
    if (activityLastUpdated && wallet.isConnected) {
      // Any code to run when Deposits/Withdrawals data is refreshed
    }
  }, [activityLastUpdated, wallet.isConnected]);


  const handleDisconnectWallet = () => {
    localStorage.clear();
    disconnectWallet();
  }
  return (
    <div className={styles.layout}>
      <ScanProgressBar />
      <Header
        isConnected={wallet.isConnected}
        address={wallet.address}
        disconnectWallet={handleDisconnectWallet}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <GlobalManualWalletModal />
      <GlobalLockModal />
      <GlobalOptimizeInformationModal />
      <GlobalLockAPYInformationModal />
      <GlobalWithdrawModal />
      <Footer />
    </div>
  );
};

export default Layout;