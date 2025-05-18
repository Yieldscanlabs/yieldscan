import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useAssetAutoRefresh, useAssetStore } from '../store/assetStore';
import { useEffect } from 'react';
import GlobalOptimizationModal from './GlobalOptimizationModal';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { lastUpdated: apyLastUpdated, autoRefreshEnabled: apyAutoRefresh, setAutoRefresh: setApyAutoRefresh } = useApyStore();
  const { lastUpdated: assetsLastUpdated, autoRefreshEnabled: assetsAutoRefresh, setAutoRefresh: setAssetsAutoRefresh, fetchAssets } = useAssetStore();
  
  // Initialize auto-refresh for both APY and Assets
  useApyAutoRefresh();
  useAssetAutoRefresh(wallet.address);
  
  // Fetch assets when wallet connection changes
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      // Manually trigger a fetch when wallet connects
      fetchAssets(wallet.address, true);
    }
  }, [wallet.isConnected, wallet.address, fetchAssets]);
  
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