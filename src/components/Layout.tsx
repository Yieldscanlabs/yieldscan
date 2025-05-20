import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useAssetAutoRefresh, useAssetStore } from '../store/assetStore';
import { useEarnStore, useEarningsAutoRefresh } from '../store/earnStore';
import { useEffect, useMemo } from 'react';
import GlobalOptimizationModal from './GlobalOptimizationModal';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { lastUpdated: apyLastUpdated, autoRefreshEnabled: apyAutoRefresh, setAutoRefresh: setApyAutoRefresh } = useApyStore();
  const { lastUpdated: assetsLastUpdated, autoRefreshEnabled: assetsAutoRefresh, setAutoRefresh: setAssetsAutoRefresh, fetchAssets } = useAssetStore();
  const { 
    fetchEarnings, 
    getTotalEarnings, 
    lastUpdated: earningsLastUpdated,
    autoRefreshEnabled: earningsAutoRefresh,
    setAutoRefresh: setEarningsAutoRefresh
  } = useEarnStore();
  
  // Get total earnings for display in header
  const totalEarnings = useMemo(() => getTotalEarnings(), [getTotalEarnings, earningsLastUpdated]);
  
  // Initialize auto-refresh for APY, Assets, and Earnings
  useApyAutoRefresh();
  // useAssetAutoRefresh(wallet.address);
  useEarningsAutoRefresh(wallet.address);
  
  // Fetch assets and earnings when wallet connection changes
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      // Manually trigger a fetch when wallet connects
      // fetchAssets(wallet.address, true);
      
      // Also fetch earnings data
      fetchEarnings(wallet.address, true);
    }
  }, [wallet.isConnected, wallet.address, fetchEarnings]);
  
  useEffect(() => {
    if (apyLastUpdated) {
      // Any code to run when APY data is refreshed
    }
  }, [apyLastUpdated]);

  useEffect(() => {
    if (assetsLastUpdated && wallet.isConnected) {
      // Any code to run when Assets data is refreshed
    }
  }, [assetsLastUpdated, wallet.isConnected]);

  useEffect(() => {
    if (earningsLastUpdated && wallet.isConnected) {
      // Any code to run when Earnings data is refreshed
      console.log('Earnings data refreshed:', totalEarnings);
    }
  }, [earningsLastUpdated, wallet.isConnected, totalEarnings]);

  return (
    <div className={styles.layout}>
      <Header 
        isConnected={wallet.isConnected}
        address={wallet.address}
        disconnectWallet={disconnectWallet}
        totalEarnings={totalEarnings.lifetime}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
      <GlobalOptimizationModal />
      <Footer />
    </div>
  );
};

export default Layout;