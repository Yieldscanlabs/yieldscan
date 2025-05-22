import { parseUnits, type Address } from 'viem';
import { type UseWriteContractReturnType } from 'wagmi';
import { readContract } from '@wagmi/core';
import { config } from '../main';

// ERC20 Standard ABI for common functions
export const erc20Abi = [
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

// Check if the current allowance is enough
export function hasEnoughAllowance(
  allowance: bigint | undefined,
  amount: string,
  decimals: number
): boolean {
  if (!allowance) return false;
  
  try {
    const amountInWei = parseUnits(amount, decimals);
    return allowance >= amountInWei;
  } catch (error) {
    console.error('Error checking allowance:', error);
    return false;
  }
}

// Approve token spending with exact amount
export async function approveExact(
  tokenAddress: Address,
  spenderAddress: Address,
  amount: string,
  decimals: number,
  writeContractAsync: UseWriteContractReturnType['writeContractAsync']
): Promise<`0x${string}` | null> {
  try {
    const amountInWei = parseUnits(amount, decimals);
    
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amountInWei]
    });
    
    return hash;
  } catch (error) {
    console.error('Error approving token:', error);
    return null;
  }
}

// Approve unlimited token spending (max uint256)
export async function approveUnlimited(
  tokenAddress: Address,
  spenderAddress: Address,
  writeContractAsync: UseWriteContractReturnType['writeContractAsync']
): Promise<`0x${string}` | null> {
  try {
    // Max uint256 value for unlimited approval
    const maxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, maxUint256]
    });
    
    return hash;
  } catch (error) {
    console.error('Error approving unlimited token:', error);
    return null;
  }
}

// Transfer tokens to another address
export async function transfer(
  tokenAddress: Address,
  recipientAddress: Address,
  amount: string,
  decimals: number,
  writeContractAsync: UseWriteContractReturnType['writeContractAsync']
): Promise<`0x${string}` | null> {
  try {
    const amountInWei = parseUnits(amount, decimals);
    
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientAddress, amountInWei]
    });
    
    return hash;
  } catch (error) {
    console.error('Error transferring token:', error);
    return null;
  }
}

// Safe approve with fallback from unlimited to exact amount
export async function safeApprove(
  tokenAddress: Address,
  spenderAddress: Address,
  amount: string,
  decimals: number,
  writeContractAsync: UseWriteContractReturnType['writeContractAsync']
): Promise<`0x${string}` | null> {
  try {
    
    return await approveExact(tokenAddress, spenderAddress, amount, decimals, writeContractAsync);
  } catch (error: any) {
    console.error('Error in safe approval:', error);
    return null;
  }
}

/**
 * Get token allowance directly as a Promise using the project's wagmi config
 * This allows getting allowance without using React hooks
 */
export async function getTokenAllowance(
  tokenAddress: Address,
  ownerAddress: Address,
  spenderAddress: Address
): Promise<bigint> {
  try {
    // Use the project's existing wagmi config
    console.log
    const allowance = await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [ownerAddress, spenderAddress],
    });
    
    // Ensure we return a bigint
    return BigInt(allowance.toString());
  } catch (error) {
    console.error('Error getting token allowance:', error);
    return BigInt(0); // Default to 0 if there's an error
  }
} 