import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useAssetAutoRefresh, useAssetStore } from '../store/assetStore';
import { useEarnStore, useEarningsAutoRefresh } from '../store/earnStore';
import { useEffect } from 'react';
import GlobalOptimizationModal from './GlobalOptimizationModal';
import { usePriceStore } from '../store/priceStore';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { lastUpdated: apyLastUpdated } = useApyStore();
  const {} = usePriceStore();
  const { fetchAssets } = useAssetStore();
  const { 
    fetchEarnings, 
    lastUpdated: earningsLastUpdated
  } = useEarnStore();
  
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
    if (apyLastUpdated) {
      // Any code to run when APY data is refreshed
    }
  }, [apyLastUpdated]);

  useEffect(() => {
    if (earningsLastUpdated && wallet.isConnected) {
      // Any code to run when Earnings data is refreshed
      console.log('Earnings data refreshed');
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
      <Footer />
    </div>
  );
};

export default Layout;