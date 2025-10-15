import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ManualWalletState {
  manualAddress: string;
  manualChainId: number | null;
  isManualModalOpen: boolean;
  setManualAddress: (address: string) => void;
  setManualChainId: (chainId: number | null) => void;
  clearManualAddress: () => void;
  clearManualChainId: () => void;
  openManualModal: () => void;
  closeManualModal: () => void;
}

export const useManualWalletStore = create<ManualWalletState>()(
  persist(
    (set) => ({
      manualAddress: '',
      manualChainId: null,
      isManualModalOpen: false,
      setManualAddress: (address: string) => set({ manualAddress: address }),
      setManualChainId: (chainId: number | null) => set({ manualChainId: chainId }),
      clearManualAddress: () => set({ manualAddress: '' }),
      clearManualChainId: () => set({ manualChainId: null }),
      openManualModal: () => set({ isManualModalOpen: true }),
      closeManualModal: () => set({ isManualModalOpen: false }),
    }),
    {
      name: 'yieldscan-manual-wallet',
      partialize: (state) => ({ manualAddress: state.manualAddress, manualChainId: state.manualChainId }),
    }
  )
);


