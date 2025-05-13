import React from 'react';
import { Link } from 'react-router-dom';
import { shortenAddress } from '../utils/helpers';
import styles from './Header.module.css';

interface HeaderProps {
  isConnected: boolean;
  address?: string;
  disconnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  address, 
  disconnectWallet 
}) => {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.titleLink}>
        <h1 className={styles.title}>Yieldscan</h1>
      </Link>
      {isConnected && address && (
        <div className={styles.walletInfo}>
          <span className={styles.walletAddress}>
            {shortenAddress(address)}
          </span>
          <button onClick={disconnectWallet} className={styles.disconnectButton}>
            Disconnect
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;