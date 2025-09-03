import { useState } from 'react';
import { useChainId, useSwitchChain } from 'wagmi';
import { useApyStore } from '../../store/apyStore';
import { useLockStore } from '../../store/lockStore';
import useUnifiedYield from '../../hooks/useUnifiedYield';
import useWalletConnection from '../../hooks/useWalletConnection';
import tokens from '../../utils/tokens';
import { PROTOCOL_NAMES } from '../../utils/constants';
import type { YieldCardProps, TokenWithLockYield } from './types';

export function useYieldCard({ asset, onOptimize, onLockAPY }: YieldCardProps) {
  const { apyData } = useApyStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isLockAPYModalOpen, setIsLockAPYModalOpen] = useState(false);
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

  // Check if token has maturity and protocol is Pendle
  const hasMaturity = token !== undefined && (token as unknown as TokenWithLockYield).maturity !== undefined;
  const isPendleProtocol = protocol.toLowerCase() === 'pendle';
  const showMaturity = hasMaturity && isPendleProtocol;
  const maturityDate = showMaturity ? (token as unknown as TokenWithLockYield).maturity : undefined;

  // Format maturity date for display if it exists
  const formattedMaturityDate = maturityDate ? new Date(maturityDate).toLocaleDateString() : '';

  // Calculate days until maturity
  const calculateDaysUntilMaturity = () => {
    if (!maturityDate) return 0;

    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0 ? 0 : diffDays;
  };

  const daysUntilMaturity = calculateDaysUntilMaturity();

  // if (token) {
  //   const tokenApyData = asset.protocol && token.underlyingAsset ? apyData[token.chainId]?.[token.underlyingAsset.toLowerCase()] : null;
  //   if (tokenApyData && asset.protocol) {
  //     protocol = asset.protocol;
  //     const protocolKey = protocol.toLowerCase() as keyof typeof tokenApyData;
  //     apy = tokenApyData[protocolKey] || 0;
  //   } else {
  //     // Fallback detection
  //     if (token.token.startsWith('a')) {
  //       protocol = PROTOCOL_NAMES.AAVE;
  //       apy = 3.2;
  //     } else if (token.token.startsWith('c')) {
  //       protocol = PROTOCOL_NAMES.COMPOUND;
  //       apy = 2.8;
  //     }
  //   }
  // }
  const tokenApyData = apyData[asset.chainId]?.[asset.address.toLowerCase()];
  let protocolKey: string | undefined;
  if (asset.protocol) {
    protocolKey = asset.protocol.toLowerCase();
    apy = tokenApyData[protocolKey as keyof typeof tokenApyData] || 0;
  } else {
    apy = 0;
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
  const balanceNum = parseFloat(asset.totalDeposited?.toString() || "0");
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

  return {
    // State
    isWithdrawModalOpen,
    isLockAPYModalOpen,
    isProcessingWithdrawal,
    isConfirming,
    isConfirmed,

    // Token and protocol info
    token,
    protocol,
    apy,
    hasLockYield,
    lockYieldDetails,
    showMaturity,
    maturityDate,
    formattedMaturityDate,
    daysUntilMaturity,
    isNativeToken,
    chainId,

    // Calculated values
    balanceNum,
    dailyYieldUsd,
    yearlyYieldUsd,

    // Event handlers
    openWithdrawModal,
    closeWithdrawModal,
    openLockAPYModal,
    closeLockAPYModal,
    handleLockAPYConfirm,
    handleWithdrawComplete,
    handleWithdraw
  };
} 