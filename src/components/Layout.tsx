import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { useApyAutoRefresh, useApyStore } from '../store/apyStore';
import { useEffect } from 'react';

const Layout = () => {
  const { wallet, disconnectWallet } = useWalletConnection();
  const { lastUpdated, autoRefreshEnabled, setAutoRefresh } = useApyStore();
  useApyAutoRefresh();
  
  useEffect(() => {
    if (lastUpdated) {
    }
  }, [lastUpdated]);

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
      <Footer />
    </div>
  );
};

export default Layout;