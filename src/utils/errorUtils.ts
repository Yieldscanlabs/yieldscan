/**
 * Maps blockchain and wallet error messages to user friendly messages.
 * Checks for known error codes and message patterns and returns
 * a plain English description of what went wrong.
 */
export function getReadableError(error: string | null): string | null {
  if (!error) return null;

  const msg = error.toLowerCase();

  // User rejected the transaction in MetaMask
  if (
    msg.includes("user denied") ||
    msg.includes("action_rejected") ||
    msg.includes("action rejected") ||
    msg.includes("user rejected") ||
    msg.includes("code=action_rejected") ||
    msg.includes("ethers-user-denied")
  ) {
    return "Transaction was cancelled. Please try again and confirm in MetaMask.";
  }

  // Insufficient funds
  if (
    msg.includes("insufficient funds") ||
    msg.includes("insufficient balance")
  ) {
    return "Insufficient funds to complete this transaction. Please check your balance.";
  }

  // Gas estimation failed
  if (
    msg.includes("cannot estimate gas") ||
    msg.includes("gas required exceeds")
  ) {
    return "Transaction is likely to fail. Please check the amount and try again.";
  }

  // Network or RPC issues
  if (
    msg.includes("network error") ||
    msg.includes("failed to fetch") ||
    msg.includes("could not connect")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Transaction reverted on chain
  if (msg.includes("execution reverted")) {
    // Specific known revert reasons
    if (msg.includes("mint is paused")) {
      return "Deposits are currently paused for this market by the protocol.";
    }
    if (msg.includes("withdraw is paused")) {
      return "Withdrawals are currently paused for this market by the protocol.";
    }
    if (msg.includes("insufficient liquidity")) {
      return "Insufficient liquidity in the protocol. Please try a smaller amount.";
    }
    return "Transaction was rejected by the protocol. Please try again.";
  }

  // Timeout
  if (msg.includes("timeout") || msg.includes("transaction not found after")) {
    return "Transaction is taking longer than expected. Please check your wallet for the status.";
  }

  // Wrong network
  if (
    msg.includes("does not match the target chain") ||
    msg.includes("wrong network")
  ) {
    return "Wrong network selected. Please switch to the correct network in MetaMask.";
  }

  // Slippage
  if (msg.includes("slippage")) {
    return "Price moved too much. Please try again.";
  }

  // Default fallback
  return "Something went wrong. Please try again.";
}
