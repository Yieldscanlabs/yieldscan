import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { calculateDailyYield, formatNumber } from '../utils/helpers';
import { validateMinimumDeposit, getMinimumDepositErrorMessage } from '../utils/minimumDeposits';
import styles from './DepositForm.module.css';
import DepositModal from './DepositModal';
import ThumbSlider from './ThumbSlider';
import { useChainId, useSwitchChain } from 'wagmi';

interface DepositFormProps {
  asset: Asset;
  yieldOption: YieldOption;
  onDeposit: ({ amount, dailyYield, yearlyYield }: { amount: string; dailyYield: string; yearlyYield: string }) => void;
  usdPrice: number;
  bestApyData?: {
    loading?: boolean;
  };
  onBack?: () => void;
}

const DepositForm: React.FC<DepositFormProps> = ({
  asset,
  yieldOption,
  onDeposit,
  usdPrice,
  onBack,
}) => {
  const [amount, setAmount] = useState('0');
  const [percentage, setPercentage] = useState(0);
  const [dailyYieldUsd, setDailyYieldUsd] = useState('0');
  const [yearlyYieldUsd, setYearlyYieldUsd] = useState('0');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minimumDepositError, setMinimumDepositError] = useState<string | null>(null);
  const { chains, switchChain,  } = useSwitchChain()
    const chainId = useChainId();
  // Calculate max amount based on asset balance
  const maxAmount = parseFloat(asset.balance);
  const amountUsd = (parseFloat(amount) * usdPrice).toFixed(2);
  
  // Handle slider percentage change
  const handleSliderChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    const calculatedAmount = (maxAmount * newPercentage / 100).toFixed(6);
    setAmount(calculatedAmount);
  };
  
  // Handle deposit by showing modal
  const handleDeposit = () => {
    alert("OKs")
    setIsModalOpen(true);
  };
  
  // Handle modal completion
  const handleModalComplete = (success: boolean) => {
    setIsModalOpen(false);
    if (success) {
      onDeposit({ 
        amount, 
        dailyYield: dailyYieldUsd, 
        yearlyYield: yearlyYieldUsd 
      });
    }
  };
  
  useEffect(() => {
    // Calculate daily yield based on amount and APY
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum)) {
      const daily = calculateDailyYield(amountNum, yieldOption.apy);
      
      // Calculate USD values
      const dailyUsd = daily * usdPrice;
      setDailyYieldUsd(formatNumber(dailyUsd, 2));
      setYearlyYieldUsd(formatNumber(dailyUsd * 365, 2));
      
      // Validate minimum deposit
      const validation = validateMinimumDeposit(
        amountNum,
        asset.chainId,
        asset.address,
        yieldOption.protocol
      );
      
      if (!validation.isValid && validation.minimumRequired > 0) {
        setMinimumDepositError(
          getMinimumDepositErrorMessage(
            validation.minimumRequired,
            asset.token,
            yieldOption.protocol
          )
        );
      } else {
        setMinimumDepositError(null);
      }
    } else {
      setDailyYieldUsd('0');
      setYearlyYieldUsd('0');
      setMinimumDepositError(null);
    }
  }, [amount, yieldOption.apy, yieldOption.protocol, usdPrice, asset.chainId, asset.address, asset.token]);
  return (
    <div className={styles['deposit-container']}>
      <div className={styles['deposit-form']}>
        {onBack && (
          <div className={styles['back-button-container']}>
            <button 
              className={styles['back-button']}
              onClick={onBack}
            >
              &larr; 
            </button>
          </div>
        )}
        
        <h2>Deposit to {yieldOption.protocol}</h2>
        
        <div className={styles['amount-display']}>
          <div>
            <span className={styles['amount-value']}>{formatNumber(parseFloat(amount), asset.maxDecimalsShow)}</span>
            <span className={styles['amount-token']}>{asset.token}</span>
          </div>
          <div className={styles['amount-usd']}>${amountUsd}</div>
        </div>
        
        <ThumbSlider
          value={percentage}
          onChange={handleSliderChange}
          badge={<span>{yieldOption.apy.toFixed(2)}% APY</span>}
        />
        
        <div className={styles['yield-preview']}>
          <div className={styles['usd-earnings-highlight']}>
            <div className={styles['usd-earnings-title']}>Expected Earnings</div>
            <div className={styles['usd-earnings-amount']}>${yearlyYieldUsd}</div>
            <div className={styles['usd-earnings-period']}>per year</div>
          </div>
          
          <div className={styles['protocol-info']}>
            <div className={styles['info-tag']}>
              <span>Direct interaction with {yieldOption.protocol}</span>
            </div>
            
            {yieldOption.lockupDays > 0 && (
              <div className={styles['info-tag']}>
                <span className={styles['lock-icon']}>🔒</span>
                <span>{yieldOption.lockupDays} day lockup</span>
              </div>
            )}
            
            {(() => {
              const validation = validateMinimumDeposit(
                0, // Check if there's a minimum requirement (0 will show the minimum)
                asset.chainId,
                asset.address,
                yieldOption.protocol
              );
              return validation.minimumRequired > 0 ? (
                <div className={styles['info-tag']}>
                </div>
              ) : null;
            })()}
          </div>
        </div>

        {minimumDepositError && (
          <div className={styles['error-message']}>
            <span className={styles['error-icon']}></span>
            <span>{minimumDepositError}</span>
          </div>
        )}

        <div className={styles['action-buttons']}>
          {asset.chainId !== chainId ? (
            <button 
              className={styles['deposit-button']}
              onClick={() => switchChain({ chainId: asset.chainId })}
            >
              <span className={styles['button-icon']}>↺</span>
              Switch to {chains.find(chain => chain.id === asset.chainId)?.name || 'Correct Chain'}
            </button>
          ) : (
            <button 
              className={styles['deposit-button']}
              onClick={handleDeposit}
              disabled={parseFloat(amount) <= 0 || !!minimumDepositError}
            >
              <span className={styles['button-icon']}>↗</span>
              Deposit Now
            </button>
          )}
        </div>
      </div>
      
      <DepositModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleModalComplete}
        asset={asset}
        amount={amount}
        amountUsd={amountUsd}
        protocol={yieldOption.protocol}
        dailyYieldUsd={dailyYieldUsd}
        yearlyYieldUsd={yearlyYieldUsd}
      />
    </div>
  );
};

export default DepositForm;