import { useState, useEffect } from 'react';
import { useReadContracts, useAccount, useBalance } from 'wagmi';
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
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Separate tokens into native and ERC20 tokens
  const nativeTokens = tokens.filter(token => token.address === '0x');
  const erc20Tokens = tokens.filter(token => token.address !== '0x');
  
  // Create contract calls for ERC20 tokens
  const contractCalls = erc20Tokens.flatMap(token => [
    {
      address: token.address as `0x${string}`,
      abi: erc20ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
      chainId: token.chainId
    }
  ]);
  
  const { data: erc20Data, isLoading: erc20Loading, isError: erc20Error } = useReadContracts({
    contracts: contractCalls
  });
  
  // Create separate balance requests for each native token
  const nativeBalanceResults = nativeTokens.map(token => {
    const { data, isLoading, isError } = useBalance({
      address: userAddress as `0x${string}`,
      chainId: token.chainId,
    });
    
    return { data, isLoading, isError, token };
  });
  
  useEffect(() => {
    const areNativeBalancesLoading = nativeBalanceResults.some(result => result.isLoading);
    const hasNativeBalanceError = nativeBalanceResults.some(result => result.isError);
    
    setIsLoading(erc20Loading || areNativeBalancesLoading);
    setIsError(erc20Error || hasNativeBalanceError);
    
    if (!isLoading && !isError) {
      const newAssets: Asset[] = [];
      
      // Process ERC20 tokens
      if (erc20Data) {
        erc20Tokens.forEach((token, index) => {
          if (erc20Data[index]?.result) {
            const rawBalance = BigInt(erc20Data[index]?.result || 0n);
            if (rawBalance > 0n) {
              const balance = formatUnits(rawBalance, token.decimals);
              const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
              
              newAssets.push({
                token: token.token,
                address: token.address,
                chain: token.chain,
                maxDecimalsShow: token.maxDecimalsShow,
                protocol: token.protocol,
                withdrawContract: token.withdrawContract,
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
      
      // Process native tokens
      nativeBalanceResults.forEach(result => {
        if (result.data && result.data.value > 0n) {
          const token = result.token;
          const balance = result.data.formatted;
          const balanceUsd = (parseFloat(balance) * token.usdPrice).toString();
          
          newAssets.push({
            token: token.token,
            address: token.address,
            chain: token.chain,
            maxDecimalsShow: token.maxDecimalsShow,
            protocol: token.protocol,
            withdrawContract: token.withdrawContract,
            balance,
            yieldBearingToken: false,
            chainId: token.chainId,
            decimals: token.decimals,
            balanceUsd,
            icon: token.icon
          });
        }
      });
      
      setAssets(newAssets);
    }
  }, [erc20Data, erc20Loading, erc20Error, nativeBalanceResults, userAddress]);
  
  return { 
    assets,
    loading: isLoading,
    error: isError
  };
}