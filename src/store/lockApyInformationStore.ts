import { create } from 'zustand';
import type { Asset } from '../types';

interface LockAPYProtocol {
  name: string;
  swap: boolean;
  ytAddress: string;
  ptAddress: string;
  swapAddress: string;
  ytDecimals: number;
  ptDecimals: number;
}

interface LockAPYInformationState {
  // Whether the information modal is open
  isLockAPYInformationModalOpen: boolean;
  
  // Current data for the information modal
  currentAsset: Asset | null;
  protocol: LockAPYProtocol | null;
  expirationDate: string;
  currentAPY: number;
  amountToLock: number;
  
  // Callback function to run when user confirms lock
  onConfirmCallback: (() => void) | null;
  
  // Actions
  openLockAPYInformationModal: (data: {
    asset: Asset;
    protocol: LockAPYProtocol;
    expirationDate: string;
    currentAPY: number;
    amountToLock: number;
    onConfirm: () => void;
  }) => void;
  closeLockAPYInformationModal: () => void;
  confirmLockAPY: () => void;
}

export const useLockAPYInformationStore = create<LockAPYInformationState>((set, get) => ({
  // Initial state
  isLockAPYInformationModalOpen: false,
  currentAsset: null,
  protocol: null,
  expirationDate: '',
  currentAPY: 0,
  amountToLock: 0,
  onConfirmCallback: null,
  
  // Open the information modal with data
  openLockAPYInformationModal: (data) => set({
    isLockAPYInformationModalOpen: true,
    currentAsset: data.asset,
    protocol: data.protocol,
    expirationDate: data.expirationDate,
    currentAPY: data.currentAPY,
    amountToLock: data.amountToLock,
    onConfirmCallback: data.onConfirm
  }),
  
  // Close the information modal
  closeLockAPYInformationModal: () => set({
    isLockAPYInformationModalOpen: false,
    currentAsset: null,
    protocol: null,
    expirationDate: '',
    currentAPY: 0,
    amountToLock: 0,
    onConfirmCallback: null
  }),
  
  // Confirm the lock APY (close info modal and trigger callback)
  confirmLockAPY: () => {
    const { onConfirmCallback } = get();
    
    // Close the information modal
    set({
      isLockAPYInformationModalOpen: false,
      currentAsset: null,
      protocol: null,
      expirationDate: '',
      currentAPY: 0,
      amountToLock: 0,
      onConfirmCallback: null
    });
    
    // Execute the callback (which will open the transaction modal)
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  }
})); 