import { useState, useEffect } from 'react';
import { useReadContracts, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import type { Asset } from '../types';

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
const tokens = [
  {
    token: 'USDC' as const,
    chain: 'ETH' as const,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDC
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    chainId: 1, // mainnet
    decimals: 6,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDT' as const,
    chain: 'ETH' as const, 
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    chainId: 1, // mainnet
    decimals: 6,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDC' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Arbitrum USDC
    icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    chainId: 42161, // arbitrum
    decimals: 6,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDT' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum USDT
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    chainId: 42161, // arbitrum
    decimals: 6,
    usdPrice: 1 // Stablecoin pegged to USD
  }
];

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
        const rawBalance = data[index].result as bigint;
        if (rawBalance > 0n) {
          const balance = formatUnits(rawBalance, token.decimals);
          const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
          
          assets.push({
            token: token.token,
            chain: token.chain,
            balance,
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