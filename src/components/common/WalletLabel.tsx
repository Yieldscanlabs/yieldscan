import React, { useState } from 'react';
import { Pencil, Check, X as XIcon, Copy } from 'lucide-react'; 
import { useEnsName } from 'wagmi';
import { shortenAddress } from '../../utils/helpers';
// 1. Switch import to Activity Store
import { useDepositsAndWithdrawalsStore } from '../../store/depositsAndWithdrawalsStore'; 
import { generateWalletGradient } from '../../utils/avatarGenerator';
import styles from './WalletLabel.module.css';

interface Props {
  address: string;
}

const WalletLabel: React.FC<Props> = ({ address }) => {
  // 2. Access Data & Actions from the correct store
  const activityData = useDepositsAndWithdrawalsStore(state => state.activityData);
  const updateWalletLabel = useDepositsAndWithdrawalsStore(state => state.updateWalletLabel);

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false); 

  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1
  });

  const avatarBackground = generateWalletGradient(address);
  
  // 3. Get Saved Label from Backend Data
  const userData = activityData[address.toLowerCase()];
  const savedLabel = userData?.label;

  const defaultDisplayName = ensName || `Wallet:`;
  const [inputValue, setInputValue] = useState(savedLabel || "");

  const handleSave = () => {
    // 4. Trigger Action (Optimistic Update + API Call)
    const newLabel = inputValue.trim();
    // If empty, pass empty string to backend to clear it (or handle per your API logic)
    updateWalletLabel(address, newLabel);
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
            placeholder={defaultDisplayName}
            maxLength={24}
          />
          {/* Label: {userData?.label} */}
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
        {/* Priority: DB Label -> ENS -> Default */}
        <h3 className={savedLabel ? styles.customName : styles.defaultLabel} style={{ margin: 0 }}>
          {savedLabel || ensName || "Wallet"}
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
        onClick={() => setIsEditing(true)}
        className={styles.editBtn}
        title="Edit Label"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
};

export default WalletLabel;