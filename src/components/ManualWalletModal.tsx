import React, { useMemo, useState } from 'react';
import styles from './WalletModal.module.css';
import { useManualWalletStore } from '../store/manualWalletStore';
import { useAccount, useDisconnect } from 'wagmi';

interface ManualWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

const ManualWalletModal: React.FC<ManualWalletModalProps> = ({ isOpen, onClose }) => {
  const { manualAddress, setManualAddress } = useManualWalletStore();
  const [input, setInput] = useState<string>(manualAddress || '');
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const valid = useMemo(() => isValidAddress(input), [input]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!valid) return;
    // Set manual address first so UI remains in a connected state
    setManualAddress(input.trim());
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


