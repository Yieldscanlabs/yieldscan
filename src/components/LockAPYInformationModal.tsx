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
  currentAPY?: number;
  amountToLock?: number;
}

const LockAPYInformationModal: React.FC<LockAPYInformationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  asset,
  protocol,
  expirationDate,
  currentAPY,
  amountToLock
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

  // Calculate days until expiration
  const daysUntilExpiration = Math.ceil(
    (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate estimated yield
  const calculateEstimatedYield = () => {
    if (!currentAPY || !amountToLock || currentAPY === 0 || amountToLock === 0 || daysUntilExpiration <= 0) {
      return 0;
    }
    // Calculate yield for the lock period: amount * (apy / 100) * (days / 365)
    return amountToLock * (currentAPY / 100) * (daysUntilExpiration / 365);
  };

  const estimatedYield = calculateEstimatedYield();

  // Calculate USD value of estimated yield
  const calculateEstimatedYieldUsd = () => {
    if (!estimatedYield || !asset.balanceUsd || !asset.balance) {
      return 0;
    }
    // Calculate USD price per token
    const balanceNum = parseFloat(asset.balance);
    const balanceUsdNum = parseFloat(asset.balanceUsd);
    if (balanceNum === 0) return 0;
    
    const usdPricePerToken = balanceUsdNum / balanceNum;
    return estimatedYield * usdPricePerToken;
  };

  const estimatedYieldUsd = calculateEstimatedYieldUsd();

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
            {/* <div className={styles.sectionTitle}>What will happen</div> */}
            <div className={styles.explanationBox}>
              {getProtocolExplanation()}
            </div>


            <div className={styles.sectionTitle} style={{ marginTop: '24px' }}>Lock Details</div>
            <div className={styles.lockDetailsBox}>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Protocol:</span>
                <span className={styles.lockDetailValue}>
                  <Protocol name={protocol.name} showLogo={true} />
                </span>
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
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Estimated yield:</span>
                <span className={styles.lockDetailValue}>
                  {formatNumber(estimatedYield, asset.maxDecimalsShow || 6)} {asset.token} 
                  <span style={{ color: '#6b7280', marginLeft: '8px' }}>
                    (${formatNumber(estimatedYieldUsd, 2)})
                  </span>
                </span>
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