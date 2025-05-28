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
    },
    {
      inputs: [
        { name: 'target', type: 'address' },
        { name: 'onBehalfOf', type: 'address' },
        { name: 'referralCode', type: 'uint16' },
      ],
      name: 'depositETH',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'target', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'to', type: 'address' },
      ],
      name: 'withdrawETH',
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
  ],
    Lido: [
    {
      inputs: [
        { name: 'referral', type: 'address' }
      ],
      name: 'submit',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'payable', 
      type: 'function'
    }
  ],
  MorphoBlue: [
    {
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' }
      ],
      name: 'deposit',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
        { name: 'owner', type: 'address' }
      ],
      name: 'withdraw',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ],
  Fluid: [
    {
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' }
      ],
      name: 'deposit',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
        { name: 'owner', type: 'address' }
      ],
      name: 'withdraw',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'receiver', type: 'address' }
      ],
      name: 'depositNative',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        { name: 'assets', type: 'uint256' },
        { name: 'receiver', type: 'address' },
        { name: 'owner', type: 'address' }
      ],
      name: 'withdrawNative',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    }
  ],
  RocketPool: [
    {
      inputs: [],
      name: 'deposit',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        { name: '_rethAmount', type: 'uint256' }
      ],
      name: 'burn',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { name: '_rethAmount', type: 'uint256' }
      ],
      name: 'getEthValue',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { name: '_ethAmount', type: 'uint256' }
      ],
      name: 'getRethValue',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getExchangeRate',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
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
      } else if(protocol === PROTOCOL_NAMES.LIDO) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Lido,
          functionName: 'submit',
          args: ['0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6'], // Use user's address as referral
          value: amountInWei, // Send ETH value
          chainId: 1
        });
      } else if (protocol === PROTOCOL_NAMES.MORPHO_BLUE) {
        // For Morpho Blue, we need to use the underlying asset's decimals (USDC = 6)
        // rather than the vault token's decimals
        const underlyingDecimals = 6; // USDC has 6 decimals
        const amountInUnderlyingDecimals = parseUnits(amount, underlyingDecimals);
        
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.MorphoBlue,
          functionName: 'deposit',
          args: [amountInUnderlyingDecimals, address as `0x${string}`], // Morpho Blue deposit - assets, receiver (ERC4626 standard)
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.FLUID) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Fluid,
          functionName: 'deposit',
          args: [amountInWei, address as `0x${string}`], // Fluid deposit - assets, receiver (ERC4626 standard)
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.ROCKET_POOL) {
        // Rocket Pool rETH deposits are handled via the dedicated supplyETHRocketPool function
        // since it requires sending ETH directly to the contract
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.RocketPool,
          functionName: 'deposit',
          args: [],
          value: amountInWei, // Send ETH value
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
      } else if (protocol === PROTOCOL_NAMES.FLUID) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Fluid,
          functionName: 'withdraw',
          args: [amountInWei, address as `0x${string}`, address as `0x${string}`], // Fluid withdraw - assets, receiver, owner (ERC4626 standard)
          chainId
        });
      }
      else if (protocol === PROTOCOL_NAMES.VENUS) {
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
      } else if (protocol === PROTOCOL_NAMES.MORPHO_BLUE) {
        // For Morpho Blue, we need to use the underlying asset's decimals (USDC = 6)
        // rather than the vault token's decimals
        const underlyingDecimals = 6; // USDC has 6 decimals
        const amountInUnderlyingDecimals = parseUnits(amount, underlyingDecimals);
        
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.MorphoBlue,
          functionName: 'withdraw',
          args: [amountInUnderlyingDecimals, address as `0x${string}`, address as `0x${string}`], // Morpho Blue withdraw - assets, receiver, owner (ERC4626 standard)
          chainId
        });
      } else if (protocol === PROTOCOL_NAMES.ROCKET_POOL) {
        hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.RocketPool,
          functionName: 'burn',
          args: [amountInWei],
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
    withdraw,
    
    // Native ETH support for Aave
    supplyETH: useCallback(async (amount: string, onBehalfOf: Address): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.AAVE) return false;
      
      try {
        setIsSupplying(true);
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        // Send ETH value with the transaction
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Aave,
          functionName: 'depositETH',
          args: ['0x0000000000000000000000000000000000000001', onBehalfOf, 0], // Use placeholder address for target
          value: amountInWei, // Send ETH value
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error supplying ETH to Aave:', error);
        return false;
      } finally {
        setIsSupplying(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId]),
    
    withdrawETH: useCallback(async (amount: string, to: Address): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.AAVE) return false;
      
      try {
        setIsWithdrawing(true);
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Aave,
          functionName: 'withdrawETH',
          args: ['0x0000000000000000000000000000000000000001', amountInWei, to], // Use placeholder address for target
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error withdrawing ETH from Aave:', error);
        return false;
      } finally {
        setIsWithdrawing(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId]),

    // Native ETH support for Fluid
    supplyNative: useCallback(async (amount: string, receiver: Address): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.FLUID) return false;
      
      try {
        setIsSupplying(true);
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        // Send ETH value with the transaction
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Fluid,
          functionName: 'depositNative',
          args: [receiver], // Fluid depositNative only needs receiver
          value: amountInWei, // Send ETH value
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error supplying ETH to Fluid:', error);
        return false;
      } finally {
        setIsSupplying(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId]),
    
    withdrawNative: useCallback(async (amount: string, receiver: Address, owner: Address): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.FLUID) return false;
      
      try {
        setIsWithdrawing(true);
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.Fluid,
          functionName: 'withdrawNative',
          args: [amountInWei, receiver, owner], // Fluid withdrawNative - assets, receiver, owner
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error withdrawing ETH from Fluid:', error);
        return false;
      } finally {
        setIsWithdrawing(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId]),
    
    // Native ETH support for Rocket Pool
    supplyETHRocketPool: useCallback(async (amount: string): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.ROCKET_POOL) return false;
      
      try {
        setIsSupplying(true);
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        // Send ETH directly to the rETH contract - the receive() function will handle the conversion
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: [
            {
              inputs: [],
              name: 'receive',
              outputs: [],
              stateMutability: 'payable',
              type: 'receive'
            }
          ],
          functionName: 'receive',
          args: [],
          value: amountInWei, // Send ETH value
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error supplying ETH to Rocket Pool:', error);
        return false;
      } finally {
        setIsSupplying(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId]),
    
    burnRocketPool: useCallback(async (rethAmount: string): Promise<boolean> => {
      if (!contractAddress || protocol !== PROTOCOL_NAMES.ROCKET_POOL) return false;
      
      try {
        setIsWithdrawing(true);
        const amountInWei = parseUnits(rethAmount, tokenDecimals);
        
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: protocolAbis.RocketPool,
          functionName: 'burn',
          args: [amountInWei], // Burn rETH amount
          chainId
        });
        
        setTxHash(hash);
        return true;
      } catch (error) {
        console.error('Error burning rETH from Rocket Pool:', error);
        return false;
      } finally {
        setIsWithdrawing(false);
      }
    }, [address, contractAddress, protocol, tokenDecimals, writeContractAsync, chainId])
  };
}