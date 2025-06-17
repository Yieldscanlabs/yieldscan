import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import useERC20 from './useERC20';
import type { Asset } from '../types';

interface FunctionConfig {
  name: string;
  type: string;
  stateMutability: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs: Array<{
    name?: string;
    type: string;
  }>;
}

interface WithdrawStep {
  assetId: string;
  order: number;
  title: string;
  description: string;
  chain: string;
  protocol: string;
  contractAddress: string;
  addressType?: {
    asset?: 'user' | 'asset' | 'underlying' | 'contract' | 'protocol' | 'custom';
    to?: 'user' | 'asset' | 'underlying' | 'contract' | 'protocol' | 'custom';
    [key: string]: 'user' | 'asset' | 'underlying' | 'contract' | 'protocol' | 'custom' | undefined;
  };
  approvalFrom?: string;
  approvalTo?: string;
  functionConfig: FunctionConfig;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

interface StepsResponse {
  steps: WithdrawStep[];
  count: number;
  contractAddress: string;
  chainId: number;
  chainName: string;
  protocol: string;
  assetId: string;
}

interface UseWithdrawStepsOptions {
  contractAddress: string;
  chainId: number;
  protocol: string;
  amount: string;
  tokenDecimals: number;
  asset?: Asset;
}

interface StepExecutionState {
  currentStep: number;
  isExecuting: boolean;
  executedSteps: Set<number>;
  error: string | null;
  txHash?: `0x${string}`;
}

export default function useWithdrawSteps({
  contractAddress,
  chainId,
  protocol,
  amount,
  tokenDecimals,
  asset
}: UseWithdrawStepsOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  console.log('asset', asset);
  const [steps, setSteps] = useState<WithdrawStep[]>([]);
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionState, setExecutionState] = useState<StepExecutionState>({
    currentStep: 0,
    isExecuting: false,
    executedSteps: new Set(),
    error: null
  });

  // Initialize ERC20 hook for approval steps
  const approvalStep = steps.find(step => step.functionConfig.name === 'approve');
  const { 
    hasEnoughAllowance,
    approve,
    isApproving
  } = useERC20({
    tokenAddress: (tokenAddress || contractAddress) as Address,
    spenderAddress: (approvalStep?.approvalTo || approvalStep?.contractAddress) as Address,
    chainId,
    tokenDecimals
  });

  // Transaction receipt monitoring
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: executionState.txHash,
    chainId
  });

  // Fetch steps from API
  const fetchSteps = useCallback(async () => {
    if (!contractAddress || !chainId || !protocol) return;

    setIsLoading(true);
    setError(null);

    try {
      const withdrawProtocol = `${protocol.toLowerCase()}-withdraw`;
      const url = `http://localhost:4023/api/steps/contract/${contractAddress}/chain/${chainId}/protocol/${withdrawProtocol}?includeDisabled=false`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch withdrawal steps: ${response.statusText}`);
      }

      const data: StepsResponse = await response.json();
      
      // Sort steps by order
      const sortedSteps = data.steps.filter(step => step.enabled).sort((a, b) => a.order - b.order);
      setSteps(sortedSteps);
      
      // Reset execution state when steps change
      setExecutionState({
        currentStep: 0,
        isExecuting: false,
        executedSteps: new Set(),
        error: null
      });

      // Store the token address from the response
      setTokenAddress(data.contractAddress);
    } catch (err) {
      console.error('Error fetching withdrawal steps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawal steps');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, chainId, protocol]);

  // Helper function to resolve address based on address type
  const resolveAddress = useCallback((
    addressType: 'user' | 'asset' | 'underlying' | 'contract' | 'protocol' | 'custom' | undefined,
    step: WithdrawStep
  ): Address => {
    switch (addressType) {
      case 'user':
        return address as Address; // User's wallet address
      case 'asset':
        return contractAddress as Address; // Current asset's contract address
      case 'underlying':
        return (asset?.underlyingAsset || tokenAddress || contractAddress) as Address; // Underlying asset's contract address from the asset
      case 'contract':
        return step.contractAddress as Address; // Step's contract address
      case 'protocol':
        return step.contractAddress as Address; // Protocol-specific address (same as contract for now)
      case 'custom':
        // For custom addresses, we'd need additional data from the API
        // For now, fallback to user address
        return address as Address;
      default:
        return address as Address; // Default to user address
    }
  }, [address, contractAddress, tokenAddress, asset]);

  // Execute a specific step
  const executeStep = useCallback(async (stepIndex: number): Promise<boolean> => {
    if (!address || stepIndex >= steps.length) return false;

    const step = steps[stepIndex];
    setExecutionState(prev => ({
      ...prev,
      currentStep: stepIndex,
      isExecuting: true,
      error: null
    }));

    try {
      let success = false;
      let txHash: `0x${string}` | undefined;

      if (step.functionConfig.name === 'approve') {
        // Handle approval step using ERC20 hook
        if (hasEnoughAllowance(amount)) {
          success = true; // Already approved
        } else {
          success = await approve(amount, step.contractAddress as Address);
          // The ERC20 hook manages its own transaction hash
        }
      } else {
        // Handle other steps (withdraw, etc.) using direct contract calls
        const amountInWei = parseUnits(amount, tokenDecimals);
        
        // Prepare arguments based on function inputs
        const args = step.functionConfig.inputs.map(input => {
          // Check if there's a specific address type for this input
          const inputAddressType = step.addressType?.[input.name];
          
          switch (input.name) {
            case 'asset':
              return resolveAddress(inputAddressType || 'underlying', step);
            case 'amount':
              return amountInWei;
            case 'onBehalfOf':
            case 'to':
            case 'receiver':
              return resolveAddress(inputAddressType || 'user', step);
            case 'referralCode':
              return 0;
            case 'spender':
              return resolveAddress(inputAddressType || 'contract', step);
            default:
              // For unknown parameters, try to infer based on type and address type
              if (input.type === 'address') {
                return resolveAddress(inputAddressType || 'user', step);
              } else if (input.type === 'uint256') {
                return amountInWei;
              } else if (input.type === 'uint16') {
                return 0;
              }
              return '0x';
          }
        });

        // Execute the contract function - use step.contractAddress for the contract interaction
        txHash = await writeContractAsync({
          address: step.contractAddress as Address, // This is the protocol contract address
          abi: [step.functionConfig],
          functionName: step.functionConfig.name,
          args,
          chainId
        });

        setExecutionState(prev => ({ ...prev, txHash }));
        success = true;
      }

      if (success) {
        setExecutionState(prev => ({
          ...prev,
          executedSteps: new Set([...prev.executedSteps, stepIndex])
        }));
      }

      return success;
    } catch (err) {
      console.error(`Error executing withdrawal step ${stepIndex}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setExecutionState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    } finally {
      setExecutionState(prev => ({ ...prev, isExecuting: false }));
    }
  }, [address, steps, amount, tokenDecimals, contractAddress, tokenAddress, hasEnoughAllowance, approve, writeContractAsync, chainId, resolveAddress]);

  // Execute all steps in sequence
  const executeAllSteps = useCallback(async (): Promise<boolean> => {
    for (let i = 0; i < steps.length; i++) {
      const success = await executeStep(i);
      if (!success) {
        return false;
      }
      
      // Wait for transaction confirmation if there was a transaction
      if (executionState.txHash) {
        await new Promise<void>((resolve) => {
          const checkConfirmation = () => {
            if (isConfirmed) {
              resolve();
            } else {
              setTimeout(checkConfirmation, 1000);
            }
          };
          checkConfirmation();
        });
      }
    }
    return true;
  }, [steps, executeStep, executionState.txHash, isConfirmed]);

  // Retry current step
  const retryCurrentStep = useCallback(() => {
    if (executionState.currentStep < steps.length) {
      return executeStep(executionState.currentStep);
    }
    return Promise.resolve(false);
  }, [executionState.currentStep, steps.length, executeStep]);

  // Fetch steps when options change
  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  return {
    // Data
    steps,
    isLoading,
    error,
    
    // Execution state
    currentStep: executionState.currentStep,
    isExecuting: executionState.isExecuting || isApproving,
    executedSteps: executionState.executedSteps,
    executionError: executionState.error,
    isConfirming,
    isConfirmed,
    txHash: executionState.txHash,
    
    // Functions
    executeStep,
    executeAllSteps,
    retryCurrentStep,
    refetchSteps: fetchSteps
  };
} 