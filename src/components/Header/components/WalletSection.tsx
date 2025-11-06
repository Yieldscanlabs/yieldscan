import React from 'react';
import { shortenAddress } from '../../../utils/helpers';
import ThemeToggle from '../../ThemeToggle';
import { useManualWalletStore } from '../../../store/manualWalletStore';
import { useAccount } from 'wagmi';
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
  const {
    manualAddresses,
    activeManualAddressIndex,
    isConsolidated,
    setActiveManualAddress,
    removeManualAddress,
    toggleConsolidated,
    openManualModal
  } = useManualWalletStore();

  const { address: metamaskAddress, isConnected: isMetamaskConnected } = useAccount();

  // Build wallets list (MetaMask + manual) unconditionally to maintain stable hook order
  const allWallets: Array<{ address: string; type: 'metamask' | 'manual'; index: number | null }> = (() => {
    const wallets: Array<{ address: string; type: 'metamask' | 'manual'; index: number | null }> = [];
    if (isMetamaskConnected && metamaskAddress) {
      wallets.push({ address: metamaskAddress, type: 'metamask', index: null });
    }
    manualAddresses.forEach((addr, index) => {
      wallets.push({ address: addr, type: 'manual', index });
    });
    return wallets;
  })();

  if (!isConnected || !address) return null;

  // Determine active wallet
  const activeAddress = activeManualAddressIndex !== null && manualAddresses[activeManualAddressIndex]
    ? manualAddresses[activeManualAddressIndex]
    : (isMetamaskConnected ? metamaskAddress : null);

  const isWalletActive = (walletAddress: string, walletIndex: number | null) => {
    if (walletIndex === null) {
      // MetaMask wallet
      return activeManualAddressIndex === null && isMetamaskConnected && walletAddress === metamaskAddress;
    } else {
      // Manual wallet
      return activeManualAddressIndex === walletIndex;
    }
  };

  const handleSwitchWallet = (walletIndex: number | null) => {
    setActiveManualAddress(walletIndex);
  };

  const handleRemoveWallet = (index: number) => {
    try {
      removeManualAddress(index);
    } catch (error) {
      // Error already handled in store (e.g., trying to remove active wallet)
      console.error(error);
    }
  };

  const canRemoveWallet = (walletIndex: number | null) => {
    // Can't remove MetaMask, can't remove active wallet
    if (walletIndex === null) return false;
    return activeManualAddressIndex !== walletIndex;
  };

  const isMetamaskActive = activeManualAddressIndex === null && isMetamaskConnected;
  const showDisconnectButton = (manualAddresses.length === 1 && activeManualAddressIndex === 0) ||
    (manualAddresses.length === 0 && isMetamaskActive);

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
          {/* Active Wallet Section */}
          {activeAddress && (
            <>
              <div className={styles.walletSectionLabel}>Active Wallet:</div>
              <div className={styles.walletListItem}>
                <span className={styles.walletIcon}>
                  {activeManualAddressIndex === null ? '🦊' : '📝'}
                </span>
                <span className={styles.walletAddressText}>{shortenAddress(activeAddress)}</span>
                <span className={styles.activeBadge}>Active</span>
              </div>
              <div className={styles.dropdownDivider}></div>
            </>
          )}

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

          {/* Other Wallets Section */}
          {allWallets.length > 1 && (
            <>
              <div className={styles.walletSectionLabel}>Other Wallets:</div>
              {allWallets.map((wallet) => {
                const isActive = isWalletActive(wallet.address, wallet.index);
                if (isActive) return null; // Already shown in active section

                return (
                  <div key={wallet.address} className={styles.walletListItem}>
                    <span className={styles.walletIcon}>
                      {wallet.type === 'metamask' ? '🦊' : '📝'}
                    </span>
                    <span className={styles.walletAddressText}>{shortenAddress(wallet.address)}</span>
                    <div className={styles.walletListItemActions}>
                      <button
                        onClick={() => handleSwitchWallet(wallet.index)}
                        className={styles.switchButton}
                      >
                        Switch →
                      </button>
                      {canRemoveWallet(wallet.index) && (
                        <button
                          onClick={() => handleRemoveWallet(wallet.index!)}
                          className={styles.removeButton}
                          title="Remove wallet"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className={styles.dropdownDivider}></div>
            </>
          )}

          {/* Add Wallet Button */}
          <button
            onClick={openManualModal}
            className={styles.dropdownButton}
            disabled={manualAddresses.length >= 5}
            style={{
              opacity: manualAddresses.length >= 5 ? 0.5 : 1,
              cursor: manualAddresses.length >= 5 ? 'not-allowed' : 'pointer'
            }}
          >
            + Add wallet
          </button>

          <div className={styles.dropdownDivider}></div>

          {/* Consolidate Toggle */}
          <label className={styles.consolidateToggle}>
            <input
              type="checkbox"
              checked={isConsolidated}
              onChange={toggleConsolidated}
            />
            <span>Consolidate wallets</span>
          </label>

          <div className={styles.dropdownDivider}></div>

          <div className={styles.dropdownThemeToggle}>
            <ThemeToggle />
          </div>

          <div className={styles.dropdownDivider}></div>

          {showDisconnectButton && (
            <button
              onClick={disconnectWallet}
              className={`${styles.dropdownButton} ${styles.disconnectButton}`}
            >
              Disconnect
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletSection; 