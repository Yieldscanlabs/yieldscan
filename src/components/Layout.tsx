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
import GlobalOptimizationModal from './GlobalOptimizationModal';
import GlobalLockModal from './GlobalLockModal';
import GlobalOptimizeInformationModal from './GlobalOptimizeInformationModal';
import GlobalLockAPYInformationModal from './GlobalLockAPYInformationModal';
import GlobalWithdrawModal from './GlobalWithdrawModal';
import { useTheme } from '../hooks/useTheme';
import GlobalManualWalletModal from './GlobalManualWalletModal';
import { useManualWalletStore } from '../store/manualWalletStore';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { openManualModal } = useManualWalletStore();
  const { fetchAssets } = useAssetStore();
  const { 
    fetchEarnings, 
    lastUpdated: earningsLastUpdated
  } = useEarnStore();
  const { 
    fetchUserActivity, 
    lastUpdated: activityLastUpdated
  } = useDepositsAndWithdrawalsStore();
  
  // Initialize theme on app startup
  useTheme();

  // Global Ctrl/Cmd+K to open manual wallet modal
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
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
    if (wallet.address) {
      fetchEarnings(wallet.address, true);
      fetchAssets(wallet.address, true);
      fetchUserActivity(wallet.address, true);
    }
  }, [wallet.address]);
  

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

  return (
    <div className={styles.layout}>
      <Header 
        isConnected={wallet.isConnected}
        address={wallet.address}
        disconnectWallet={disconnectWallet}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <GlobalManualWalletModal />
      <GlobalOptimizationModal />
      <GlobalLockModal />
      <GlobalOptimizeInformationModal />
      <GlobalLockAPYInformationModal />
      <GlobalWithdrawModal />
      <Footer />
    </div>
  );
};

export default Layout;