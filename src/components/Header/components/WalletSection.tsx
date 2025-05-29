import React from 'react';
import { shortenAddress } from '../../../utils/helpers';
import ThemeToggle from '../../ThemeToggle';
import styles from '../Header.module.css';

interface WalletSectionProps {
  isConnected: boolean;
  address?: string;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  copySuccess: boolean;
  handleCopyAddress: () => void;
  handleOpenExplorer: () => void;
  disconnectWallet: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({
  isConnected,
  address,
  isDropdownOpen,
  toggleDropdown,
  dropdownRef,
  copySuccess,
  handleCopyAddress,
  handleOpenExplorer,
  disconnectWallet,
}) => {
  if (!isConnected || !address) return null;

  return (
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
          <button 
            onClick={handleCopyAddress} 
            className={styles.dropdownButton}
          >
            {copySuccess ? 'Copied!' : 'Copy Address'}
          </button>
          
          <button 
            onClick={handleOpenExplorer} 
            className={styles.dropdownButton}
          >
            View on Explorer
          </button>
          
          <div className={styles.dropdownDivider}></div>
          
          <div className={styles.dropdownThemeToggle}>
            <ThemeToggle />
          </div>
          
          <div className={styles.dropdownDivider}></div>
          
          <button 
            onClick={disconnectWallet} 
            className={`${styles.dropdownButton} ${styles.disconnectButton}`}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletSection; 