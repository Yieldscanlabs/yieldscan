import { useState, useEffect } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Asset } from '../types';
import tokens from '../utils/tokens';

// ERC20 ABI (minimal for balance checking)
const erc20ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// Token information


export default function useAssets(walletAddress: string) {
  const { address: connectedAddress } = useAccount();
  const userAddress = walletAddress || connectedAddress || '0x';
  
  // Create contract calls for all tokens
  const contractCalls = tokens.flatMap(token => [
    {
      address: token.address as `0x${string}`,
      abi: erc20ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
      chainId: token.chainId
    }
  ]);
  
  const { data, isLoading, isError } = useReadContracts({
    contracts: contractCalls
  });
  
  const assets: Asset[] = [];
  
  // Process the results if data is available
  if (data && !isLoading) {
    tokens.forEach((token, index) => {
      if (data[index]?.result) {
        const rawBalance = BigInt(data[index]?.result || 0);
        if (rawBalance > 0n) {
          const balance = formatUnits(rawBalance, token.decimals);
          const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
          
          assets.push({
            token: token.token,
            address: token.address,
            chain: token.chain,
            maxDecimalsShow: token.maxDecimalsShow,
            balance,
            yieldBearingToken: token.yieldBearingToken ? true : false,
            chainId: token.chainId,
            decimals: token.decimals,
            balanceUsd,
            icon: token.icon
          });
        }
      }
    });
  }
  
  return { 
    assets,
    loading: isLoading,
    error: isError
  };
}