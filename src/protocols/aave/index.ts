import { formatUnits, parseUnits, type Address } from 'viem';
import { publicClient, walletClient } from '../../config/wagmi';
import { 
  aaveDataProviderABI, 
  aavePoolABI
} from './abi';
import { 
  ProtocolAdapter, 
  DepositResponse, 
  WithdrawResponse,
  ApyInfo 
} from '../types';

// Configuration constants
const AAVE_DATA_PROVIDER_ADDRESSES: Record<number, Address> = {
  1: '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d', // Ethereum
  // Add other chains as needed
};

const AAVE_POOL_ADDRESSES: Record<number, Address> = {
  1: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Ethereum
  // Add other chains as needed
};

// Supported tokens by chain
const SUPPORTED_TOKENS: Record<number, string[]> = {
  1: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
  ].map(addr => addr.toLowerCase()),
  // Add other chains as needed
};

/**
 * Implementation of Aave protocol adapter with focus on deposit and withdraw
 */
export const AaveAdapter: ProtocolAdapter = {
  name: 'aave',
  displayName: 'Aave',
  logoUrl: '/protocols/aave.svg',
  
  // Get APY for a token
  getApy: async (tokenAddress, chainId): Promise<ApyInfo> => {
    try {
      // Validate chain and token support
      if (!AAVE_DATA_PROVIDER_ADDRESSES[chainId]) {
        throw new Error(`Aave not supported on chain ${chainId}`);
      }
      
      const normalizedAddress = tokenAddress.toLowerCase();
      if (!SUPPORTED_TOKENS[chainId]?.includes(normalizedAddress)) {
        throw new Error('Token not supported by Aave on this chain');
      }
      
      // Get reserve data from Aave
      const client = publicClient({ chainId });
      const reserveData = await client.readContract({
        address: AAVE_DATA_PROVIDER_ADDRESSES[chainId],
        abi: aaveDataProviderABI,
        functionName: 'getReserveData',
        args: [tokenAddress as Address]
      });
      
      // Extract and process liquidityRate (APY)
      const liquidityRate = reserveData[3];
      const rateDecimal = Number(formatUnits(liquidityRate, 27));
      
      // Simple APY calculation (could be improved)
      const apy = rateDecimal * 100;
      
      return { value: apy, error: null };
    } catch (err: any) {
      console.error('Error fetching Aave APY:', err);
      return { 
        value: null, 
        error: err instanceof Error ? err.message : 'Unknown error fetching Aave APY' 
      };
    }
  },
  
  // Deposit tokens into Aave
  deposit: async (tokenAddress, amount, chainId): Promise<DepositResponse> => {
    try {
      // Validate parameters
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid deposit amount');
      }
      
      if (!AAVE_POOL_ADDRESSES[chainId]) {
        throw new Error(`Aave not supported on chain ${chainId}`);
      }
      
      // Get user's account
      const accounts = await walletClient().getAddresses();
      const userAddress = accounts[0];
      
      if (!userAddress) {
        throw new Error('No connected wallet account');
      }
      
      // Get token decimals (simplified - would need token metadata service)
      const decimals = 18; // This should be fetched dynamically based on the token
      
      // Convert amount to the correct units based on token decimals
      const amountBigInt = parseUnits(amount, decimals);
      
      // Send the deposit transaction
      const hash = await walletClient().writeContract({
        address: AAVE_POOL_ADDRESSES[chainId],
        abi: aavePoolABI,
        functionName: 'supply',
        args: [
          tokenAddress as Address, 
          amountBigInt, 
          userAddress, 
          0 // referral code, 0 means no referral
        ]
      });
      
      return {
        success: true,
        txHash: hash,
        error: null
      };
    } catch (err: any) {
      console.error('Error depositing to Aave:', err);
      return {
        success: false,
        txHash: null,
        error: err instanceof Error ? err.message : 'Unknown error during deposit'
      };
    }
  },
  
  // Withdraw tokens from Aave
  withdraw: async (tokenAddress, amount, chainId): Promise<WithdrawResponse> => {
    try {
      // Validate parameters
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid withdrawal amount');
      }
      
      if (!AAVE_POOL_ADDRESSES[chainId]) {
        throw new Error(`Aave not supported on chain ${chainId}`);
      }
      
      // Get user's account
      const accounts = await walletClient().getAddresses();
      const userAddress = accounts[0];
      
      if (!userAddress) {
        throw new Error('No connected wallet account');
      }
      
      // Get token decimals (simplified - would need token metadata service)
      const decimals = 18; // This should be fetched dynamically based on the token
      
      // Convert amount to the correct units based on token decimals
      const amountBigInt = parseUnits(amount, decimals);
      
      // Send the withdraw transaction
      const hash = await walletClient().writeContract({
        address: AAVE_POOL_ADDRESSES[chainId],
        abi: aavePoolABI,
        functionName: 'withdraw',
        args: [
          tokenAddress as Address, 
          amountBigInt, 
          userAddress // recipient address
        ]
      });
      
      return {
        success: true,
        txHash: hash,
        error: null
      };
    } catch (err: any) {
      console.error('Error withdrawing from Aave:', err);
      return {
        success: false,
        txHash: null,
        error: err instanceof Error ? err.message : 'Unknown error during withdrawal'
      };
    }
  },
  
  // Get supported tokens for this chain
  getSupportedTokens: (chainId): string[] => {
    return SUPPORTED_TOKENS[chainId] || [];
  },
  
  // Get supported chains
  getSupportedChains: (): number[] => {
    return Object.keys(AAVE_POOL_ADDRESSES).map(id => parseInt(id, 10));
  }
};