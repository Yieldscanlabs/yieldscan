import { Outlet } from 'react-router-dom';
import Header from './Header/index';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useAssetStore } from '../store/assetStore';
import { useEarnStore, useEarningsAutoRefresh } from '../store/earnStore';
import { useDepositsAndWithdrawalsStore } from '../store/depositsAndWithdrawalsStore';
import { useEffect } from 'react';
import GlobalOptimizationModal from './GlobalOptimizationModal';
import GlobalLockModal from './GlobalLockModal';
import GlobalOptimizeInformationModal from './GlobalOptimizeInformationModal';
import GlobalLockAPYInformationModal from './GlobalLockAPYInformationModal';
import GlobalWithdrawModal from './GlobalWithdrawModal';
import { usePriceStore } from '../store/priceStore';
import { useTheme } from '../hooks/useTheme';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
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

  // Initialize auto-refresh for APY, Assets, and Earnings (no auto-refresh for deposits/withdrawals due to long fetch time)
  useApyAutoRefresh();
  useEarningsAutoRefresh("0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6");

  // Fetch assets, earnings, and user activity when wallet connection changes
  useEffect(() => {
    if (true) {
      fetchEarnings("0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6", true);
      fetchAssets("0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6", true);
      fetchUserActivity("0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6", true);
    }
  }, ["0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6"]);


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
        address={"0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6"}
        disconnectWallet={disconnectWallet}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
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