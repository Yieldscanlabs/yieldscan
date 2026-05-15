import { useState, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
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

interface DepositStep {
  title: string;
  description: string;
  // fn is null initially - it gets evaluated lazily in executeStep with injected scope
  fn: (() => Promise<any>) | null;
  // rawFn stores the raw function string from the DB for re-evaluation with injected helpers
  rawFn: string;
  id: string;
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

interface StepResult {
  success: boolean;
  txHash?: string;
}

/**
 * Polls multiple RPC endpoints to find a transaction receipt.
 * Each attempt tries all RPCs in sequence before waiting and retrying.
 * This approach is more reliable than relying on a single RPC node.
 */
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
        // This RPC failed or does not have the tx yet - try the next one
      }
    }
    // Wait before the next round of polling across all RPCs
    await new Promise((r) => setTimeout(r, POLLING_INTERVAL_MS));
  }

  throw new Error(
    `Transaction not found after ${(POLLING_ATTEMPTS * POLLING_INTERVAL_MS) / 1000} seconds on chain ${targetChainId}`,
  );
}

/**
 * Hook that manages the deposit flow for a given asset and protocol.
 * It fetches the deposit function definition from the backend DB,
 * injects the required blockchain helpers at execution time,
 * and handles chain switching, transaction submission, and confirmation.
 */
export default function useDepositSteps({
  id,
  contractAddress,
  chainId,
  protocol,
  amount,
  tokenDecimals,
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
    error: null,
  });

  // Ref to track transaction confirmation status without causing stale closure issues
  const isConfirmedRef = useRef(false);

  // Wagmi hook to monitor the latest transaction hash for on-chain confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: executionState.txHash,
      chainId,
    });

  // Keep the ref in sync with wagmi's confirmation state
  useEffect(() => {
    isConfirmedRef.current = isConfirmed;
  }, [isConfirmed]);

  /**
   * Fetches the deposit function definition from the backend for this asset and protocol.
   * The function string is stored as rawFn and evaluated later with injected helpers
   * to ensure our custom writeContractAsync and waitForTransaction are used.
   */
  const fetchSteps = useCallback(async () => {
    if (!contractAddress || !chainId || !protocol) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = API_BASE_URL + `/api/definitions/asset/${id}/${protocol}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch steps: ${response.statusText}`);
      }

      const data = await response.json();

      // Store the raw function string - it will be evaluated in executeStep
      // with the correct helpers injected into its scope
      setSteps([
        {
          title: "depositing",
          description: "",
          fn: null,
          rawFn: data.deposit,
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
      setError(
        err instanceof Error ? err.message : "Failed to fetch deposit steps",
      );
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, chainId, protocol]);

  /**
   * Executes a single deposit step.
   *
   * The deposit function stored in the DB uses writeContractAsync and waitForTransaction
   * as free variables. To ensure our ethers-based implementations are used instead of
   * wagmi's versions, we re-evaluate the function string with our helpers injected
   * directly as function parameters.
   *
   * Flow:
   * 1. Build custom writeContractAsync using ethers + MetaMask provider
   * 2. Build custom waitForTransaction that tries MetaMask provider first, then falls back to RPC polling
   * 3. Switch wallet to the correct chain
   * 4. Re-evaluate the deposit function with injected helpers
   * 5. Execute and extract the final transaction hash
   */
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
        /**
         * Custom writeContractAsync implementation using ethers directly.
         * This bypasses wagmi's writeContractAsync which had issues broadcasting
         * transactions on certain chains (particularly BSC).
         * Creates a fresh BrowserProvider and signer for each call to avoid
         * stale provider issues after chain switches.
         */
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

        /**
         * Custom waitForTransaction implementation.
         * First attempts to use MetaMask's own provider to wait for the receipt,
         * since it has the transaction in its mempool and can find it immediately.
         * If MetaMask provider times out or fails, falls back to polling multiple
         * public RPC endpoints until the receipt is found.
         */
        const injectedWaitForTransaction = async ({
          hash,
          chainId: txChainId,
        }: {
          hash: string;
          chainId?: number;
        }) => {
          const targetChain = txChainId || chainId;

          try {
            // MetaMask's provider is most likely to have the tx in its mempool
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
            // MetaMask provider timed out or failed - fall back to RPC polling
          }

          return waitForReceiptWithPolling(hash, targetChain);
        };

        // Expose helpers on window as a fallback for any direct window.x references
        // in the eval'd deposit function
        (window as any).writeContractAsync = injectedWriteContractAsync;
        (window as any).waitForTransaction = injectedWaitForTransaction;
        (window as any).waitForTransactionReceipt = injectedWaitForTransaction;
        (window as any).parseUnits = parseUnits;
        (window as any).ethers = ethers;
        (window as any).MaxUint256 = MAX_UINT256;

        // Switch the wallet to the correct chain before sending any transactions.
        // This must happen before calling the deposit function, not inside writeContractAsync,
        // because the deposit function may call writeContractAsync multiple times
        // (e.g. approve + mint) and we need the chain to be correct for all of them.
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
          // Small delay to allow MetaMask to settle after the chain switch
          await new Promise((r) => setTimeout(r, CHAIN_SWITCH_DELAY_MS));
        } catch {
          // Chain may already be correct or switch was rejected - continue anyway
        }

        /**
         * Re-evaluate the deposit function with helpers injected as parameters.
         * This ensures the function's writeContractAsync and waitForTransaction
         * references resolve to our custom implementations, not wagmi's.
         * Simply setting window.writeContractAsync is not reliable because the
         * eval'd function may have captured references at parse time.
         */
        const depositFn = eval(`
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

        let txHash: any = await depositFn(
          amount,
          address,
          tokenDecimals,
          chainId,
        );

        // The deposit function may return either a plain hash string
        // or an object with { success, txHash } - handle both formats
        if (typeof txHash === "object") {
          if (txHash.success === false) {
            throw new Error(
              txHash.error ||
                txHash.details ||
                txHash.message ||
                "Deposit failed",
            );
          }
          if (txHash.success === true && txHash.txHash) {
            txHash = txHash.txHash;
          }
        }

        // Reset confirmation ref so the next transaction starts fresh
        isConfirmedRef.current = false;

        setExecutionState((prev) => ({
          ...prev,
          txHash,
          executedSteps: new Set([...prev.executedSteps, stepIndex]),
        }));

        return { success: true, txHash };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Transaction failed";
        setExecutionState((prev) => ({ ...prev, error: errorMessage }));
        return { success: false };
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

  /**
   * Executes all deposit steps in sequence.
   * Stops immediately if any step fails.
   * The deposit function itself handles waiting between internal steps
   * (e.g. waiting for approve before calling mint), so no additional
   * waiting is needed here.
   */
  const executeAllSteps = useCallback(async (): Promise<boolean> => {
    for (let i = 0; i < steps.length; i++) {
      const { success } = await executeStep(i);
      if (!success) return false;
    }
    return true;
  }, [steps, executeStep]);

  /**
   * Retries the current step if it previously failed.
   */
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
