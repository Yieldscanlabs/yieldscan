import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import Logo from '../../Logo';
import styles from '../Header.module.css';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mobileMenuRef: React.RefObject<HTMLDivElement>;
  isConnected: boolean;
  location: Location;
  totalValue: number;
  formatValue: (value: number) => string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
  mobileMenuRef,
  isConnected,
  location,
  totalValue,
  formatValue,
}) => {
  const closeMobileMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className={styles.mobileMenuOverlay} 
          onClick={closeMobileMenu} 
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div 
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuOpen : ''}`}
      >
        <div className={styles.mobileMenuHeader}>
          <Link to="/" className={styles.mobileMenuLogo} onClick={closeMobileMenu}>
            <Logo />
          </Link>
          <button 
            className={styles.mobileMenuCloseButton}
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
        </div>

        <nav className={styles.mobileNavigation}>
          <Link 
            to="/" 
            className={`${styles.mobileNavLink} ${location.pathname === '/' ? styles.mobileNavLinkActive : ''}`}
            onClick={closeMobileMenu}
          >
            Wallet
          </Link>
          
          {/* Only show My Yields when connected */}
          {isConnected && (
            <Link 
              to="/yields" 
              className={`${styles.mobileNavLink} ${location.pathname === '/yields' ? styles.mobileNavLinkActive : ''}`}
              onClick={closeMobileMenu}
            >
              My Yields
            </Link>
          )}
          <Link 
            to="/explore" 
            className={`${styles.mobileNavLink} ${location.pathname === '/explore' ? styles.mobileNavLinkActive : ''}`}
            onClick={closeMobileMenu}
          >
            Explore
          </Link>
          <Link 
            to="/alerts" 
            className={`${styles.mobileNavLink} ${location.pathname === '/alerts' ? styles.mobileNavLinkActive : ''}`}
            onClick={closeMobileMenu}
          >
            Alerts
          </Link>
        </nav>

        {/* Mobile wallet info and actions */}
        {isConnected && (
          <div className={styles.mobileWalletSection}>
            <div className={styles.mobileWalletInfo}>
              
              {/* Display total value on mobile */}
              <div className={styles.mobileEarningsContainer}>
                <div className={styles.mobileEarningsBadge}>
                  <span className={styles.mobileEarningsLabel}>Total Savings:</span>
                  <span className={styles.mobileEarningsAmount}>
                    ~${formatValue(totalValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileMenu; 