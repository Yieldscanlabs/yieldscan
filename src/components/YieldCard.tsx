import React, { useState } from 'react';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import styles from '../pages/MyYieldsPage.module.css';
import tokens from '../utils/tokens';
import { getChainName } from '../utils/chains';
import { useApyStore } from '../store/apyStore';
import useUnifiedYield from '../hooks/useUnifiedYield';
import WithdrawModal from './WithdrawModal';
import { useChainId, useSwitchChain } from 'wagmi';
import Protocol from './Protocol';
import useWalletConnection from '../hooks/useWalletConnection';

interface YieldCardProps {
  asset: Asset;
  onOptimize?: () => void;
}

const YieldCard: React.FC<YieldCardProps> = ({ asset, onOptimize }) => {
  const { apyData } = useApyStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
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
  
  if (token) {
    console.log(asset.protocol)
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

  const chainName = getChainName(asset.chainId);
  
  return (
    <div className={styles.yieldCardSlim}>
      <div className={styles.cardTopSection}>
        <div className={styles.assetInfoSlim}>
          <img src={asset.icon} alt={asset.token} className={styles.assetIconSmall} />
          <div>
            <div className={styles.assetNameBold}>{asset.token}</div>
            <div className={styles.detailsRow}>
              <Protocol name={protocol} showLogo={true} className={styles.protocolBadge} />
              <span className={styles.chainBadge}>{chainName}</span>
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
      Withdraw on {new URL(asset.withdrawUri).hostname.replace('www.', '')}
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
    </div>
  );
};

export default YieldCard;