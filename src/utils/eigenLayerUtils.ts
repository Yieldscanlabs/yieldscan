import type { Address } from 'viem';
import { parseUnits } from 'viem';

// EigenPodManager ABI - focused on the functions we need
export const EIGEN_POD_MANAGER_ABI = [
  {
    inputs: [],
    name: 'createPod',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'pubkey', type: 'bytes' },
      { name: 'signature', type: 'bytes' },
      { name: 'depositDataRoot', type: 'bytes32' }
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'podOwner', type: 'address' }],
    name: 'hasPod',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'podOwner', type: 'address' }],
    name: 'getPod',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }, { name: 'strategy', type: 'address' }],
    name: 'stakerDepositShares',
    outputs: [{ name: 'depositShares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  }
] as const;

// EigenPod ABI - for operations on the Pod itself
export const EIGEN_POD_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amountWei', type: 'uint256' }
    ],
    name: 'withdrawRestakedBeaconChainETH',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'pubkey', type: 'bytes' },
      { name: 'signature', type: 'bytes' },
      { name: 'depositDataRoot', type: 'bytes32' }
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  }
] as const;

export interface EigenLayerPodInfo {
  hasPod: boolean;
  podAddress: Address | null;
  depositShares: bigint;
}

export interface EigenLayerStakeParams {
  pubkey: `0x${string}`;
  signature: `0x${string}`;
  depositDataRoot: `0x${string}`;
  amount: string; // ETH amount to stake (should be 32 ETH for validator)
}

/**
 * Utility class for EigenLayer operations
 * Handles Pod checking, creation, and staking operations
 */
export class EigenLayerUtils {
  private podManagerAddress: Address;
  private beaconChainETHStrategyAddress: Address;

  constructor(
    podManagerAddress: Address,
    beaconChainETHStrategyAddress: Address = '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0' as Address // Default strategy address
  ) {
    this.podManagerAddress = podManagerAddress;
    this.beaconChainETHStrategyAddress = beaconChainETHStrategyAddress;
  }

  /**
   * Check if user has a Pod and get Pod information
   */
  static createPodInfoQuery(
    userAddress: Address,
    podManagerAddress: Address,
    beaconChainETHStrategyAddress: Address
  ) {
    return {
      address: podManagerAddress,
      abi: EIGEN_POD_MANAGER_ABI,
      functionName: 'hasPod',
      args: [userAddress],
    };
  }

  /**
   * Get Pod address for a user
   */
  static createGetPodQuery(userAddress: Address, podManagerAddress: Address) {
    return {
      address: podManagerAddress,
      abi: EIGEN_POD_MANAGER_ABI,
      functionName: 'getPod',
      args: [userAddress],
    };
  }

  /**
   * Get user's deposit shares
   */
  static createDepositSharesQuery(
    userAddress: Address,
    podManagerAddress: Address,
    beaconChainETHStrategyAddress: Address
  ) {
    return {
      address: podManagerAddress,
      abi: EIGEN_POD_MANAGER_ABI,
      functionName: 'stakerDepositShares',
      args: [userAddress, beaconChainETHStrategyAddress],
    };
  }

  /**
   * Create transaction parameters for Pod creation
   */
  static createPodTransaction(podManagerAddress: Address) {
    return {
      address: podManagerAddress,
      abi: EIGEN_POD_MANAGER_ABI,
      functionName: 'createPod',
      args: [],
    };
  }

  /**
   * Create transaction parameters for staking
   * This will create a Pod if the user doesn't have one
   */
  static createStakeTransaction(
    podManagerAddress: Address,
    stakeParams: EigenLayerStakeParams
  ) {
    const amountInWei = parseUnits(stakeParams.amount, 18);
    
    return {
      address: podManagerAddress,
      abi: EIGEN_POD_MANAGER_ABI,
      functionName: 'stake',
      args: [stakeParams.pubkey, stakeParams.signature, stakeParams.depositDataRoot],
      value: amountInWei,
    };
  }

  /**
   * Create transaction parameters for withdrawing from an existing Pod
   */
  static createWithdrawTransaction(
    podAddress: Address,
    userAddress: Address,
    amount: string
  ) {
    const amountInWei = parseUnits(amount, 18);
    
    return {
      address: podAddress,
      abi: EIGEN_POD_ABI,
      functionName: 'withdrawRestakedBeaconChainETH',
      args: [userAddress, amountInWei],
    };
  }

  /**
   * Validate staking parameters
   */
  static validateStakeParams(params: EigenLayerStakeParams): boolean {
    // Basic validation
    if (!params.pubkey || !params.signature || !params.depositDataRoot) {
      return false;
    }
    
    // Check if pubkey is 48 bytes (96 hex chars + 0x prefix)
    if (params.pubkey.length !== 98) {
      return false;
    }
    
    // Check if amount is 32 ETH (standard validator deposit)
    const amount = parseFloat(params.amount);
    if (amount !== 32) {
      console.warn('EigenLayer: Standard validator deposit is 32 ETH');
    }
    
    return true;
  }

  /**
   * Get the default EigenPodManager address for mainnet
   */
  static getDefaultPodManagerAddress(): Address {
    return '0x91E677b07F7AF907ec9a428aafA9fc14a0d3A338' as Address; // EigenPodManager on mainnet
  }

  /**
   * Get the default BeaconChainETH strategy address for mainnet
   */
  static getDefaultBeaconChainETHStrategyAddress(): Address {
    return '0xbeaC0eeEeeeeEEeEeEEEEeeEEeEeeeEeeEEBEaC0' as Address; // BeaconChainETH strategy on mainnet
  }
} 