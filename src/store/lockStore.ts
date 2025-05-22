import { create } from 'zustand';
import type { Asset } from '../types';

interface LockDetails {
  name: string;
  swap: boolean;
  ytAddress: string;
  ptAddress: string;
  swapAddress: string;
  ytMarketAddress: string;
  ytDecimals: number;
  ptDecimals: number;
}

interface LockState {
  // Whether the lock modal is open
  isModalOpen: boolean;
  
  // Whether the lock process has been initiated (used to prevent closing the modal)
  initiatedLock: boolean;
  
  // Current lock data
  asset: Asset | null;
  protocol: string;
  expirationDate: string;
  lockDetails: LockDetails | null;
  
  // Store the YT amount out value for Pendle protocol
  ytAmountOut: string | undefined;
  
  // Callback function to run after successful lock
  onLockCallback: (() => void) | null;
  
  // Actions
  openModal: (data: {
    asset: Asset;
    protocol: string;
    expirationDate: string;
    lockDetails: LockDetails;
    onLock?: () => void;
  }) => void;
  closeModal: () => void;
  completeLock: (success: boolean) => void;
  setInitiatedLock: (initiated: boolean) => void;
  setYtAmountOut: (amount: string) => void;
  resetYtAmountOut: () => void;
}

export const useLockStore = create<LockState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  initiatedLock: false,
  asset: null,
  protocol: '',
  expirationDate: '',
  lockDetails: null,
  ytAmountOut: undefined,
  onLockCallback: null,
  
  // Open the modal with lock data
  openModal: (data) => set({
    isModalOpen: true,
    initiatedLock: false,
    asset: data.asset,
    protocol: data.protocol,
    expirationDate: data.expirationDate,
    lockDetails: data.lockDetails,
    ytAmountOut: undefined, // Reset YT amount when opening a new lock
    onLockCallback: data.onLock || null
  }),
  
  // Close the modal
  closeModal: () => {
    // Only allow closing if lock hasn't been initiated, or force close
    const { initiatedLock } = get();
    if (!initiatedLock) {
      set({
        isModalOpen: false,
        initiatedLock: false
      });
    }
  },
  
  // Complete the lock process
  completeLock: (success) => {
    const { onLockCallback } = get();
    
    set({ 
      isModalOpen: false,
      initiatedLock: false,
      ytAmountOut: undefined // Reset YT amount on completion
    });
    
    if (success && onLockCallback) {
      // Add a delay to allow for blockchain confirmation
      setTimeout(() => {
        onLockCallback();
      }, 2000);
    }
  },
  
  // Set the initiated lock state
  setInitiatedLock: (initiated) => set({
    initiatedLock: initiated
  }),
  
  // Set the YT amount out value
  setYtAmountOut: (amount) => set({
    ytAmountOut: amount
  }),
  
  // Reset the YT amount out value
  resetYtAmountOut: () => set({
    ytAmountOut: undefined
  })
})); 