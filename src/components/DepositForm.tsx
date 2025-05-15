import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { calculateDailyYield, formatNumber } from '../utils/helpers';
import styles from './DepositForm.module.css';
import DepositModal from './DepositModal';
import { useChainId, useSwitchChain } from 'wagmi';

interface DepositFormProps {
  asset: Asset;
  yieldOption: YieldOption;
  onDeposit: ({ amount, dailyYield, yearlyYield }: { amount: string; dailyYield: string; yearlyYield: string }) => void;
  usdPrice: number;
  bestApyData?: {
    loading?: boolean;
  };
}

const DepositForm: React.FC<DepositFormProps> = ({
  asset,
  yieldOption,
  onDeposit,
  usdPrice,
}) => {
  const [amount, setAmount] = useState('0');
  const [percentage, setPercentage] = useState(0);
  const [dailyYieldUsd, setDailyYieldUsd] = useState('0');
  const [yearlyYieldUsd, setYearlyYieldUsd] = useState('0');
  const [activePercentage, setActivePercentage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { chains, switchChain,  } = useSwitchChain()
    const chainId = useChainId();
  // Calculate max amount based on asset balance
  const maxAmount = parseFloat(asset.balance);
  const amountUsd = (parseFloat(amount) * usdPrice).toFixed(2);
  
  // Update amount when slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPercentage(value);
    const calculatedAmount = (maxAmount * value / 100).toFixed(6);
    setAmount(calculatedAmount);
    setActivePercentage(null);
  };
  
  // Set predefined percentages
  const handleQuickPercentage = (percent: number) => {
    setPercentage(percent);
    setActivePercentage(percent);
    const calculatedAmount = (maxAmount * percent / 100).toFixed(6);
    setAmount(calculatedAmount);
  };
  
  // Handle deposit by showing modal
  const handleDeposit = () => {
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
    } else {
      setDailyYieldUsd('0');
      setYearlyYieldUsd('0');
    }
  }, [amount, yieldOption.apy, usdPrice]);
  return (
    <div className={styles['deposit-container']}>
      <div className={styles['deposit-form']}>
        <h2>Deposit to {yieldOption.protocol}</h2>
        
        <div className={styles['amount-display']}>
          <div>
            <span className={styles['amount-value']}>{formatNumber(parseFloat(amount), 6)}</span>
            <span className={styles['amount-token']}>{asset.token}</span>
          </div>
          <div className={styles['amount-usd']}>${amountUsd}</div>
        </div>
        
        <div className={styles['slider-container']}>
          <div className={styles['apy-badge']}>{yieldOption.apy.toFixed(2)}% APY</div>
          
          <div className={styles['slider-track']}>
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={handleSliderChange}
              className={styles['amount-slider']}
            />
            <div 
              className={styles['slider-progress']} 
              style={{ width: `${percentage}%` }}
            ></div>
            <div 
              className={styles['slider-thumb']}
              style={{ left: `${percentage}%` }}
            >
              <span className={styles['slider-percentage']}>{percentage}%</span>
            </div>
          </div>
          
          <div className={styles['percentage-buttons']}>
            <button 
              onClick={() => handleQuickPercentage(25)}
              className={activePercentage === 25 ? styles.active : ''}
            >25%</button>
            <button 
              onClick={() => handleQuickPercentage(50)}
              className={activePercentage === 50 ? styles.active : ''}
            >50%</button>
            <button 
              onClick={() => handleQuickPercentage(75)}
              className={activePercentage === 75 ? styles.active : ''}
            >75%</button>
            <button 
              onClick={() => handleQuickPercentage(100)}
              className={activePercentage === 100 ? styles.active : ''}
            >Max</button>
          </div>
        </div>
        
        <div className={styles['yield-preview']}>
          <div className={styles['usd-earnings-highlight']}>
            <div className={styles['usd-earnings-title']}>Expected Earnings</div>
            <div className={styles['usd-earnings-amount']}>${yearlyYieldUsd}</div>
            <div className={styles['usd-earnings-period']}>per year</div>
          </div>
        </div>
        
        {yieldOption.lockupDays > 0 && (
          <div className={styles['lockup-info-compact']}>
            <span className={styles['lockup-icon']}>🔒</span>
            <span>{yieldOption.lockupDays} day lockup period</span>
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
              disabled={parseFloat(amount) <= 0}
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