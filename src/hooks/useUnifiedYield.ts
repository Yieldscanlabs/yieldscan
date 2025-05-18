import { useState, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { PROTOCOL_NAMES } from '../utils/constants';

// Supported protocols
export type SupportedProtocol = typeof PROTOCOL_NAMES [keyof typeof PROTOCOL_NAMES];

// Protocol-specific ABIs
const protocolAbis = {
  Aave: [
    {
      inputs: [
        { name: 'asset', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'onBehalfOf', type: 'address' },
        { name: 'referralCode', type: 'uint16' },
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
        { name: 'to', type: 'address' },
      ],
      name: 'withdraw',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ],
  Compound: [
    {
      inputs: [
        { name: 'asset', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'supply',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'asset', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      name: 'withdraw',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ],
  Venus: [
    {
      inputs: [
        { name: 'mintAmount', type: 'uint256' }
      ],
      name: 'mint',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'redeemTokens', type: 'uint256' }
      ],
      name: 'redeem',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ],
  Radiant: [
    {
      inputs: [
        { name: 'asset', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'onBehalfOf', type: 'address' },
        { name: 'referralCode', type: 'uint16' },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'asset', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'to', type: 'address' },
      ],
      name: 'withdraw',
      outputs: [{ name: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ]
} as const;

interface UseUnifiedYieldOptions {
  protocol: SupportedProtocol;
  contractAddress: Address;
  tokenAddress: Address;
  tokenDecimals?: number;
  chainId?: number;
}

export default function useUnifiedYield({
  protocol,
  contractAddress,
  tokenAddress,
  tokenDecimals = 18,
  chainId
}: UseUnifiedYieldOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isSupplying, setIsSupplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Transaction receipt for last transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId
  });

  // Supply tokens to the protocol
  const supply = useCallback(async (amount: string): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    try {
      setIsSupplying(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      let hash;
      // Protocol-specific supply function
      if (protocol === PROTOCOL_NAMES.AAVE) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Aave,
          functionName: 'supply',
          args: [tokenAddress, amountInWei, address, 0], // Aave requires these args
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.COMPOUND) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Compound,
          functionName: 'supply',
          args: [tokenAddress, amountInWei], // Compound just needs amount
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.VENUS) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Venus,
          functionName: 'mint',
          args: [amountInWei], // Venus uses 'mint' instead of 'supply'
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.RADIANT) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Radiant,
          functionName: 'deposit',
          args: [tokenAddress, amountInWei, address, 0], // Radiant uses 'deposit' - similar to Aave
          chainId
        });
      } else {
        throw new Error(`Protocol ${protocol} not supported`);
      }
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error(`Error supplying to ${protocol}:`, error);
      return false;
    } finally {
      setIsSupplying(false);
    }
  }, [address, contractAddress, protocol, tokenAddress, tokenDecimals, writeContractAsync, chainId]);

  // Withdraw tokens from the protocol
  const withdraw = useCallback(async (amount: string): Promise<boolean> => {
    if (!address || !contractAddress) return false;
    
    try {
      setIsWithdrawing(true);
      const amountInWei = parseUnits(amount, tokenDecimals);
      let hash;
      
      // Protocol-specific withdraw function
      if (protocol === PROTOCOL_NAMES.AAVE) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Aave,
          functionName: 'withdraw',
          args: [tokenAddress, amountInWei, address], // Aave withdraw requires these args
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.COMPOUND) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Compound,
          functionName: 'withdraw',
          args: [tokenAddress, amountInWei], // Compound withdraw
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.VENUS) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Venus,
          functionName: 'redeem', // Venus uses 'redeem' to withdraw exact amount
          args: [amountInWei],
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.RADIANT) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Radiant,
          functionName: 'withdraw',
          args: [tokenAddress, amountInWei, address], // Radiant withdraw parameters
          chainId
        });
      } else {
        throw new Error(`Protocol ${protocol} not supported`);
      }
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error(`Error withdrawing from ${protocol}:`, error);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  }, [address, contractAddress, protocol, tokenAddress, tokenDecimals, writeContractAsync, chainId]);

  return {
    // State
    isSupplying,
    isWithdrawing,
    isConfirming,
    isConfirmed,
    txHash,
    
    // Functions
    supply,
    withdraw
  };
}