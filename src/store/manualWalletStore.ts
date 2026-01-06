import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ManualWalletState {
  manualAddresses: string[];
  activeManualAddressIndex: number | null;
  isConsolidated: boolean;
  isManualModalOpen: boolean;
  hasHydrated: boolean;


  addManualAddress: (address: string) => void;
  removeManualAddress: (index: number) => void;
  setActiveManualAddress: (index: number | null) => void;
  toggleConsolidated: () => void;
  clearAllManualAddresses: () => void;
  openManualModal: () => void;
  closeManualModal: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useManualWalletStore = create<ManualWalletState>()(
  persist(
    (set, get) => ({
      manualAddresses: [],
      activeManualAddressIndex: null,
      isConsolidated: false,
      isManualModalOpen: false,
      hasHydrated: false,
      addManualAddress: (address: string) => {
        const state = get();
        const trimmedAddress = address.trim().toLowerCase();

        // Check if already exists
        const exists = state.manualAddresses.some(
          addr => addr.toLowerCase() === trimmedAddress
        );

        if (exists) {
          throw new Error('Wallet address already exists');
        }

        // Check max limit (5)
        if (state.manualAddresses.length >= 5) {
          throw new Error('Maximum 5 wallets allowed');
        }

        // Add address
        const newAddresses = [...state.manualAddresses, address.trim()];
        const newActiveIndex = state.activeManualAddressIndex === null ? 0 : state.activeManualAddressIndex;

        set({
          manualAddresses: newAddresses,
          activeManualAddressIndex: newActiveIndex === null && newAddresses.length > 0 ? 0 : newActiveIndex,
        });
      },
      removeManualAddress: (index: number) => {
        const state = get();
        if (index < 0 || index >= state.manualAddresses.length) {
          return;
        }

        // Cannot remove active wallet
        if (state.activeManualAddressIndex === index) {
          throw new Error('Cannot remove active wallet. Please switch to another wallet first.');
        }

        const newAddresses = state.manualAddresses.filter((_, i) => i !== index);
        let newActiveIndex = state.activeManualAddressIndex;

        // Adjust active index if needed
        if (newActiveIndex !== null && newActiveIndex > index) {
          newActiveIndex = newActiveIndex - 1;
        }

        // If no addresses left, set active to null
        if (newAddresses.length === 0) {
          newActiveIndex = null;
        }

        set({
          manualAddresses: newAddresses,
          activeManualAddressIndex: newActiveIndex,
        });
      },
      setActiveManualAddress: (index: number | null) => {
        const state = get();
        if (index !== null && (index < 0 || index >= state.manualAddresses.length)) {
          return;
        }
        set({ activeManualAddressIndex: index });
      },
      toggleConsolidated: () => {
        set((state) => ({ isConsolidated: !state.isConsolidated }));
      },
      clearAllManualAddresses: () => {
        set({
          manualAddresses: [],
          activeManualAddressIndex: null,
        });
      },
      openManualModal: () => set({ isManualModalOpen: true }),
      closeManualModal: () => set({ isManualModalOpen: false }),
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      }
    }),
    {
      name: 'yieldscan-manual-wallet',
      partialize: (state) => ({
        manualAddresses: state.manualAddresses,
        activeManualAddressIndex: state.activeManualAddressIndex,
        isConsolidated: state.isConsolidated,
      }), 
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);


