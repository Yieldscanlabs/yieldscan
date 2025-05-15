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
      console.log(amount, tokenDecimals, amountInWei.toString());
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

  return {
    // State
    isSupplying,
    isConfirming,
    isConfirmed,
    txHash,
    
    // Functions
    supply
  };
}