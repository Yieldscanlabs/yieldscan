import React, { useState } from 'react';
import { useConnect } from 'wagmi';
import { getWalletIcon } from './WalletIcons';
import styles from './WalletModal.module.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectors, connect, status, error } = useConnect();
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectWallet = (connector: any) => {
    console.log('Attempting to connect with connector:', {connector});
    setConnectingConnector(connector.id);
    
    // Bypass the readiness check and try to connect anyway
    connect({ connector });
  };

  const isConnecting = status === 'pending';

  // If connection was successful, close the modal
  if (status === 'success') {
    onClose();
  }

  // Filter out connectors or sort them to prioritize available ones
  const sortedConnectors = [...connectors].sort((a, b) => {
    // Prioritize certain wallet types regardless of ready status
    const order = ['metaMask', 'coinbaseWallet', 'walletConnect', 'injected'];
    const aIndex = order.indexOf(a.id);
    const bIndex = order.indexOf(b.id);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return 0;
  });
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Connect Wallet</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            Connect your wallet to access Yieldscan features
          </p>

          <div className={styles.walletList}>
            {sortedConnectors.map((connector) => (
              <button
                key={connector.id}
                className={`${styles.walletButton} ${connectingConnector === connector.id ? styles.connecting : ''}`}
                onClick={() => handleConnectWallet(connector)}
                // Remove the disabled check - we'll try to connect regardless
                disabled={isConnecting}
              >
                <div className={styles.walletIcon}>
                  {getWalletIcon(connector.id)}
                </div>
                <div className={styles.walletName}>
                  {getWalletName(connector.id)}
                </div>
                {connectingConnector === connector.id && isConnecting && (
                  <div className={styles.loadingIndicator}></div>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage}>
              {error.message || 'Failed to connect. Please try again.'}
            </div>
          )}

          <div className={styles.modalFooter}>
            <p>New to Ethereum wallets? <a href="https://ethereum.org/wallets/" target="_blank" rel="noopener noreferrer">Learn more</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;

// Helper functions to get wallet names and icons
function getWalletName(id: string): string {
  switch (id) {
    case 'io.metamask':
      return 'MetaMask'
    case 'app.phantom':
      return 'Phantom Wallet'
    case 'network.pontem':
      return 'Pontem Wallet'
    case 'injected':
      return 'Browser Wallet'
    default:
      return id
  }
}