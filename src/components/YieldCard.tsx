import React, { useState } from 'react';
import { formatNumber } from '../utils/helpers';
import Protocol from './Protocol';
import WithdrawModal from './WithdrawModal';
import LockAPYModal from './LockAPYModal';
import styles from '../pages/MyYieldsPage.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import { getNetworkIcon } from '../utils/networkIcons';
import { PROTOCOL_NAMES } from '../utils/constants';
import type { Asset } from '../types';
import { useChainId, useSwitchChain } from 'wagmi';
import { useApyStore } from '../store/apyStore';
import { useLockStore } from '../store/lockStore';
import useUnifiedYield from '../hooks/useUnifiedYield';
import tokens from '../utils/tokens';

interface YieldCardProps {
  asset: Asset;
  onOptimize?: () => void;
  onLockAPY?: () => void;
}

// Type for the token with lockYield property
type TokenWithLockYield = {
  lockYield?: {
    expirationDate: string;
    protocol: {
      name: string;
      swap: boolean;
      ytAddress: string;
      ptAddress: string;
      swapAddress: string;
      ytDecimals: number;
      ptDecimals: number;
    };
  };
};

const YieldCard: React.FC<YieldCardProps> = ({ asset, onOptimize, onLockAPY }) => {
  const { apyData } = useApyStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLockAPYModalOpen, setIsLockAPYModalOpen] = useState(false);
  const [isProcessingLock, setIsProcessingLock] = useState(false);
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { wallet } = useWalletConnection();
  
  // Check if the token is native (address is '0x')
  const isNativeToken = asset.address === '0x';
  
  // Find token details and determine protocol info
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );
  // Get protocol and APY data
  let protocol = asset.protocol || '';
  let apy = 0;
  
  // Check if token has lockYield option
  const hasLockYield = token !== undefined && (token as unknown as TokenWithLockYield).lockYield !== undefined;
  
  // Get lockYield details if available
  const lockYieldDetails = hasLockYield ? (token as unknown as TokenWithLockYield).lockYield : undefined;
  
  if (token) {
    const tokenApyData = asset.protocol && token.underlyingAsset ? apyData[token.chainId]?.[token.underlyingAsset.toLowerCase()] : null;
    if (tokenApyData && asset.protocol) {
      protocol = asset.protocol;
      const protocolKey = protocol.toLowerCase() as keyof typeof tokenApyData;
      apy = tokenApyData[protocolKey] || 0;
    } else {
      // Fallback detection
      if (token.token.startsWith('a')) {
        protocol = PROTOCOL_NAMES.AAVE;
        apy = 3.2;
      } else if (token.token.startsWith('c')) {
        protocol = PROTOCOL_NAMES.COMPOUND;
        apy = 2.8;
      }
    }
  }
  
  // Initialize useUnifiedYield hook
  const {
    withdraw,
    isWithdrawing: isProcessingWithdrawal,
    isConfirming,
    isConfirmed,
    withdrawETH
  } = useUnifiedYield({
    protocol: asset.protocol as any,
    contractAddress: (token?.withdrawContract as `0x${string}`) || '0x',
    tokenAddress: token?.underlyingAsset as `0x${string}`,
    tokenDecimals: asset.decimals || 18,
    chainId: asset.chainId,
  });

  // Calculate yields
  const balanceNum = parseFloat(asset.balance);
  const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
  const dailyYieldUsd = (balanceNum * (apy / 100) / 365) * usdPrice;
  const yearlyYieldUsd = dailyYieldUsd * 365;
  
  // Open withdraw modal
  const openWithdrawModal = async () => {
    // Check if we're on the correct network before opening the modal
    if (chainId !== asset.chainId) {
      // If not on the correct network, switch to it first
      try {
        await switchChain({ chainId: asset.chainId });
        // Once switched, open the modal
        setIsWithdrawModalOpen(true);
      } catch (error) {
        console.error('Failed to switch networks:', error);
        // Could add user notification here
      }
    } else {
      // Already on correct network, just open the modal
      setIsWithdrawModalOpen(true);
    }
  };
  
  // Close withdraw modal
  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
  };
  
  // Open lock APY modal
  const openLockAPYModal = async () => {
    // Check if we're on the correct network before opening the modal
    if (chainId !== asset.chainId) {
      // If not on the correct network, switch to it first
      try {
        await switchChain({ chainId: asset.chainId });
        // Once switched, open the modal
        setIsLockAPYModalOpen(true);
      } catch (error) {
        console.error('Failed to switch networks:', error);
        // Could add user notification here
      }
    } else {
      // Already on correct network, just open the modal
      setIsLockAPYModalOpen(true);
    }
  };
  
  // Close lock APY modal
  const closeLockAPYModal = () => {
    setIsLockAPYModalOpen(false);
  };
  
  // Open the transaction modal using global store
  const handleLockAPYConfirm = async () => {
    // Close the explanation modal
    setIsLockAPYModalOpen(false);
    
    if (lockYieldDetails) {
      // Use the global lock store to open the modal
      useLockStore.getState().openModal({
        asset,
        protocol: lockYieldDetails.protocol.name,
        expirationDate: lockYieldDetails.expirationDate,
        lockDetails: lockYieldDetails.protocol,
        onLock: () => {
          if (onLockAPY) {
            onLockAPY();
          }
        }
      });
    }
  };
  
  // Handle withdraw modal completion
  const handleWithdrawComplete = (success: boolean) => {
    if (success) {
      // Handle successful withdrawal
      // In a real app, you might want to refresh the asset data
    }
    setIsWithdrawModalOpen(false);
  };
  
  // Handle withdraw action
  const handleWithdraw = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return false;
    
    try {
      let success = false;
      
      // For Aave protocol and native ETH, use the special withdrawETH function
      if (isNativeToken && asset.protocol === PROTOCOL_NAMES.AAVE) {
        // Use wallet.address as the recipient for the withdrawn ETH
        success = await withdrawETH(amount, wallet.address as `0x${string}`);
      } else {
        // For all other tokens/protocols, use the regular withdraw function
        success = await withdraw(amount);
      }
      
      return success;
    } catch (error) {
      console.error('Error during withdrawal:', error);
      return false;
    }
  };

  // Get chain icon for overlay
  const chainIcon = getNetworkIcon(asset.chainId);
  
  return (
    <div className={styles.yieldCardSlim}>
      <div className={styles.cardTopSection}>
        <div className={styles.assetInfoSlim}>
          <div className={styles.assetIconWrapper}>
            <img src={asset.icon} alt={asset.token} className={styles.assetIconSmall} />
            <img src={chainIcon} alt="Chain" className={styles.chainIconOverlay} />
          </div>
          <div>
            <div className={styles.assetNameBold}>{asset.token}</div>
            <div className={styles.detailsRow}>
              <Protocol name={protocol} showLogo={true} className={styles.protocolBadge} />
            </div>
          </div>
        </div>
        
        <div className={styles.apyBadge}>
          <span className={styles.apyValue}>{apy.toFixed(2)}%</span>
          <span className={styles.apyLabel}>APY</span>
        </div>
      </div>
      
      <div className={styles.cardMiddleSection}>
        <div className={styles.balanceColumn}>
          <div className={styles.balanceAmount}>
            {formatNumber(balanceNum, asset.maxDecimalsShow)} {asset.token}
          </div>
          <div className={styles.balanceUsd}>${formatNumber(parseFloat(asset.balanceUsd), 2)}</div>
        </div>
        
        <div className={styles.yieldsColumn}>
          <div className={styles.yieldRow}>
            <span>Daily:</span> <span>${formatNumber(dailyYieldUsd, 2)}</span>
          </div>
          <div className={styles.yieldRow}>
            <span>Yearly:</span> <span className={styles.yearlyYield}>${formatNumber(yearlyYieldUsd, 2)}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.cardActionRow}>
        {asset.withdrawUri ? (
          <a 
            href={asset.withdrawUri} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.actionButton}
          >
            <span className={styles.buttonIcon}>↗</span> 
            Withdraw
          </a>
        ) : (
          <button className={styles.actionButton} onClick={openWithdrawModal}>
            <span className={styles.buttonIcon}>↓</span> 
            {chainId !== asset.chainId 
              ? `Withdraw`
              : 'Withdraw'
            }
          </button>
        )}
        
        {onOptimize && (
          <button className={styles.actionButtonAccent} onClick={onOptimize}>
            <span className={styles.buttonIcon}>↗</span> Optimize
          </button>
        )}

        {hasLockYield && (
          <button className={styles.actionButtonAccent} onClick={openLockAPYModal}>
            <span className={styles.buttonIcon}>🔒</span> Lock APY
          </button>
        )}
      </div>
      
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        onComplete={handleWithdrawComplete}
        asset={asset}
        protocol={protocol}
        balance={balanceNum}
        maxDecimals={asset.maxDecimalsShow || 6}
        onWithdraw={handleWithdraw}
        isProcessing={isProcessingWithdrawal}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        isNativeToken={isNativeToken}
      />
      
      {lockYieldDetails && (
        <LockAPYModal
          isOpen={isLockAPYModalOpen}
          onClose={closeLockAPYModal}
          onConfirm={handleLockAPYConfirm}
          asset={asset}
          protocol={lockYieldDetails.protocol}
          expirationDate={lockYieldDetails.expirationDate}
        />
      )}
    </div>
  );
};

export default YieldCard;