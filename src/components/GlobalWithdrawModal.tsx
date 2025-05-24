import React, { useState } from 'react';
import WithdrawModal from './WithdrawModal';
import { useWithdrawModalStore } from '../store/withdrawModalStore';

const GlobalWithdrawModal: React.FC = () => {
  const {
    isOpen,
    asset,
    protocol,
    balance,
    maxDecimals,
    isNativeToken,
    onWithdraw,
    onComplete,
    closeModal
  } = useWithdrawModalStore();

  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleWithdraw = async (amount: string) => {
    if (!onWithdraw) return false;
    
    try {
      setIsProcessingWithdrawal(true);
      setIsConfirming(true);
      
      const success = await onWithdraw(amount);
      
      if (success) {
        setIsConfirmed(true);
        setIsConfirming(false);
        
        // Close modal after a short delay to show success state
        setTimeout(() => {
          setIsProcessingWithdrawal(false);
          setIsConfirmed(false);
          closeModal();
          if (onComplete) {
            onComplete();
          }
        }, 2000);
      } else {
        setIsProcessingWithdrawal(false);
        setIsConfirming(false);
      }
      
      return success;
    } catch (error) {
      console.error('Withdraw failed:', error);
      setIsProcessingWithdrawal(false);
      setIsConfirming(false);
      setIsConfirmed(false);
      return false;
    }
  };

  const handleClose = () => {
    // Reset states when closing
    setIsProcessingWithdrawal(false);
    setIsConfirming(false);
    setIsConfirmed(false);
    closeModal();
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    closeModal();
  };

  if (!asset) return null;

  return (
    <WithdrawModal
      isOpen={isOpen}
      onClose={handleClose}
      onComplete={handleComplete}
      asset={asset}
      protocol={protocol}
      balance={balance}
      maxDecimals={maxDecimals}
      onWithdraw={handleWithdraw}
      isProcessing={isProcessingWithdrawal}
      isConfirming={isConfirming}
      isConfirmed={isConfirmed}
      isNativeToken={isNativeToken}
    />
  );
};

export default GlobalWithdrawModal; 