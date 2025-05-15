import React, { useState } from 'react';
import { formatNumber } from '../utils/helpers';
import type { Asset } from '../types';
import { PROTOCOL_NAMES } from '../utils/constants';
import styles from '../pages/MyYieldsPage.module.css';
import tokens from '../utils/tokens';
import { getChainName } from '../utils/chains';
import { useApyStore } from '../store/apyStore';
import useUnifiedYield from '../hooks/useUnifiedYield';

interface YieldCardProps {
  asset: Asset;
  onOptimize?: () => void;
}

const YieldCard: React.FC<YieldCardProps> = ({ asset, onOptimize }) => {
  const { apyData, isLoading: apyLoading, error: apyError } = useApyStore();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  
  // Find the token details
  const token = tokens.find(
    t => t.address.toLowerCase() === asset.address.toLowerCase() && t.chainId === asset.chainId
  );
  
  // Determine which protocol this yield-bearing token belongs to
  let protocol = '';
  let apy = 0;
  
  // Use the apyData from the store instead of hardcoded values
  if (token) {
    const tokenApyData = asset.protocol && token.underlyingAsset ? apyData[token.chainId]?.[token.underlyingAsset.toLowerCase()]: null;
    console.log('Token APY Data:', tokenApyData, asset, apyData);
    if (tokenApyData && asset.protocol) {
      protocol = asset.protocol || '';
      const protocolKey = protocol.toLowerCase() as keyof typeof tokenApyData;
      apy = tokenApyData[protocolKey] || 0;
    } else {
      // Fallback to basic detection if APY data is not available
      if (token.token.startsWith('a')) {
        protocol = PROTOCOL_NAMES.AAVE;
        apy = 3.2; // Fallback APY
      } else if (token.token.startsWith('c')) {
        protocol = PROTOCOL_NAMES.COMPOUND;
        apy = 2.8; // Fallback APY
      }
    }
  }
  
  // Initialize useUnifiedYield hook for withdrawing
  const {
    withdraw,
    isWithdrawing: isProcessingWithdrawal,
    isConfirming,
    isConfirmed,
  } = useUnifiedYield({
    protocol: asset.protocol as any,
    contractAddress: (token?.withdrawContract as `0x${string}`) || '0x', // Ensure withdrawContract matches the Address type
    tokenAddress: token?.underlyingAsset as `0x${string}`,
    tokenDecimals: asset.decimals || 18,
    chainId: asset.chainId,
  });

  // Get chain name
  const chainName = getChainName(asset.chainId);
  
  // Calculate yield
  const balanceNum = parseFloat(asset.balance);
  const usdPrice = parseFloat(asset.balanceUsd) / balanceNum;
  const dailyYield = (balanceNum * (apy / 100)) / 365;
  const dailyYieldUsd = dailyYield * usdPrice;
  const yearlyYieldUsd = dailyYieldUsd * 365;
  
  // Handle withdraw button click
  const handleWithdrawClick = () => {
    setShowWithdrawInput(!showWithdrawInput);
  };

  // Handle withdraw submission
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    setIsWithdrawing(true);
    try {
      const success = await withdraw(withdrawAmount);
      if (success) {
        // Show success message or update UI
        console.log(`Successfully initiated withdrawal of ${withdrawAmount} ${asset.token}`);
        // Reset the input field after successful transaction
        setWithdrawAmount('');
        setShowWithdrawInput(false);
      } else {
        console.error('Withdrawal failed');
      }
    } catch (error) {
      console.error('Error during withdrawal:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  return (
    <div className={styles.yieldCard}>
      <div className={styles.assetHeader}>
        <div className={styles.assetInfo}>
          <img src={asset.icon} alt={asset.token} className={styles.assetIcon} />
          <div>
            <div className={styles.assetName}>{asset.token}</div>
            <div className={styles.assetDetails}>
              <span className={styles.assetProtocol}>{protocol}</span>
              <span className={styles.assetChain}>{chainName}</span>
            </div>
          </div>
        </div>
        <div className={styles.assetApy}>
          <div className={styles.apyValue}>{apy.toFixed(2)}%</div>
          <div className={styles.apyLabel}>APY</div>
        </div>
      </div>
      
      <div className={styles.assetBalances}>
        <div className={styles.balanceDetail}>
          <div className={styles.balanceLabel}>Balance</div>
          <div className={styles.balanceValue}>
            {formatNumber(balanceNum, asset.maxDecimalsShow)} {asset.token}
          </div>
          <div className={styles.balanceUsd}>${formatNumber(parseFloat(asset.balanceUsd), 2)}</div>
        </div>
      </div>
      
      <div className={styles.yieldDetails}>
        <div className={styles.yieldDetail}>
          <div className={styles.yieldLabel}>Daily Yield</div>
          <div className={styles.yieldValue}>${formatNumber(dailyYieldUsd, 2)}</div>
        </div>
        <div className={styles.yieldDetail}>
          <div className={styles.yieldLabel}>Yearly Yield</div>
          <div className={styles.yieldValue}>${formatNumber(yearlyYieldUsd, 2)}</div>
        </div>
      </div>
      
      <div className={styles.cardActions}>
        {showWithdrawInput ? (
          <div className={styles.withdrawInputContainer}>
            <input
              type="number"
              placeholder={`Amount (max: ${balanceNum})`}
              className={styles.withdrawInput}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={isWithdrawing || isProcessingWithdrawal || isConfirming}
            />
            <div className={styles.withdrawButtonGroup}>
              <button 
                className={styles.withdrawConfirmButton}
                onClick={handleWithdraw}
                disabled={isWithdrawing || isProcessingWithdrawal || isConfirming}
              >
                {isWithdrawing || isProcessingWithdrawal || isConfirming ? 'Processing...' : 'Confirm'}
              </button>
              <button 
                className={styles.withdrawCancelButton}
                onClick={() => {
                  setShowWithdrawInput(false);
                  setWithdrawAmount('');
                }}
                disabled={isWithdrawing || isProcessingWithdrawal || isConfirming}
              >
                Cancel
              </button>
            </div>
            {isConfirmed && <div className={styles.successMessage}>Withdrawal successful!</div>}
          </div>
        ) : (
          <button 
            className={styles.withdrawButton} 
            onClick={handleWithdrawClick}
          >
            Withdraw
          </button>
        )}
        
        {onOptimize && (
          <button 
            className={styles.optimizeButton} 
            onClick={onOptimize}
          >
            Optimize Yield
          </button>
        )}
      </div>
    </div>
  );
};

export default YieldCard;