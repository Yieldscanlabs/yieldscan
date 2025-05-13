import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';
import { injected } from 'wagmi/connectors';
import useWalletConnection from '../hooks/useWalletConnection';

const Layout = () => {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal, disconnectWallet } = useWalletConnection();

  

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