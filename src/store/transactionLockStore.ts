import { create } from 'zustand';

interface TransactionLockState {
  // Whether the transaction is in progress and UI should be locked
  isLocked: boolean;
  
  // Store information about the current transaction
  transactionType: string | null;
  transactionId: string | null;
  
  // Actions
  lockTransaction: (transactionType: string, transactionId?: string) => void;
  unlockTransaction: () => void;
  isTransactionLocked: () => boolean;
}

/**
 * Store to manage transaction lock state globally
 * Used to prevent users from closing modals during critical operations
 */
export const useTransactionLockStore = create<TransactionLockState>((set, get) => ({
  // Initial state
  isLocked: false,
  transactionType: null,
  transactionId: null,
  
  // Lock UI during transaction
  lockTransaction: (transactionType, transactionId = undefined) => set({
    isLocked: true,
    transactionType,
    transactionId
  }),
  
  // Unlock UI when transaction completes
  unlockTransaction: () => set({
    isLocked: false,
    transactionType: null,
    transactionId: null
  }),
  
  // Helper to check if transaction is locked
  isTransactionLocked: () => get().isLocked
})); 