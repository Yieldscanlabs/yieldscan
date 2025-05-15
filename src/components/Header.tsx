import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Link to="/" className={styles.titleLink}>
          <h1 className={styles.title}>Yieldscan</h1>
        </Link>
        
        {/* Navigation Links */}
        <nav className={styles.navigation}>
          {/* Always show Home */}
          <Link 
            to="/" 
            className={`${styles.navLink} ${location.pathname === '/' ? styles.activeLink : ''}`}
          >
            Home
          </Link>
          
          {/* Only show My Yields when connected */}
          {isConnected && (
            <Link 
              to="/my-yields" 
              className={`${styles.navLink} ${location.pathname === '/my-yields' ? styles.activeLink : ''}`}
            >
              My Yields
            </Link>
          )}
        </nav>
      </div>
      
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