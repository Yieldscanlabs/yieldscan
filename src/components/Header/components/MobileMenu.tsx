import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
// import Logo from '../../Logo';
import styles from '../Header.module.css';
import Logo from '../../Logo';
import { useCurrencyFormatter } from '../../../hooks/useCurrencyFormatter';

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  mobileMenuRef: React.RefObject<HTMLDivElement>;
  isConnected: boolean;
  location: Location;
  totalValue: number;
  dormantCapital: number; // Add this line
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  setIsOpen,
  mobileMenuRef,
  isConnected,
  location,
  totalValue,
  dormantCapital
}) => {
  const closeMobileMenu = () => setIsOpen(false);
  const formatValue = useCurrencyFormatter();

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
                  <span className={styles.mobileEarningsLabel}>Dormant Capital:</span>
                  <span className={styles.infoTooltipWrapperDown}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className={styles.infoTooltipDown}>
              <strong>Dormant Capital</strong>Funds currently in your wallet that are not  generating returns yet.
            </span>
          </span>
                  <span className={styles.mobileEarningsAmount}>
                    ~${formatValue(dormantCapital)}
                  </span>
                </div>
                <div className={styles.mobileEarningsBadge}>
                  <span className={styles.mobileEarningsLabel}>Working Capital:</span>
                  <span className={styles.infoTooltipWrapperDown}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.infoIcon}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span className={styles.infoTooltipDown}>
              <strong>Working Capital</strong> Compounded value (deposit + earned profit).
            </span>
          </span>
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