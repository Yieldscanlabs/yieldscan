import { create } from 'zustand';
import type { Asset } from '../types';

interface OptimizationState {
  // Whether the optimization modal is open
  isModalOpen: boolean;
  
  // Network switching status
  isSwitchingNetwork: boolean;
  networkSwitchStatus: 'idle' | 'switching' | 'success' | 'error';
  
  // Current optimization data
  currentAsset: Asset | null;
  currentProtocol: string;
  currentApy: number;
  betterProtocol: string;
  betterApy: number;
  additionalYearlyUsd: string;
  
  // Callback function to run after successful optimization
  onOptimizeCallback: (() => void) | null;
  
  // Actions
  openModal: (data: {
    asset: Asset;
    currentProtocol: string;
    currentApy: number;
    betterProtocol: string;
    betterApy: number;
    additionalYearlyUsd: string;
    onOptimize: () => void;
  }) => void;
  closeModal: () => void;
  completeOptimization: (success: boolean) => void;
  setNetworkSwitchStatus: (status: 'idle' | 'switching' | 'success' | 'error') => void;
  setIsSwitchingNetwork: (isSwitching: boolean) => void;
}

export const useOptimizationStore = create<OptimizationState>((set, get) => ({
  // Initial state
  isModalOpen: false,
  isSwitchingNetwork: false,
  networkSwitchStatus: 'idle',
  currentAsset: null,
  currentProtocol: '',
  currentApy: 0,
  betterProtocol: '',
  betterApy: 0,
  additionalYearlyUsd: '',
  onOptimizeCallback: null,
  
  // Open the modal with optimization data
  openModal: (data) => set({
    isModalOpen: true,
    currentAsset: data.asset,
    currentProtocol: data.currentProtocol,
    currentApy: data.currentApy,
    betterProtocol: data.betterProtocol,
    betterApy: data.betterApy,
    additionalYearlyUsd: data.additionalYearlyUsd,
    onOptimizeCallback: data.onOptimize
  }),
  
  // Close the modal
  closeModal: () => set({
    isModalOpen: false,
    networkSwitchStatus: 'idle'
  }),
  
  // Complete the optimization process
  completeOptimization: (success) => {
    const { onOptimizeCallback } = get();
    
    set({ isModalOpen: false, networkSwitchStatus: 'idle' });
    
    if (success && onOptimizeCallback) {
      // Add a delay to allow for blockchain confirmation
      setTimeout(() => {
        onOptimizeCallback();
      }, 2000);
    }
  },
  
  // Set network switching status
  setNetworkSwitchStatus: (status) => set({ networkSwitchStatus: status }),
  
  // Set network switching flag
  setIsSwitchingNetwork: (isSwitching) => set({ isSwitchingNetwork: isSwitching })
}));