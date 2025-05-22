import axios from 'axios';
import { useState, useEffect } from 'react';
import { parseUnits, type Address } from 'viem';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useSendTransaction } from 'wagmi';
import { safeApprove, getTokenAllowance } from '../utils/erc20Utils';
import type { Asset } from '../types';
import { useAssetStore } from '../store/assetStore';
import { useLockStore } from '../store/lockStore';

const HOSTED_SDK_URL = 'https://api-v2.pendle.finance/core';

interface LockDetails {
  name: string;
  swap: boolean;
  ytAddress: string;
  ptAddress: string;
  swapAddress: string;
  ytMarketAddress: string;
  ytDecimals: number;
  ptDecimals: number;
}

interface UseUnifiedLockProps {
  protocol: string;
  lockDetails: LockDetails;
  asset: Asset;
  expirationDate: string;
}

interface MintPyData {
  amountOut: string;
  priceImpact: string;
}

interface SwapData {
  amountOut: string;
  priceImpact: string;
}

type MethodReturnType<Data> = {
  tx: {
    data: string;
    to: string;
    value: string;
  };
  data: Data;
};

/**
 * Call Pendle SDK API endpoints
 */
async function callSDK<Data>(path: string, params: Record<string, any> = {}) {
  const response = await axios.get<MethodReturnType<Data>>(HOSTED_SDK_URL + path, {
    params
  });
  return response.data;
}

/**
 * Check if an error is a user transaction rejection
 */
function isUserRejection(error: any): boolean {
  if (!error) return false;
  
  // Get the error message as a string
  const errorMessage = (error.message || error.toString()).toLowerCase();
  
  // Check for common wallet rejection patterns
  return (
    errorMessage.includes('user rejected') || 
    errorMessage.includes('user denied') || 
    errorMessage.includes('user cancelled') ||
    errorMessage.includes('rejected by user') ||
    errorMessage.includes('transaction was rejected') ||
    errorMessage.includes('rejected transaction') ||
    errorMessage.includes('user declined')
  );
}

/**
 * A hook for handling lock operations for different yield-bearing protocols
 * This is a placeholder implementation with simulated steps
 */
export default function useUnifiedLock({
  protocol,
  lockDetails,
  asset,
  expirationDate
}: UseUnifiedLockProps) {
  // Get wallet and chain information using wagmi
  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const isPendle = protocol.toLowerCase() === 'pendle';

  // Get ytAmountOut from the store
  const { ytAmountOut, setYtAmountOut, resetYtAmountOut } = useLockStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLocking, setIsLocking] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [ptAmountOut, setPtAmountOut] = useState<string | undefined>();
  const [swappedTokenAmount, setSwappedTokenAmount] = useState<string>('0');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [isApproving, setIsApproving] = useState(false);
  
  // Transaction receipt for last transaction
  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Update isConfirming and isConfirmed based on transaction status
  
  // Determine total steps based on protocol
  const totalSteps = isPendle ? 4 : 2;
  


  const mintPyFromSy = async (amount: string): Promise<string | undefined> => {
    try {
      if (!address) {
        throw new Error('No wallet connected');
      }
      
      // Convert amount to proper decimals format (bigint)
      const amountInWei = parseUnits(amount, asset.decimals).toString();
      
      // Call Pendle SDK to get transaction data
      const res = await callSDK<MintPyData>(`/v1/sdk/${chainId}/mint`, {
        receiver: address,
        yt: lockDetails.ytAddress,
        slippage: 0.01, // 1% slippage
        tokenIn: asset.address,
        amountIn: amountInWei, // Now using the proper bigint format
      });
      
      console.log('Mint response:', res);
      
      // Store ytAmountOut in the global store instead of local state
      setYtAmountOut(res.data.amountOut);
      setPtAmountOut(res.data.amountOut); 
      
      // Send transaction using sendTransaction hook which supports raw transactions
      try {
        const hash = await sendTransactionAsync({
          to: res.tx.to as `0x${string}`,
          data: res.tx.data as `0x${string}`,
          value: res.tx.value ? BigInt(res.tx.value) : undefined,
        });
        
        setTxHash(hash);
        return res.data.amountOut;
      } catch (txError) {
        console.error('Transaction submission error:', txError);
        
        // Check if user rejected the transaction
        if (isUserRejection(txError)) {
          // Propagate this specific error upward so it can be handled properly
          throw txError;
        }
        
        return undefined;
      }
    } catch (error) {
      console.error('Error in mintPyFromSy:', error);
      
      // Re-throw user rejection errors so they propagate up
      if (isUserRejection(error)) {
        throw error;
      }
      
      return undefined;
    }
  };
  
  /**
   * Swap YT tokens for the underlying token
   */
  const swapYtToToken = async (ytAmount: string): Promise<boolean> => {
    try {
      if (!address) {
        throw new Error('No wallet connected');
      }
      
      // Convert amount to proper decimals format (bigint)
      const amountInWei = ytAmount;
      console.log("YT amount to swap:", amountInWei, lockDetails.ytDecimals);
      
      // Call Pendle SDK to get transaction data for the swap
      const marketAddress = lockDetails.ytMarketAddress;
      const res = await callSDK<SwapData>(`/v1/sdk/${chainId}/markets/${marketAddress}/swap`, {
        receiver: address,
        slippage: 0.01, // 1% slippage
        tokenIn: lockDetails.ytAddress,
        tokenOut: asset.address, // Swapping back to the original asset
        amountIn: amountInWei,
      });
      
      console.log("Swap response:", res);
      console.log("Amount out:", res.data.amountOut);
      console.log("Price impact:", res.data.priceImpact);
      
      // Store the amount of tokens received from the swap
      setSwappedTokenAmount(res.data.amountOut);
      
      // Send transaction using sendTransaction hook
      try {
        const hash = await sendTransactionAsync({
          to: res.tx.to as `0x${string}`,
          data: res.tx.data as `0x${string}`,
          value: res.tx.value ? BigInt(res.tx.value) : undefined,
        });
        
        setTxHash(hash);
        return true;
      } catch (txError) {
        console.error('Transaction submission error:', txError);
        
        // Check if user rejected the transaction
        if (isUserRejection(txError)) {
          // Propagate this specific error upward so it can be handled properly
          throw txError;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error in swapYtToToken:', error);
      
      // Re-throw user rejection errors so they propagate up
      if (isUserRejection(error)) {
        throw error;
      }
      
      return false;
    }
  };
  
  /**
   * Lock the yield until the expiration date
   * Each protocol may have different implementations
   */
  const lock = async (amount: string): Promise<boolean> => {
    try {
      // Reset the confirmed state at the start of the process
      setIsConfirmed(false);
      
      // Simulate a protocol-specific flow
      if (isPendle) {
        // Pendle flow: approve > mint yt from sy > approve yt > sell yt
        
        // Step 1: Check if approval is needed, then approve the underlying token for swap
        setCurrentStep(1);
        
        setIsApproving(true);
        try {
          const allowance = await getTokenAllowance(
            asset.address as Address,
            address as Address,
            lockDetails.swapAddress as Address
          );
          if(allowance < parseUnits(amount, asset.decimals)) {
          const hash = await safeApprove(
            asset.address as Address, 
            lockDetails.swapAddress as Address,
            amount,
            asset.decimals,
            writeContractAsync
          );
          if (!hash) {
            setIsApproving(false);
            return false;
          }
          setTxHash(hash);
          
          // Wait for confirmation
          await new Promise(resolve => {
            const checkConfirmation = () => {
              if (isTxConfirmed) {
                resolve(true);
              } else {
                setTimeout(checkConfirmation, 1000);
              }
            };
            checkConfirmation();
          });
        } 
        } catch (error) {
          console.error('Error in asset approval:', error);
          setIsApproving(false);
          
          // Propagate user rejection errors
          if (isUserRejection(error)) {
            throw error;
          }
          
          return false;
        }
        setIsApproving(false);
        
        // Step 2: Swap the underlying token for PT/YT
        setIsSwapping(true);
        setCurrentStep(2);
        
        // Use Pendle SDK to mint PT/YT tokens
        try {
          // Use actual mint function instead of hardcoded value
          console.log(ytAmountOut,'ytAmountOut from store')
          // Use the ytAmountOut from the store if available, otherwise mint new tokens
          const ytAmount = ytAmountOut ? ytAmountOut : await mintPyFromSy(amount);
          if(ytAmount) setYtAmountOut(ytAmount)
          if (!ytAmount) {
            setIsSwapping(false);
            return false;
          }
          
          setIsSwapping(false);
          
          // Step 3: Approve YT for selling to market
          setCurrentStep(3);
          
          // Always approve YT tokens - don't rely on checking allowance as it might not be loaded yet
          setIsApproving(true);
          const ytAllowance = await getTokenAllowance(
            lockDetails.ytAddress as Address,
            address as Address,
            lockDetails.ytMarketAddress as Address
          );
          if(parseUnits(ytAllowance.toString(), lockDetails.ytDecimals) < parseUnits(ytAmount, lockDetails.ytDecimals)) {
          
            const hash = await safeApprove(
              lockDetails.ytAddress as Address,
              lockDetails.ytMarketAddress as Address,
              ytAmount,
              lockDetails.ytDecimals,
              writeContractAsync
            );
            if (!hash) {
              setIsApproving(false);
              return false;
            }
            setTxHash(hash);
            
            // Wait for confirmation
           
          }
          setIsApproving(false);
          
          // Step 4: Sell YT to lock in yield
          setIsSwapping(true);
          setCurrentStep(4);
          // Use the swapYtToToken function to sell YT tokens
          const swapResult = await swapYtToToken(ytAmount);
          if (!swapResult) {
            setIsSwapping(false);
            return false;
          }
          
          // Wait for the swap transaction to confirm
          
          setIsSwapping(false);
          
          // Only set the confirmed state after all steps are complete
          setIsConfirming(true);
          await simulateDelay(1000);
          setIsConfirming(false);
          setIsConfirmed(true);
          
          // Clear the ytAmountOut from the store after successful completion
          resetYtAmountOut();
          
        } catch (error) {
          console.error('Error in Pendle flow:', error);
          setIsSwapping(false);
          setIsApproving(false);
          
          if (isUserRejection(error)) {
            throw error;
          }
          
          return false;
        }
      } else {
        // Generic flow: approve > lock
        try {
          // Step 1: Check if approval is needed
          setCurrentStep(1);
          
          setIsApproving(true);
          try {
            const allowance = await getTokenAllowance(
              asset.address as Address,
              address as Address,
              lockDetails.swapAddress as Address
            );
            if(allowance < parseUnits(amount, asset.decimals)) {
              const hash = await safeApprove(
                asset.address as Address, 
                lockDetails.swapAddress as Address,
                amount,
                asset.decimals,
                writeContractAsync
              );
              if (!hash) {
                setIsApproving(false);
                return false;
              }
              setTxHash(hash);
              
              // Wait for confirmation
              await new Promise(resolve => {
                const checkConfirmation = () => {
                  if (isTxConfirmed) {
                    resolve(true);
                  } else {
                    setTimeout(checkConfirmation, 1000);
                  }
                };
                checkConfirmation();
              });
            }
          } catch (error) {
            console.error('Error in asset approval:', error);
            setIsApproving(false);
            
            if (isUserRejection(error)) {
              throw error;
            }
            
            return false;
          }
          setIsApproving(false);
          
          // Step 2: Lock tokens
          setIsLocking(true);
          setCurrentStep(2);
          
          // Simulate locking for now - in a real implementation, call the contract
          await simulateDelay(2000);
          
          setIsLocking(false);
          
          // Only mark as confirmed at the very end
          setIsConfirming(true);
          await simulateDelay(1000);
          setIsConfirming(false);
          setIsConfirmed(true);
          if(address) await useAssetStore().fetchAssets(address, false)
          
          // Clear the ytAmountOut from the store after successful completion
          resetYtAmountOut();
        } catch (error) {
          console.error('Error in generic flow:', error);
          setIsLocking(false);
          setIsApproving(false);
          
          if (isUserRejection(error)) {
            throw error;
          }
          
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in lock process:', error);
      
      // Propagate user rejection errors
      if (isUserRejection(error)) {
        throw error;
      }
      
      return false;
    }
  };
  
  // Helper to simulate delays
  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  useEffect(() => {
    return () => {
      resetYtAmountOut();
    };
  }, [resetYtAmountOut]);
  
  return {
    // State
    isLocking,
    isApproving,
    isSwapping,
    isConfirming,
    isConfirmed,
    currentStep,
    totalSteps,
    ytAmountOut,
    ptAmountOut,
    swappedTokenAmount,
    
    // Actions
    lock
  };
} 