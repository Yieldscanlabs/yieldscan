import { useState, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import type { Asset } from "../types";
import { API_BASE_URL } from "../utils/constants";
// @ts-ignore
import { ethers } from "ethers";
import {
  RPC_URLS,
  MAX_UINT256,
  POLLING_ATTEMPTS,
  POLLING_INTERVAL_MS,
  CHAIN_SWITCH_DELAY_MS,
  METAMASK_WAIT_TIMEOUT_MS,
} from "../constants/rpc";
import { getReadableError } from "../utils/errorUtils";

interface WithdrawStep {
  title: string;
  description: string;
  fn: (() => Promise<any>) | null;
  rawFn: string;
  id: string;
}

interface UseWithdrawStepsOptions {
  id: string;
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

interface StepResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

async function waitForReceiptWithPolling(
  hash: string,
  targetChainId: number,
): Promise<any> {
  const rpcs = RPC_URLS[targetChainId] || RPC_URLS[56];

  for (let attempt = 0; attempt < POLLING_ATTEMPTS; attempt++) {
    for (const rpcUrl of rpcs) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const receipt = await provider.getTransactionReceipt(hash);
        if (receipt) return receipt;
      } catch {
        // try next RPC
      }
    }
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }

  throw new Error(
    `Transaction not found after ${(POLLING_ATTEMPTS * POLLING_INTERVAL_MS) / 1000} seconds on chain ${targetChainId}`,
  );
}

export default function useWithdrawSteps({
  id,
  contractAddress,
  chainId,
  protocol,
  amount,
  tokenDecimals,
  asset,
}: UseWithdrawStepsOptions) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [steps, setSteps] = useState<WithdrawStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionState, setExecutionState] = useState<StepExecutionState>({
    currentStep: 0,
    isExecuting: false,
    executedSteps: new Set(),
    error: null,
  });

  const isConfirmedRef = useRef(false);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: executionState.txHash,
      chainId,
    });

  useEffect(() => {
    isConfirmedRef.current = isConfirmed;
  }, [isConfirmed]);

  const fetchSteps = useCallback(async () => {
    if (!contractAddress || !chainId || !protocol) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = API_BASE_URL + `/api/definitions/asset/${id}/${protocol}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch withdrawal steps: ${response.statusText}`,
        );
      }

      const data = await response.json();

      // ✅ Store rawFn like useDepositSteps — evaluated at execution time with injected helpers
      setSteps([
        {
          title: "withdrawing",
          description: "",
          fn: null,
          rawFn: data.withdraw,
          id: "1",
        },
      ]);

      setExecutionState({
        currentStep: 0,
        isExecuting: false,
        executedSteps: new Set(),
        error: null,
      });
    } catch (err) {
      console.error("Error fetching withdrawal steps:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch withdrawal steps",
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, chainId, protocol]);

  const executeStep = useCallback(
    async (stepIndex: number): Promise<StepResult> => {
      if (!address || stepIndex >= steps.length) return { success: false };

      const step = steps[stepIndex];
      setExecutionState((prev) => ({
        ...prev,
        currentStep: stepIndex,
        isExecuting: true,
        error: null,
      }));

      try {
        // ✅ Same injected helpers as useDepositSteps
        const injectedWriteContractAsync = async (params: any) => {
          const freshProvider = new ethers.BrowserProvider(
            (window as any).ethereum,
            params.chainId,
          );
          const freshSigner = await freshProvider.getSigner();
          const contract = new ethers.Contract(
            params.address,
            params.abi,
            freshSigner,
          );
          const tx = await contract[params.functionName](...params.args);
          return tx.hash as `0x${string}`;
        };

        const injectedWaitForTransaction = async ({
          hash,
          chainId: txChainId,
        }: {
          hash: string;
          chainId?: number;
        }) => {
          const targetChain = txChainId || chainId;

          try {
            const mmProvider = new ethers.BrowserProvider(
              (window as any).ethereum,
              targetChain,
            );
            const receipt = await mmProvider.waitForTransaction(
              hash,
              1,
              METAMASK_WAIT_TIMEOUT_MS,
            );
            if (receipt) return receipt;
          } catch {
            // fall back to RPC polling
          }

          return waitForReceiptWithPolling(hash, targetChain);
        };

        // Expose on window as fallback
        (window as any).writeContractAsync = injectedWriteContractAsync;
        (window as any).waitForTransaction = injectedWaitForTransaction;
        (window as any).waitForTransactionReceipt = injectedWaitForTransaction;
        (window as any).parseUnits = parseUnits;
        (window as any).ethers = ethers;
        (window as any).MaxUint256 = MAX_UINT256;

        // ✅ Switch chain before executing
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
          await new Promise((r) => setTimeout(r, CHAIN_SWITCH_DELAY_MS));
        } catch {
          // chain may already be correct
        }

        // ✅ Re-evaluate with injected helpers — same pattern as useDepositSteps
        const withdrawFn = eval(`
        (function(writeContractAsync, waitForTransaction, waitForTransactionReceipt, parseUnits, MaxUint256, ethers) {
          return (${step.rawFn});
        })
      `)(
          injectedWriteContractAsync,
          injectedWaitForTransaction,
          injectedWaitForTransaction,
          parseUnits,
          MAX_UINT256,
          ethers,
        );

        let txHash: any = await withdrawFn(
          amount,
          address,
          tokenDecimals,
          chainId,
        );

        // ✅ Handle both plain hash string and { success, txHash } object
        if (typeof txHash === "object") {
          if (txHash.success === false) {
            throw new Error(
              txHash.error ||
                txHash.details ||
                txHash.message ||
                "Withdrawal failed",
            );
          }
          if (txHash.success === true && txHash.txHash) {
            txHash = txHash.txHash;
          }
        }

        isConfirmedRef.current = false;

        setExecutionState((prev) => ({
          ...prev,
          txHash,
          executedSteps: new Set([...prev.executedSteps, stepIndex]),
        }));

        return { success: true, txHash };
      } catch (err) {
        const rawMessage =
          err instanceof Error ? err.message : "Transaction failed";
        const readableError = getReadableError(rawMessage) || rawMessage;

        setExecutionState((prev) => ({
          ...prev,
          error: readableError,
        }));

        // ✅ Return the error in the result object
        return { success: false, error: readableError };
      } finally {
        setExecutionState((prev) => ({ ...prev, isExecuting: false }));
      }
    },
    [
      address,
      steps,
      amount,
      tokenDecimals,
      contractAddress,
      writeContractAsync,
      chainId,
    ],
  );

  const executeAllSteps = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    for (let i = 0; i < steps.length; i++) {
      const result = await executeStep(i);
      if (!result.success) {
        return { success: false, error: result.error };
      }
    }
    return { success: true };
  }, [steps, executeStep]);

  const retryCurrentStep = useCallback(() => {
    if (executionState.currentStep < steps.length) {
      return executeStep(executionState.currentStep);
    }
    return Promise.resolve({ success: false });
  }, [executionState.currentStep, steps.length, executeStep]);

  useEffect(() => {
    fetchSteps();
  }, [fetchSteps]);

  return {
    steps,
    isLoading,
    error,
    currentStep: executionState.currentStep,
    isExecuting: executionState.isExecuting,
    executedSteps: executionState.executedSteps,
    executionError: executionState.error,
    isConfirming,
    isConfirmed,
    txHash: executionState.txHash,
    executeStep,
    executeAllSteps,
    retryCurrentStep,
    refetchSteps: fetchSteps,
  };
}
