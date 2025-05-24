import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useAssetStore } from '../store/assetStore';
import { useEarnStore, useEarningsAutoRefresh } from '../store/earnStore';
import { useEffect } from 'react';
import GlobalOptimizationModal from './GlobalOptimizationModal';
import GlobalLockModal from './GlobalLockModal';
import { usePriceStore } from '../store/priceStore';
import { useTheme } from '../hooks/useTheme';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { fetchAssets } = useAssetStore();
  const { 
    fetchEarnings, 
    lastUpdated: earningsLastUpdated
  } = useEarnStore();
  
  // Initialize theme on app startup
  useTheme();
  
  // Initialize auto-refresh for APY, Assets, and Earnings
  useApyAutoRefresh();
  useEarningsAutoRefresh(wallet.address);
  
  // Fetch assets and earnings when wallet connection changes
  useEffect(() => {
    if (wallet.address) {
      fetchEarnings(wallet.address, true);
      fetchAssets(wallet.address, true);
    }
  }, [wallet.address]);
  

  useEffect(() => {
    if (earningsLastUpdated && wallet.isConnected) {
      // Any code to run when Earnings data is refreshed
    }
  }, [earningsLastUpdated, wallet.isConnected]);

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
      <GlobalOptimizationModal />
      <GlobalLockModal />
      <Footer />
    </div>
  );
};

export default Layout;