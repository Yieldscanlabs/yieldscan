import React, { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';
import { calculateDailyYield, formatNumber } from '../utils/helpers';

interface DepositFormProps {
  asset: Asset;
  yieldOption: YieldOption;
  onDeposit: (amount: string) => void;
  usdPrice: number;
}

const DepositForm: React.FC<DepositFormProps> = ({
  asset,
  yieldOption,
  onDeposit,
  usdPrice
}) => {
  const [amount, setAmount] = useState('0');
  const [percentage, setPercentage] = useState(0);
  const [dailyYieldUsd, setDailyYieldUsd] = useState('0');
  const [yearlyYieldUsd, setYearlyYieldUsd] = useState('0');
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false); // Fixed initial state to false
  const [showSuccess, setShowSuccess] = useState(false);
  const [activePercentage, setActivePercentage] = useState<number | null>(null);
  
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
  
  // Handle token approval with loading state
  const handleApprove = () => {
    setIsApproving(true);
    // Simulate approval transaction
    setTimeout(() => {
      setIsApproved(true);
      setIsApproving(false);
    }, 2000);
  };
  
  // Handle deposit with loading and success states
  const handleDeposit = () => {
    setIsDepositing(true);
    // Simulate deposit transaction
    setTimeout(() => {
      setIsDepositing(false);
      setShowSuccess(true);
      // Call the parent's onDeposit callback
      onDeposit(amount);
    }, 2500);
  };
  
  // Handle return to assets
  const handleReturnToAssets = () => {
    // This function will be called by the success screen's "Return to Assets" button
    window.location.reload(); // Simple reload for demo
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
  
  if (showSuccess) {
    return (
      <div className="deposit-success">
        <div className="success-icon">
          <div className="success-icon-inner">✓</div>
        </div>
        <h2 className="success-title success-animation">Deposit Successful!</h2>
        <p className="success-message success-animation">
          Your {asset.token} has been successfully deposited to {yieldOption.protocol} and is now generating yield.
        </p>
        
        <div className="deposit-details success-animation">
          <div className="deposit-detail-row">
            <span className="deposit-detail-label">Amount Deposited</span>
            <span className="deposit-detail-value">{formatNumber(parseFloat(amount), 6)} {asset.token}</span>
          </div>
          <div className="deposit-detail-row">
            <span className="deposit-detail-label">USD Value</span>
            <span className="deposit-detail-value">${amountUsd}</span>
          </div>
          <div className="deposit-detail-row">
            <span className="deposit-detail-label">Expected Daily Earnings</span>
            <span className="deposit-detail-value">${dailyYieldUsd}</span>
          </div>
          <div className="deposit-detail-row">
            <span className="deposit-detail-label">Expected Yearly Earnings</span>
            <span className="deposit-detail-value">${yearlyYieldUsd}</span>
          </div>
        </div>
        
        <button className="return-button success-animation" onClick={handleReturnToAssets}>
          Return to Assets
        </button>
      </div>
    );
  }
  
  return (
    <div className="deposit-form">
      <h2>Deposit to {yieldOption.protocol}</h2>
      
      <div className="amount-display">
        <div>
          <span className="amount-value">{formatNumber(parseFloat(amount), 6)}</span>
          <span className="amount-token">{asset.token}</span>
        </div>
        <div className="amount-usd">${amountUsd}</div>
      </div>
      
      <div className="slider-container">
        <div className="apy-badge">{yieldOption.apy}% APY</div>
        
        <div className="slider-track">
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={handleSliderChange}
            className="amount-slider"
            disabled={isApproving || isDepositing}
          />
          <div 
            className="slider-progress" 
            style={{ width: `${percentage}%` }}
          ></div>
          <div 
            className="slider-thumb"
            style={{ left: `${percentage}%` }}
          >
            <span className="slider-percentage">{percentage}%</span>
          </div>
        </div>
        
        <div className="percentage-buttons">
          <button 
            onClick={() => handleQuickPercentage(25)}
            className={activePercentage === 25 ? 'active' : ''}
            disabled={isApproving || isDepositing}
          >25%</button>
          <button 
            onClick={() => handleQuickPercentage(50)}
            className={activePercentage === 50 ? 'active' : ''}
            disabled={isApproving || isDepositing}
          >50%</button>
          <button 
            onClick={() => handleQuickPercentage(75)}
            className={activePercentage === 75 ? 'active' : ''}
            disabled={isApproving || isDepositing}
          >75%</button>
          <button 
            onClick={() => handleQuickPercentage(100)}
            className={activePercentage === 100 ? 'active' : ''}
            disabled={isApproving || isDepositing}
          >Max</button>
        </div>
      </div>
      
      <div className="yield-preview">
        <div className="usd-earnings-highlight">
          <div className="usd-earnings-title">Expected Earnings</div>
          <div className="usd-earnings-amount">${yearlyYieldUsd}</div>
          <div className="usd-earnings-period">per year</div>
        </div>
      </div>
      
      {yieldOption.lockupDays > 0 && (
        <div className="lockup-info-compact">
          <span className="lockup-icon">🔒</span>
          <span>{yieldOption.lockupDays} day lockup period</span>
        </div>
      )}
      
      
      <div className={`action-buttons ${isApproved ? 'is-approved' : 'not-approved'}`}>
        <button 
          className={`approve-button ${isApproving ? 'loading' : ''}`}
          onClick={handleApprove}
          disabled={parseFloat(amount) <= 0 || isApproving}
        >
          <span className="button-icon">✓</span>
          Approve {asset.token}
        </button>
        
        <button 
          className={`deposit-button ${isDepositing ? 'loading' : ''}`}
          onClick={handleDeposit}
          disabled={parseFloat(amount) <= 0 || isDepositing}
        >
          <span className="button-icon">↗</span>
          Deposit Now
        </button>
      </div>
    </div>
  );
};

export default DepositForm;