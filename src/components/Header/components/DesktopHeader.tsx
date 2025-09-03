import React from 'react';
import { Link } from 'react-router-dom';
import type { Location } from 'react-router-dom';
// import Logo from '../../Logo';
import Navigation from './Navigation';
import EarningsDisplay from './EarningsDisplay';
import WalletSection from './WalletSection';
import HamburgerButton from './HamburgerButton';
import styles from '../Header.module.css';

interface DesktopHeaderProps {
  isVisible: boolean;
  isConnected: boolean;
  address?: string;
  location: Location;
  totalValue: number;
  formatValue: (value: number) => string;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  toggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  copySuccess: boolean;
  handleCopyAddress: () => void;
  handleOpenExplorer: () => void;
  disconnectWallet: () => void;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  isVisible,
  isConnected,
  address,
  location,
  totalValue,
  formatValue,
  isDropdownOpen,
  toggleDropdown,
  toggleMobileMenu,
  isMobileMenuOpen,
  dropdownRef,
  copySuccess,
  handleCopyAddress,
  handleOpenExplorer,
  disconnectWallet,
}) => {
  return (
    <header className={`${styles.header} ${isVisible ? styles.headerVisible : styles.headerHidden}`}>
      <div className={styles.headerLeft}>
        <Link to="/" className={styles.titleLink}>
          {/* <Logo /> */}
        </Link>
        
        <Navigation 
          isConnected={isConnected}
          location={location}
        />
      </div>
      
      <div className={styles.headerRight}>
        <EarningsDisplay
          isConnected={isConnected}
          totalValue={totalValue}
          formatValue={formatValue}
        />
        
        <WalletSection
          isConnected={isConnected}
          address={address}
          isDropdownOpen={isDropdownOpen}
          toggleDropdown={toggleDropdown}
          dropdownRef={dropdownRef}
          copySuccess={copySuccess}
          handleCopyAddress={handleCopyAddress}
          handleOpenExplorer={handleOpenExplorer}
          disconnectWallet={disconnectWallet}
        />

        <HamburgerButton
          isOpen={isMobileMenuOpen}
          onClick={toggleMobileMenu}
        />
      </div>
    </header>
  );
};

export default DesktopHeader; 