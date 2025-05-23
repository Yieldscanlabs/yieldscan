import React from 'react';
import styles from '../pages/MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import { getNetworkIcon, getNetworkName } from '../utils/networkIcons';
import Protocol from './Protocol';

interface LockAPYInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  asset: Asset;
  protocol: {
    name: string;
    swap: boolean;
    ytAddress: string;
    ptAddress: string;
    swapAddress: string;
    ytDecimals: number;
    ptDecimals: number;
  };
  expirationDate: string;
}

const LockAPYInformationModal: React.FC<LockAPYInformationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  asset,
  protocol,
  expirationDate
}) => {
  if (!isOpen) return null;

  // Get the chain icon for the asset
  const chainIcon = getNetworkIcon(asset.chainId);
  const chainName = getNetworkName(asset.chainId);

  // Format expiration date for display
  const formattedExpirationDate = new Date(expirationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get protocol-specific explanation
  const getProtocolExplanation = () => {
    switch (protocol.name.toLowerCase()) {
      case 'pendle':
        return (
          <>
            <p>
              Your {asset.token} will be swapped to Principal Tokens (PT) and Yield Tokens (YT) on Pendle.
            </p>
            <p>
              The Yield Tokens (YT) will be sold automatically to guarantee your yield until expiration.
            </p>
            <p>
              <strong>Important:</strong> Your funds will be locked until {formattedExpirationDate}.
            </p>
          </>
        );
      default:
        return (
          <p>
            Your {asset.token} will be locked to guarantee the yield until {formattedExpirationDate}.
          </p>
        );
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Lock APY for {asset.token}</h2>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <div className={styles.assetInfoLarge}>
              <div className={styles.assetIconWrapperLarge}>
                <img src={asset.icon} alt={asset.token} className={styles.assetIconMedium} />
                <img src={chainIcon} alt={chainName} className={styles.chainIconOverlayLarge} />
              </div>
              <div>
                <div className={styles.assetNameBold}>{asset.token}</div>
                <div className={styles.protocolRow}>
                  <Protocol name={asset.protocol || protocol.name} showLogo={true} />
                </div>
                <div className={styles.assetBalance}>
                  Balance: {formatNumber(parseFloat(asset.balance), asset.maxDecimalsShow || 6)} {asset.token}
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.modalSection}>
            <div className={styles.sectionTitle}>What will happen</div>
            <div className={styles.explanationBox}>
              {getProtocolExplanation()}
            </div>

            <div className={styles.lockDetailsBox}>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Protocol:</span>
                <span className={styles.lockDetailValue}>{protocol.name}</span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Network:</span>
                <span className={styles.lockDetailValue}>
                  <img src={chainIcon} alt={chainName} className={styles.chainIconTiny} />
                  {chainName}
                </span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Locks until:</span>
                <span className={styles.lockDetailValue}>{formattedExpirationDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooterCentered}>
          <button 
            className={styles.lockButton} 
            onClick={onConfirm}
          >
            Lock APY
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockAPYInformationModal; 