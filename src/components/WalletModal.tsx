import React, { useState } from 'react';
import { useChainId, useChains, useConnect } from 'wagmi';
import { getWalletIcon } from './WalletIcons';
import styles from './WalletModal.module.css';
// import { fetchAllTransactions } from '../store/assetStore';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualAddress?: (address: string) => void; // 👈 add callback
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onManualAddress }) => {
  const { connectors, connect, status, error } = useConnect();
  const id = useChainId()
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  if (!isOpen) return null;

  const handleConnectWallet = (connector: any) => {
    setConnectingConnector(connector.id);
    connect({ connector });
  };
  const handleFetchTransactions = async (walletAddress: string) => {
    if (!id) return;
    try {
      // const txs = await fetchAllTransactions(walletAddress, id.toString(), 50);
      // console.log('Fetched transactions:', txs);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };
  const handleManualSubmit = () => {
    if (manualAddress && /^0x[a-fA-F0-9]{40}$/.test(manualAddress)) {
      onManualAddress?.(manualAddress); // 👈 pass address up
      handleFetchTransactions(manualAddress); // fetch transactions for manual input

      onClose();
    } else {
      alert('Please enter a valid Ethereum address');
    }
  };

  const isConnecting = status === 'pending';
  if (status === 'success') onClose();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Connect Wallet</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            Connect your wallet or enter an address manually
          </p>

          <div className={styles.walletList}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                className={`${styles.walletButton} ${connectingConnector === connector.id ? styles.connecting : ''}`}
                onClick={() => handleConnectWallet(connector)}
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

          {/* 👇 Manual input section */}
          <div className={styles.manualInput}>
            <input
              type="text"
              placeholder="Enter Ethereum address"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
            />
            <button onClick={handleManualSubmit}>Use Address</button>
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

function getWalletName(id: string): string {
  switch (id) {
    case 'io.metamask': return 'MetaMask'
    case 'app.phantom': return 'Phantom Wallet'
    case 'network.pontem': return 'Pontem Wallet'
    case 'injected': return 'Browser Wallet'
    default: return id
  }
}
