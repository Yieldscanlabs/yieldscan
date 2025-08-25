import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import useERC20 from './useERC20';
import { API_BASE_URL } from '../utils/constants';
// @ts-ignore
import { ethers } from "ethers";
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

interface DepositStep {
  title: string;
  description: string;
  fn: () => Promise<any>;
  id: string
}

interface StepsResponse {
  steps: DepositStep[];
  count: number;
  contractAddress: string;
  chainId: number;
  chainName: string;
  protocol: string;
  assetId: string;
}

interface UseDepositStepsOptions {
  id: string;
  contractAddress: string;
  chainId: number;
  protocol: string;
  amount: string;
  tokenDecimals: number;
}

interface StepExecutionState {
  currentStep: number;
  isExecuting: boolean;
  executedSteps: Set<number>;
  error: string | null;
  txHash?: `0x${string}`;
}

interface Response {
  deposit: string;
}

export default function useDepositSteps({
  id,
  contractAddress,
  chainId,
  protocol,
  amount,
  tokenDecimals
}: UseDepositStepsOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [steps, setSteps] = useState<DepositStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionState, setExecutionState] = useState<StepExecutionState>({
    currentStep: 0,
    isExecuting: false,
    executedSteps: new Set(),
    error: null
  });

  // Initialize ERC20 hook for approval steps
  // const approvalStep = steps.find(step => step.functionConfig.name === 'approve');
  // const {
  //   hasEnoughAllowance,
  //   approve,
  //   isApproving
  // } = useERC20({
  //   tokenAddress: (approvalStep?.approvalFrom || contractAddress) as Address,
  //   spenderAddress: (approvalStep?.approvalTo || approvalStep?.contractAddress) as Address,
  //   chainId,
  //   tokenDecimals
  // });

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
      const url = API_BASE_URL + `/api/definitions/asset/${id}`;
      const response = await fetch(url);

      console.log(response);


      if (!response.ok) {
        throw new Error(`Failed to fetch steps: ${response.statusText}`);
      }

      const data = await response.json();

      const getDepositEval = eval(`(${data.deposit})`);

      // Sort steps by order
      const sortedSteps = getDepositEval;

      console.log("sortedSteps", sortedSteps);

      setSteps([{
        title: "depositing",
        description: "description",
        fn: sortedSteps,
        id: "1"
      }]);

      // Reset execution state when steps change
      setExecutionState({
        currentStep: 0,
        isExecuting: false,
        executedSteps: new Set(),
        error: null
      });
    } catch (err) {
      console.error('Error fetching deposit steps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch deposit steps');
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, chainId, protocol]);

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

      console.log("Executing step:", step);
      //@ts-ignore
      txHash = await step.fn(amount, address, tokenDecimals, chainId);

      setExecutionState(prev => ({ ...prev, txHash }));
      success = true;

      // if (step.functionConfig.name === 'approve') {
      //   // Handle approval step using ERC20 hook
      //   if (hasEnoughAllowance(amount)) {
      //     success = true; // Already approved
      //   } else {
      //     success = await approve(amount, step.contractAddress as Address);
      //     // The ERC20 hook manages its own transaction hash
      //   }
      // } else {
      //   // Handle other steps (deposit, etc.) using direct contract calls
      //   const amountInWei = parseUnits(amount, tokenDecimals);

      //   // Prepare arguments based on function inputs
      //   const args = step.functionConfig.inputs.map(input => {
      //     switch (input.name) {
      //       case 'asset':
      //         return contractAddress as Address;
      //       case 'amount':
      //         return amountInWei;
      //       case 'onBehalfOf':
      //       case 'to':
      //       case 'receiver':
      //         return address as Address;
      //       case 'referralCode':
      //         return 0;
      //       case 'spender':
      //         return step.contractAddress as Address;
      //       default:
      //         // For unknown parameters, try to infer based on type
      //         if (input.type === 'address') {
      //           return address as Address;
      //         } else if (input.type === 'uint256') {
      //           return amountInWei;
      //         } else if (input.type === 'uint16') {
      //           return 0;
      //         }
      //         return '0x';
      //     }
      //   });

      //   // Execute the contract function
      //   txHash = await writeContractAsync({
      //     address: step.contractAddress as Address,
      //     abi: [step.functionConfig],
      //     functionName: step.functionConfig.name,
      //     args,
      //     chainId
      //   });

      //   setExecutionState(prev => ({ ...prev, txHash }));
      //   success = true;
      // }

      if (success) {
        setExecutionState(prev => ({
          ...prev,
          executedSteps: new Set([...prev.executedSteps, stepIndex])
        }));
      }

      return success;
    } catch (err) {
      console.error(`Error executing step ${stepIndex}:`, err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setExecutionState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return false;
    } finally {
      setExecutionState(prev => ({ ...prev, isExecuting: false }));
    }
  }, [address, steps, amount, tokenDecimals, contractAddress, writeContractAsync, chainId]);

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
    isExecuting: executionState.isExecuting,
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