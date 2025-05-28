import { PROTOCOL_NAMES } from './constants';

// Type for minimum deposit configuration
interface MinimumDepositConfig {
  [chainId: number]: {
    [tokenAddress: string]: {
      [protocol: string]: number;
    };
  };
}

// Minimum deposit limits in native token units (e.g., ETH, not wei)
export const MINIMUM_DEPOSITS: MinimumDepositConfig = {
  // Ethereum Mainnet
  1: {
    // ETH (native token)
    '0x': {
      [PROTOCOL_NAMES.ROCKET_POOL]: 0.01, // 0.01 ETH minimum for Rocket Pool
      [PROTOCOL_NAMES.LIDO]: 0, // No minimum for Lido
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave
      [PROTOCOL_NAMES.COMPOUND]: 0, // No minimum for Compound
    },
    // USDC
    '0xA0b86a33E6417c9A7bA8c8d78e89a9C6C16b8Ab2': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave USDC
      [PROTOCOL_NAMES.COMPOUND]: 0, // No minimum for Compound USDC
      [PROTOCOL_NAMES.MORPHO_BLUE]: 0, // No minimum for Morpho Blue USDC
    },
    // USDT
    '0xdAC17F958D2ee523a2206206994597C13D831ec7': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave USDT
      [PROTOCOL_NAMES.COMPOUND]: 0, // No minimum for Compound USDT
    }
  },
  // Arbitrum One
  42161: {
    // ETH (native token)
    '0x': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave on Arbitrum
      [PROTOCOL_NAMES.RADIANT]: 0, // No minimum for Radiant
    },
    // USDC on Arbitrum
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave USDC on Arbitrum
      [PROTOCOL_NAMES.RADIANT]: 0, // No minimum for Radiant USDC
    }
  },
  // Base
  8453: {
    // ETH (native token)
    '0x': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave on Base
      [PROTOCOL_NAMES.FLUID]: 0, // No minimum for Fluid
    },
    // USDC on Base
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
      [PROTOCOL_NAMES.AAVE]: 0, // No minimum for Aave USDC on Base
      [PROTOCOL_NAMES.MORPHO_BLUE]: 0, // No minimum for Morpho Blue on Base
    }
  },
  // BNB Smart Chain
  56: {
    // BNB (native token)
    '0x': {
      [PROTOCOL_NAMES.VENUS]: 0, // No minimum for Venus
    },
    // USDC on BSC
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': {
      [PROTOCOL_NAMES.VENUS]: 0, // No minimum for Venus USDC
    }
  }
};

/**
 * Get the minimum deposit amount for a specific protocol, chain, and token
 * @param chainId - The chain ID
 * @param tokenAddress - The token contract address (use '0x' for native tokens)
 * @param protocol - The protocol name
 * @returns The minimum deposit amount in token units, or 0 if no minimum exists
 */
export function getMinimumDeposit(
  chainId: number,
  tokenAddress: string,
  protocol: string
): number {
  // Normalize token address for native tokens
  const normalizedTokenAddress = tokenAddress === '0x0000000000000000000000000000000000000000' ? '0x' : tokenAddress;
  
  return MINIMUM_DEPOSITS[chainId]?.[normalizedTokenAddress]?.[protocol] ?? 0;
}

/**
 * Check if an amount meets the minimum deposit requirement
 * @param amount - The deposit amount to check
 * @param chainId - The chain ID
 * @param tokenAddress - The token contract address
 * @param protocol - The protocol name
 * @returns Object with isValid boolean and minimumRequired number
 */
export function validateMinimumDeposit(
  amount: string | number,
  chainId: number,
  tokenAddress: string,
  protocol: string
): { isValid: boolean; minimumRequired: number } {
  const minimumRequired = getMinimumDeposit(chainId, tokenAddress, protocol);
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return {
    isValid: minimumRequired === 0 || amountNum >= minimumRequired,
    minimumRequired
  };
}

/**
 * Get a formatted error message for minimum deposit violations
 * @param minimumRequired - The minimum deposit amount required
 * @param tokenSymbol - The token symbol (e.g., 'ETH', 'USDC')
 * @param protocol - The protocol name
 * @returns Formatted error message
 */
export function getMinimumDepositErrorMessage(
  minimumRequired: number,
  tokenSymbol: string,
  protocol: string
): string {
  return `${protocol} requires a minimum deposit of ${minimumRequired} ${tokenSymbol}`;
} 