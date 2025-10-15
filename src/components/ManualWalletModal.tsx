import React, { useMemo, useState } from 'react';
import styles from './WalletModal.module.css';
import { useManualWalletStore } from '../store/manualWalletStore';
import { useAccount, useDisconnect } from 'wagmi';
import NetworkSelector from './NetworkSelector';
import { AVAILABLE_NETWORKS } from '../utils/markets';

interface ManualWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

const ManualWalletModal: React.FC<ManualWalletModalProps> = ({ isOpen, onClose }) => {
  const { manualAddress, manualChainId, setManualAddress, setManualChainId } = useManualWalletStore();
  const [input, setInput] = useState<string>(manualAddress || '');
  const [selectedChainId, setSelectedChainId] = useState<number | 'all'>(manualChainId ?? 'all');
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const valid = useMemo(() => isValidAddress(input), [input]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!valid) return;
    // Set manual address first so UI remains in a connected state
    setManualAddress(input.trim());
    // Persist selected manual chain (or null if 'all')
    if (selectedChainId === 'all') {
      setManualChainId(null);
    } else {
      setManualChainId(selectedChainId);
    }
    if (isConnected) {
      try { disconnect(); } catch {}
    }
    onClose();
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const stopPropagation: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.header}>
          <h2>Add wallet address</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Wallet address (EVM)</label>
          <input
            type="text"
            placeholder="0x..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.input}
            autoFocus
          />
          {!input ? (
            <p className={styles.helperText}>Paste an EVM address to watch balances.</p>
          ) : !valid ? (
            <p className={styles.errorText}>Enter a valid EVM address.</p>
          ) : null}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>Preferred network</label>
            <NetworkSelector
              selectedNetwork={selectedChainId}
              onChange={(value) => {
                if (value === 'all') {
                  setSelectedChainId('all');
                } else if (typeof value === 'number' && AVAILABLE_NETWORKS.includes(value)) {
                  setSelectedChainId(value);
                }
              }}
            />
            <p className={styles.helperText}>Choose a specific chain context or "All Networks".</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryButton} onClick={onClose}>Cancel</button>
          <button className={styles.primaryButton} onClick={handleSave} disabled={!valid}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ManualWalletModal;


