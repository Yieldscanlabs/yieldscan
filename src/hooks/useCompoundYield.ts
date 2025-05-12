import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, type Address } from 'viem';

// ABI for the CompoundYieldscan contract
const compoundYieldscanAbi = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'userAddress', type: 'address' }],
    name: 'getCompoundAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'feePercentage',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// ERC20 approval ABI
const erc20ApprovalAbi = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

interface UseCompoundYieldOptions {
  contractAddress: Address;
  tokenAddress: Address;
  tokenDecimals?: number;
  chainId?: number;
}

export default function useCompoundYield({
  contractAddress,
  tokenAddress,
  tokenDecimals = 18,
  chainId
}: UseCompoundYieldOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  // Get fee percentage
  const { data: feePercentage } = useReadContract({
    address: contractAddress,
    abi: compoundYieldscanAbi,
    functionName: 'feePercentage',
    chainId
  });
  
  // Get user's compound address
  const { data: userCompoundAddress } = useReadContract({
    address: contractAddress,
    abi: compoundYieldscanAbi,
    functionName: 'getCompoundAddress',
    args: [address as Address],
    chainId,
  });
  
  // Check allowance
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: erc20ApprovalAbi,
    functionName: 'allowance',
    args: [address as Address, contractAddress],
    chainId,
  });

  // Transaction receipt for last transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId
  });
  
  // Calculates the amount after fee that the user will receive
  const calculateAmountAfterFee = useCallback((amount: string): string => {
    if (!feePercentage) return amount;
    
    const amountBN = parseFloat(amount);
    const fee = (amountBN * Number(feePercentage)) / 100;
    const amountAfterFee = amountBN - fee;
    return amountAfterFee.toString();
  }, [feePercentage]);
  
  // Check if the current allowance is enough
  const hasEnoughAllowance = useCallback((amount: string): boolean => {
    if (!allowance) return false;
    
    const amountInWei = parseUnits(amount, tokenDecimals);
    return BigInt(allowance) >= amountInWei;
  }, [allowance, tokenDecimals]);
  
  // Approve token spending
  const approveToken = useCallback(async (amount: string): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    try {
      setIsApproving(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20ApprovalAbi,
        functionName: 'approve',
        args: [contractAddress, amountInWei],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error approving token:', error);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [address, contractAddress, tokenAddress, tokenDecimals, writeContractAsync, chainId]);
  
  // Supply tokens to compound
  const supplyToCompound = useCallback(async (amount: string): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    // First check if we have enough allowance
    if (!hasEnoughAllowance(amount)) {
      const approved = await approveToken(amount);
      if (!approved) return false;
    }
    
    try {
      setIsSupplying(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: compoundYieldscanAbi,
        functionName: 'supply',
        args: [amountInWei],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error supplying to Compound:', error);
      return false;
    } finally {
      setIsSupplying(false);
    }
  }, [address, contractAddress, hasEnoughAllowance, approveToken, writeContractAsync, tokenDecimals, chainId]);
  
  // Withdraw tokens from compound
  const withdrawFromCompound = useCallback(async (amount: string): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    try {
      setIsWithdrawing(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: compoundYieldscanAbi,
        functionName: 'withdraw',
        args: [amountInWei],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error withdrawing from Compound:', error);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  }, [address, contractAddress, writeContractAsync, tokenDecimals, chainId]);
  
  return {
    // State
    isSupplying,
    isWithdrawing,
    isApproving,
    isConfirming,
    isConfirmed,
    
    // Data
    feePercentage: feePercentage ? Number(feePercentage) : undefined,
    userCompoundAddress,
    allowance: allowance ? formatUnits(allowance, tokenDecimals) : '0',
    txHash,
    
    // Functions
    supplyToCompound,
    withdrawFromCompound,
    approveToken,
    hasEnoughAllowance,
    calculateAmountAfterFee
  };
}