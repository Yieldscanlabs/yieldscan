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
  
  // Current lock data
  asset: Asset | null;
  protocol: string;
  expirationDate: string;
  lockDetails: LockDetails | null;
  
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
}

export const useLockStore = create<LockState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  asset: null,
  protocol: '',
  expirationDate: '',
  lockDetails: null,
  onLockCallback: null,
  
  // Open the modal with lock data
  openModal: (data) => set({
    isModalOpen: true,
    asset: data.asset,
    protocol: data.protocol,
    expirationDate: data.expirationDate,
    lockDetails: data.lockDetails,
    onLockCallback: data.onLock || null
  }),
  
  // Close the modal
  closeModal: () => set({
    isModalOpen: false
  }),
  
  // Complete the lock process
  completeLock: (success) => {
    const { onLockCallback } = get();
    
    set({ isModalOpen: false });
    
    if (success && onLockCallback) {
      // Add a delay to allow for blockchain confirmation
      setTimeout(() => {
        onLockCallback();
      }, 2000);
    }
  }
})); 