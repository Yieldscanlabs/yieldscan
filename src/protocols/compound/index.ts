import { formatUnits, parseUnits, type Address } from 'viem';
import { publicClient, walletClient } from '../../config/wagmi';
import { 
  compoundYieldscanAbi, 
  erc20ApprovalAbi
} from './abi';
import { 
  ProtocolAdapter, 
  DepositResponse, 
  WithdrawResponse,
  ApyInfo 
} from '../types';

// Supported Compound tokens by chain
const SUPPORTED_TOKENS: Record<number, string[]> = {
  1: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  ].map(addr => addr.toLowerCase()),
};

// Compound YieldScan contract addresses
const COMPOUND_CONTRACT_ADDRESSES: Record<number, Address> = {
  1: '0x1234567890123456789012345678901234567890', // Replace with your actual contract address
  // Add other chains as needed
};

// Mapping of token addresses to their decimals
const TOKEN_DECIMALS: Record<string, number> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6, // USDC
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 6, // USDT
  '0x6b175474e89094c44da98b954eedeac495271d0f': 18, // DAI
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 18, // WETH
};

/**
 * Implementation of Compound protocol adapter
 */
export const CompoundAdapter: ProtocolAdapter = {
  name: 'compound',
  displayName: 'Compound',
  logoUrl: '/protocols/compound.svg',
  
  // Get APY for a token (from external source since it's not in the contract)
  getApy: async (tokenAddress, chainId): Promise<ApyInfo> => {
    try {
      // In a real implementation, you would fetch this from an API or on-chain
      // For demonstration, we're returning mock values based on the token
      const normalizedAddress = tokenAddress.toLowerCase();
      
      // Validate chain and token support
      if (!COMPOUND_CONTRACT_ADDRESSES[chainId]) {
        throw new Error(`Compound not supported on chain ${chainId}`);
      }
      
      if (!SUPPORTED_TOKENS[chainId]?.includes(normalizedAddress)) {
        throw new Error('Token not supported by Compound on this chain');
      }
      
      // Mock APY values - in a real implementation, you would fetch from Compound API
      const mockApyValues: Record<string, number> = {
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 2.5, // USDC
        '0xdac17f958d2ee523a2206206994597c13d831ec7': 2.3, // USDT
        '0x6b175474e89094c44da98b954eedeac495271d0f': 1.8, // DAI
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 0.5, // WETH
      };
      
      return { 
        value: mockApyValues[normalizedAddress] || 0, 
        error: null 
      };
    } catch (err: any) {
      console.error('Error fetching Compound APY:', err);
      return { 
        value: null, 
        error: err instanceof Error ? err.message : 'Unknown error fetching Compound APY' 
      };
    }
  },
  
  // Deposit tokens into Compound
  deposit: async (tokenAddress, amount, chainId): Promise<DepositResponse> => {
    try {
      // Validate parameters
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid deposit amount');
      }
      
      const contractAddress = COMPOUND_CONTRACT_ADDRESSES[chainId];
      if (!contractAddress) {
        throw new Error(`Compound not supported on chain ${chainId}`);
      }
      
      const normalizedAddress = tokenAddress.toLowerCase();
      if (!SUPPORTED_TOKENS[chainId]?.includes(normalizedAddress)) {
        throw new Error('Token not supported by Compound on this chain');
      }
      
      // Get token decimals
      const decimals = TOKEN_DECIMALS[normalizedAddress] || 18;
      
      // Get user's account
      const accounts = await walletClient().getAddresses();
      const userAddress = accounts[0];
      
      if (!userAddress) {
        throw new Error('No connected wallet account');
      }
      
      // Check allowance first
      const allowance = await publicClient({ chainId }).readContract({
        address: tokenAddress as Address,
        abi: erc20ApprovalAbi,
        functionName: 'allowance',
        args: [userAddress, contractAddress]
      });
      
      // Convert amount to the correct units based on token decimals
      const amountBigInt = parseUnits(amount, decimals);
      
      // If allowance is insufficient, request approval
      if (BigInt(allowance) < amountBigInt) {
        const approvalHash = await walletClient().writeContract({
          address: tokenAddress as Address,
          abi: erc20ApprovalAbi,
          functionName: 'approve',
          args: [contractAddress, amountBigInt]
        });
        
        // Wait for approval to be confirmed
        await publicClient({ chainId }).waitForTransactionReceipt({ 
          hash: approvalHash 
        });
      }
      
      // Now we can deposit
      const hash = await walletClient().writeContract({
        address: contractAddress,
        abi: compoundYieldscanAbi,
        functionName: 'supply',
        args: [amountBigInt]
      });
      
      return {
        success: true,
        txHash: hash,
        error: null
      };
    } catch (err: any) {
      console.error('Error depositing to Compound:', err);
      return {
        success: false,
        txHash: null,
        error: err instanceof Error ? err.message : 'Unknown error during deposit'
      };
    }
  },
  
  // Withdraw tokens from Compound
  withdraw: async (tokenAddress, amount, chainId): Promise<WithdrawResponse> => {
    try {
      // Validate parameters
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid withdrawal amount');
      }
      
      const contractAddress = COMPOUND_CONTRACT_ADDRESSES[chainId];
      if (!contractAddress) {
        throw new Error(`Compound not supported on chain ${chainId}`);
      }
      
      const normalizedAddress = tokenAddress.toLowerCase();
      if (!SUPPORTED_TOKENS[chainId]?.includes(normalizedAddress)) {
        throw new Error('Token not supported by Compound on this chain');
      }
      
      // Get token decimals
      const decimals = TOKEN_DECIMALS[normalizedAddress] || 18;
      
      // Get user's account
      const accounts = await walletClient().getAddresses();
      const userAddress = accounts[0];
      
      if (!userAddress) {
        throw new Error('No connected wallet account');
      }
      
      // Convert amount to the correct units based on token decimals
      const amountBigInt = parseUnits(amount, decimals);
      
      // Send the withdraw transaction
      const hash = await walletClient().writeContract({
        address: contractAddress,
        abi: compoundYieldscanAbi,
        functionName: 'withdraw',
        args: [amountBigInt]
      });
      
      return {
        success: true,
        txHash: hash,
        error: null
      };
    } catch (err: any) {
      console.error('Error withdrawing from Compound:', err);
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
    return Object.keys(COMPOUND_CONTRACT_ADDRESSES).map(id => parseInt(id, 10));
  }
};