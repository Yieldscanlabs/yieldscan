import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import styles from '../Header.module.css';

interface NavigationProps {
  isConnected: boolean;
  location: Location;
}

const Navigation: React.FC<NavigationProps> = ({ isConnected, location }) => {
  return (
    <nav className={styles.navigation}>
      <Link 
        to="/" 
        className={`${styles.navLink} ${location.pathname === '/' ? styles.activeLink : ''}`}
      >
        Wallet
      </Link>
      
      {/* Only show My Yields when connected */}
      {isConnected && (
        <Link 
          to="/yields" 
          className={`${styles.navLink} ${location.pathname === '/yields' ? styles.activeLink : ''}`}
        >
          My Yields
        </Link>
      )}
      
      <Link 
        to="/explore" 
        className={`${styles.navLink} ${location.pathname === '/explore' ? styles.activeLink : ''}`}
      >
        Explore
      </Link>
      
      <Link 
        to="/alerts" 
        className={`${styles.navLink} ${location.pathname === '/alerts' ? styles.activeLink : ''}`}
      >
        Alerts
      </Link>
    </nav>
  );
};

export default Navigation; 