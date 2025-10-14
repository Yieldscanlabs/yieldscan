import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ManualWalletState {
  manualAddress: string;
  isManualModalOpen: boolean;
  setManualAddress: (address: string) => void;
  clearManualAddress: () => void;
  openManualModal: () => void;
  closeManualModal: () => void;
}

export const useManualWalletStore = create<ManualWalletState>()(
  persist(
    (set) => ({
      manualAddress: '',
      isManualModalOpen: false,
      setManualAddress: (address: string) => set({ manualAddress: address }),
      clearManualAddress: () => set({ manualAddress: '' }),
      openManualModal: () => set({ isManualModalOpen: true }),
      closeManualModal: () => set({ isManualModalOpen: false }),
    }),
    {
      name: 'yieldscan-manual-wallet',
      partialize: (state) => ({ manualAddress: state.manualAddress }),
    }
  )
);


