import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, type Address } from 'viem';

// ABI for the AaveYieldscan contract
const aaveYieldscanAbi = [
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' }
    ],
    name: 'supply',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    name: 'withdraw',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'userAddress', type: 'address' }],
    name: 'getAaveAddress',
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

interface UseAaveYieldOptions {
  contractAddress: Address;
  tokenAddress: Address;
  tokenDecimals?: number;
  chainId?: number;
}

export default function useAaveYield({
  contractAddress,
  tokenAddress,
  tokenDecimals = 18,
  chainId
}: UseAaveYieldOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  
  // Get fee percentage
  const { data: feePercentage } = useReadContract({
    address: contractAddress,
    abi: aaveYieldscanAbi,
    functionName: 'feePercentage',
    chainId
  });
  
  // Get user's Aave address
  const { data: userAaveAddress } = useReadContract({
    address: contractAddress,
    abi: aaveYieldscanAbi,
    functionName: 'getAaveAddress',
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
  
  // Supply tokens to Aave
  const supplyToAave = useCallback(async (amount: string, onBehalfOf?: Address, referralCode: number = 0): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    // First check if we have enough allowance
    if (!hasEnoughAllowance(amount)) {
      const approved = await approveToken(amount);
      if (!approved) return false;
    }
    
    try {
      setIsSupplying(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      const recipient = onBehalfOf || address;
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: aaveYieldscanAbi,
        functionName: 'supply',
        args: [tokenAddress, amountInWei, recipient, referralCode as any],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error supplying to Aave:', error);
      return false;
    } finally {
      setIsSupplying(false);
    }
  }, [address, contractAddress, tokenAddress, hasEnoughAllowance, approveToken, writeContractAsync, tokenDecimals, chainId]);
  
  // Withdraw tokens from Aave
  const withdrawFromAave = useCallback(async (amount: string, to?: Address): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    try {
      setIsWithdrawing(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      const recipient = to || address;
      
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: aaveYieldscanAbi,
        functionName: 'withdraw',
        args: [tokenAddress, amountInWei, recipient],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error withdrawing from Aave:', error);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  }, [address, contractAddress, tokenAddress, writeContractAsync, tokenDecimals, chainId]);
  
  return {
    // State
    isSupplying,
    isWithdrawing,
    isApproving,
    isConfirming,
    isConfirmed,
    
    // Data
    feePercentage: feePercentage ? Number(feePercentage) : undefined,
    userAaveAddress,
    allowance: allowance ? formatUnits(allowance, tokenDecimals) : '0',
    txHash,
    
    // Functions
    supplyToAave,
    withdrawFromAave,
    approveToken,
    hasEnoughAllowance,
    calculateAmountAfterFee
  };
}

export const AAVE_V3_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    // 'WETH': '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
    'USDT': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    // 'DAI': '0x018008bfb33d285247A21d44E50697654f754e63',
    // 'WBTC': '0x5Ee5bf7ae06D1Be5997A1A72006FE6C607eC6DE8'
  },
  // Polygon
  137: {
    'USDC': '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F',
    'WETH': '0x28424507fefb6f7f8E9D3860F56504E4e5f5f390',
    'USDT': '0x60D55F02A771d515e077c9C2403a1ef324885CeC',
    'DAI': '0x27F8D03b3a2196956ED754baDc28D73be8830A6e',
    'WBTC': '0x5c2ed810328349100A66B82b78a1791B101C9D61'
  },
  // Arbitrum
  42161: {
    'USDC': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'WETH': '0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8',
    'USDT': '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    'DAI': '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
  },
  // Optimism
  10: {
    'USDC': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'WETH': '0xc5Db22719A06418028A40A9B5E9A7c02959D0d08',
    'USDT': '0x6ab707Aca953eDAeFBc4fD23bA73294241490620',
    'DAI': '0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE'
  },
  // Avalanche
  43114: {
    'USDC': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'WAVAX': '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
    'USDT': '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
  },
  // Base
  8453: {
    'USDC': '0x4F086A048C33f3BF9011dd2265861ce812624F2c',
    'WETH': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }
};