import React from 'react';
import styles from '../pages/MyYieldsPage.module.css';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import type { OptimizationData } from './YieldCard/types';
import { getNetworkIcon, getNetworkName } from '../utils/networkIcons';
import Protocol from './Protocol';
import { useAccount, useSwitchChain } from 'wagmi';
import { API_BASE_URL } from '../utils/constants';

interface OptimizeInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  asset: Asset;
  optimizationData: OptimizationData;
}

const OptimizeInformationModal: React.FC<OptimizeInformationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  asset,
  optimizationData
}) => {
  const { chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  if (!isOpen) return null;
  console.log('OptimizationModal render', { asset });

  const onOptimize = async () => {
    if (asset.chainId !== chainId) {
      await switchChainAsync({ chainId: asset.chainId })
    }
    onConfirm()
  }

  // Get the chain icon for the asset
  const chainIcon = getNetworkIcon(asset.chainId);
  const chainName = getNetworkName(asset.chainId);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Optimize {asset.token} Yield</h2>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.modalSection}>
            <div className={styles.assetInfoLarge}>
              <div className={styles.assetIconWrapperLarge}>
                <img src={API_BASE_URL+ asset.icon} alt={asset.token} className={styles.assetIconMedium} />
                <img src={chainIcon} alt={chainName} className={styles.chainIconOverlayLarge} />
              </div>
              <div>
                <div className={styles.assetNameBold}>{asset.token}</div>
                <div className={styles.protocolRow}>
                  <Protocol name={optimizationData.currentProtocol} showLogo={true} />
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
              <p>
                Your {asset.token} will be automatically moved to a better yield opportunity:
              </p>
              <p>
                <strong>1.</strong> Withdraw from {optimizationData.currentProtocol} ({optimizationData.currentApy.toFixed(2)}% APY)
              </p>
              <p>
                <strong>2.</strong> Approve and deposit into {optimizationData.betterProtocol} ({optimizationData.betterApy.toFixed(2)}% APY)
              </p>
              <p>
                This optimization will increase your annual yield by <strong>+{optimizationData.apyImprovement.toFixed(2)}%</strong>, earning you an additional <strong>${formatNumber(optimizationData.additionalYearlyUsd, 2)}</strong> per year.
              </p>
            </div>

            <div className={styles.lockDetailsBox}>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Current Protocol:</span>
                <span className={styles.lockDetailValue}>
                  <Protocol name={optimizationData.currentProtocol} showLogo={true} size="small" />
                  {optimizationData.currentApy.toFixed(2)}% APY
                </span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Better Protocol:</span>
                <span className={styles.lockDetailValue}>
                  <Protocol name={optimizationData.betterProtocol} showLogo={true} size="small" />
                  {optimizationData.betterApy.toFixed(2)}% APY
                </span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>APY Improvement:</span>
                <span className={styles.lockDetailValue} style={{ color: 'var(--success-color)', fontWeight: '700' }}>
                  +{optimizationData.apyImprovement.toFixed(2)}%
                </span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Additional Yearly:</span>
                <span className={styles.lockDetailValue} style={{ color: 'var(--success-color)', fontWeight: '700' }}>
                  +${formatNumber(optimizationData.additionalYearlyUsd, 2)}
                </span>
              </div>
              <div className={styles.lockDetailRow}>
                <span className={styles.lockDetailLabel}>Network:</span>
                <span className={styles.lockDetailValue}>
                  <img src={chainIcon} alt={chainName} className={styles.chainIconTiny} />
                  {chainName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooterCentered}>
          <button
            className={styles.optimizeButton}
            onClick={onOptimize}
          >
            Optimize
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizeInformationModal; 