import { create } from 'zustand';
import type { Asset } from '../types';
import type { OptimizationData } from '../components/YieldCard/types';

interface OptimizeInformationState {
  // Whether the information modal is open
  isInformationModalOpen: boolean;
  
  // Current data for the information modal
  currentAsset: Asset | null;
  optimizationData: OptimizationData | null;
  
  // Callback function to run when user confirms optimization
  onConfirmCallback: (() => void) | null;
  
  // Actions
  openInformationModal: (data: {
    asset: Asset;
    optimizationData: OptimizationData;
    onConfirm: () => void;
  }) => void;
  closeInformationModal: () => void;
  confirmOptimization: () => void;
}

export const useOptimizeInformationStore = create<OptimizeInformationState>((set, get) => ({
  // Initial state
  isInformationModalOpen: false,
  currentAsset: null,
  optimizationData: null,
  onConfirmCallback: null,
  
  // Open the information modal with data
  openInformationModal: (data) => set({
    isInformationModalOpen: true,
    currentAsset: data.asset,
    optimizationData: data.optimizationData,
    onConfirmCallback: data.onConfirm
  }),
  
  // Close the information modal
  closeInformationModal: () => set({
    isInformationModalOpen: false,
    currentAsset: null,
    optimizationData: null,
    onConfirmCallback: null
  }),
  
  // Confirm the optimization (close info modal and trigger callback)
  confirmOptimization: () => {
    const { onConfirmCallback } = get();
    
    // Close the information modal
    set({
      isInformationModalOpen: false,
      currentAsset: null,
      optimizationData: null,
      onConfirmCallback: null
    });
    
    // Execute the callback (which will open the transaction modal)
    if (onConfirmCallback) {
      onConfirmCallback();
    }
  }
})); 