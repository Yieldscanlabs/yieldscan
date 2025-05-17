import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { shortenAddress } from '../utils/helpers';
import styles from './Header.module.css';
import bear from '../assets/bear.png'; // Adjust the path as necessary
import Logo from './Logo';
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
    </header>
  );
};

export default Header;