import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { shortenAddress } from '../utils/helpers';
import styles from './Header.module.css';
import Logo from './Logo';

interface HeaderProps {
  isConnected: boolean;
  address?: string;
  disconnectWallet: () => void;
  totalEarnings?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  address, 
  disconnectWallet,
  totalEarnings = 0
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <Link to="/" className={styles.titleLink}>
          <Logo />
        </Link>
        
        {/* Navigation Links */}
        <nav className={styles.navigation}>
          {/* Always show Home */}
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
              Yields
            </Link>
          )}
          <Link 
            to="/explore" 
            className={`${styles.navLink} ${location.pathname === '/explore' ? styles.activeLink : ''}`}
          >
            Explore
          </Link>
        </nav>
      </div>
      
      <div className={styles.headerRight}>
        {/* Display earnings if connected and greater than 0 */}
        {isConnected && totalEarnings > 0 && (
          <div className={styles.earningsBadge}>
            <span className={styles.earningsLabel}>Total Yield:</span>
            <span className={styles.earningsAmount}>${totalEarnings.toFixed(2)}</span>
          </div>
        )}
        
        {/* Wallet address and dropdown */}
        {isConnected && address && (
          <div className={styles.walletContainer} ref={dropdownRef}>
            <div 
              className={`${styles.walletAddress} ${isDropdownOpen ? styles.walletAddressActive : ''}`}
              onClick={toggleDropdown}
            >
              {shortenAddress(address)}
              <span className={styles.dropdownArrow}>▼</span>
            </div>
            {isDropdownOpen && (
              <div className={styles.walletDropdown}>
                <button onClick={disconnectWallet} className={styles.disconnectButton}>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;