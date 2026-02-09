import React, { useState } from 'react';
import { Pencil, Check, X as XIcon, Copy } from 'lucide-react';
import { shortenAddress } from '../../utils/helpers';
import { useDepositsAndWithdrawalsStore } from '../../store/depositsAndWithdrawalsStore';
import { generateWalletGradient } from '../../utils/avatarGenerator';
import styles from './WalletLabel.module.css';
import toast from 'react-hot-toast';

interface Props {
  address: string;
}

const WalletLabel: React.FC<Props> = ({ address }) => {
  const activityData = useDepositsAndWithdrawalsStore(state => state.activityData);
  const updateWalletLabel = useDepositsAndWithdrawalsStore(state => state.updateWalletLabel);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatarBackground = generateWalletGradient(address);

  // Data Source: Strictly from Store (Backend)
  const userData = activityData[address.toLowerCase()];
  const savedLabel = userData?.label; // Backend provides default if custom isn't set

  const [inputValue, setInputValue] = useState(savedLabel || "");

  const handleSave = () => {
    const newLabel = inputValue.trim();
    toast.promise(
      updateWalletLabel(address, newLabel),
      {
        loading: 'Updating label...',
        success: 'Label updated successfully!',
        error: (err: any) => `Error: ${err.message}`,
      }
    );
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(savedLabel || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEditing) {
    return (
      <div className={styles.container}>
        <div
          className={styles.avatar}
          style={{ background: avatarBackground }}
        />
        <div className={styles.editContainer}>
          <input
            autoFocus
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            // Use savedLabel directly. If data is loading, fallback to simple "Wallet" string for UI stability.
            placeholder={savedLabel || "Wallet:"}
            maxLength={24}
          />
          <div className={styles.actions}>
            <button onClick={handleSave} className={`${styles.actionBtn} ${styles.saveBtn}`} title="Save">
              <Check size={16} strokeWidth={2.5} />
            </button>
            <button onClick={handleCancel} className={`${styles.actionBtn} ${styles.cancelBtn}`} title="Cancel">
              <XIcon size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.avatar}
        style={{ background: avatarBackground }}
        title="Unique Wallet Identity"
      />

      <div className={styles.labelGroup}>
        {/* Simplified: Relies purely on backend label. 
            Fallback to "Wallet" only happens if API hasn't responded yet. */}
        <h3 className={styles.customName} style={{ margin: 0 }}>
          {savedLabel || "Wallet"}
        </h3>

        <div className={styles.addressWrapper}>
          <span className={styles.address}>
            ({shortenAddress(address)})
          </span>
          <button
            onClick={handleCopy}
            className={styles.copyBtn}
            title="Copy Address"
          >
            {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          setInputValue(savedLabel || ""); // Ensure input starts with current DB value
          setIsEditing(true);
        }}
        className={styles.editBtn}
        title="Edit Label"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
};

export default WalletLabel;