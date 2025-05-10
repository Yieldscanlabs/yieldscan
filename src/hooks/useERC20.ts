import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits, type Address } from 'viem';

// ERC20 Standard ABI for common functions
const erc20Abi = [
  // Read functions
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
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
  },
  // Write functions
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
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  }
] as const;

interface UseERC20Options {
  tokenAddress: Address;
  spenderAddress?: Address;
  tokenDecimals?: number;
  chainId?: number;
}

interface TokenInfo {
  name: string | undefined;
  symbol: string | undefined;
  decimals: number;
  totalSupply: string | undefined;
}

export default function useERC20({
  tokenAddress,
  spenderAddress,
  tokenDecimals = 18,
  chainId
}: UseERC20Options) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [isApproving, setIsApproving] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Get token basic information
  const { data: tokenName } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'name',
    chainId
  });

  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId
  });

  const { data: fetchedDecimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId
  });

  const { data: totalSupply } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'totalSupply',
    chainId
  });

  // Get user's token balance
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as Address],
    chainId,
  });

  // Get allowance if spender is provided
  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as Address, spenderAddress as Address],
    chainId,
  });

  // Transaction receipt for last transaction
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId
  });

  // Get the decimals value (use provided or fetched)
  const decimals = fetchedDecimals !== undefined ? Number(fetchedDecimals) : tokenDecimals;

  // Format the balance to a human-readable string
  const formattedBalance = balance !== undefined
    ? formatUnits(balance, decimals)
    : '0';

  // Format the allowance to a human-readable string
  const formattedAllowance = allowance !== undefined
    ? formatUnits(allowance, decimals)
    : '0';

  // Get token info
  const tokenInfo: TokenInfo = {
    name: tokenName,
    symbol: tokenSymbol,
    decimals,
    totalSupply: totalSupply !== undefined ? formatUnits(totalSupply, decimals) : undefined
  };

  // Check if the current allowance is enough
  const hasEnoughAllowance = useCallback((amount: string): boolean => {
    if (!allowance) return false;
    
    const amountInWei = parseUnits(amount, decimals);
    return BigInt(allowance) >= amountInWei;
  }, [allowance, decimals]);

  // Approve token spending
  const approve = useCallback(async (
    amount: string,
    customSpender?: Address
  ): Promise<boolean> => {
    const spender = customSpender || spenderAddress;
    if (!address || !spender) return false;
    
    try {
      setIsApproving(true);
      const amountInWei = parseUnits(amount, decimals);
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, amountInWei],
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
  }, [address, spenderAddress, tokenAddress, decimals, writeContractAsync, chainId]);

  // Approve unlimited token spending (max uint256)
  const approveUnlimited = useCallback(async (
    customSpender?: Address
  ): Promise<boolean> => {
    const spender = customSpender || spenderAddress;
    if (!address || !spender) return false;
    
    try {
      setIsApproving(true);
      // Max uint256 value for unlimited approval
      const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, maxUint256],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error approving unlimited token:', error);
      return false;
    } finally {
      setIsApproving(false);
    }
  }, [address, spenderAddress, tokenAddress, writeContractAsync, chainId]);

  // Transfer tokens to another address
  const transfer = useCallback(async (
    to: Address,
    amount: string
  ): Promise<boolean> => {
    if (!address) return false;
    
    try {
      const amountInWei = parseUnits(amount, decimals);
      
      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to, amountInWei],
        chainId
      });
      
      setTxHash(hash);
      return true;
    } catch (error) {
      console.error('Error transferring token:', error);
      return false;
    }
  }, [address, tokenAddress, decimals, writeContractAsync, chainId]);

  return {
    // Token info
    tokenInfo,
    
    // Balances and allowances
    balance: formattedBalance,
    balanceRaw: balance,
    allowance: formattedAllowance,
    allowanceRaw: allowance,
    
    // State
    isApproving,
    isConfirming,
    isConfirmed,
    txHash,
    
    // Functions
    approve,
    approveUnlimited,
    transfer,
    hasEnoughAllowance
  };
}