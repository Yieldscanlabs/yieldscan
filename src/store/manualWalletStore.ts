import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useDepositsAndWithdrawalsStore } from './depositsAndWithdrawalsStore';

interface ManualWalletState {
  metamaskAddress: null | string;
  manualAddresses: string[];
  activeManualAddressIndex: number | null;
  isConsolidated: boolean;
  isManualModalOpen: boolean;
  hasHydrated: boolean;

  // 1. New State for Labels
  walletLabels: Record<string, string>;
  setMetamaskAddress: (address: string|null) => void;
  addManualAddress: (address: string) => void;
  removeManualAddress: (index: number) => void;
  setActiveManualAddress: (index: number | null) => void;
  toggleConsolidated: () => void;
  clearAllManualAddresses: () => void;
  openManualModal: () => void;
  closeManualModal: () => void;
  setHasHydrated: (state: boolean) => void;

  // 2. New Actions for Labels
  setWalletLabel: (address: string, label: string) => void;
  removeWalletLabel: (address: string) => void;
  getWalletLabel: (address: string) => string;
}

export const useManualWalletStore = create<ManualWalletState>()(
  persist(
    (set, get) => ({
      metamaskAddress: null,
      manualAddresses: [],
      activeManualAddressIndex: null,
      isConsolidated: false,
      isManualModalOpen: false,
      hasHydrated: false,
      walletLabels: {}, // Initial empty state
      setMetamaskAddress: (address: string|null) => set({ metamaskAddress: address }),
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

        // Capture the address BEFORE removing it from the array
        const addressToRemove = state.manualAddresses[index];

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

        // 3. Cleanup label when wallet is removed
        const newLabels = { ...state.walletLabels };
        if (addressToRemove) {
          delete newLabels[addressToRemove.toLowerCase()];
        }

        set({
          manualAddresses: newAddresses,
          activeManualAddressIndex: newActiveIndex,
          walletLabels: newLabels,
        });

        // Trigger the cleanup in the Activity Store
        if (addressToRemove) {
          useDepositsAndWithdrawalsStore.getState().removeUserActivity(addressToRemove);
        }
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
          walletLabels: {}, // Clear all labels too
        });
      },

      openManualModal: () => set({ isManualModalOpen: true }),
      closeManualModal: () => set({ isManualModalOpen: false }),
      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },

      // --- New Label Actions Implementation ---

      setWalletLabel: (address, label) => {
        const normalizedAddr = address.toLowerCase();
        set((state) => ({
          walletLabels: {
            ...state.walletLabels,
            [normalizedAddr]: label.trim()
          }
        }));
      },

      removeWalletLabel: (address) => {
        const normalizedAddr = address.toLowerCase();
        set((state) => {
          const newLabels = { ...state.walletLabels };
          delete newLabels[normalizedAddr];
          return { walletLabels: newLabels };
        });
      },

      getWalletLabel: (address) => {
        if (!address) return "";
        const labels = get().walletLabels;
        return labels[address.toLowerCase()] || "";
      }
    }),
    {
      name: 'yieldscan-manual-wallet',
      partialize: (state) => ({
        manualAddresses: state.manualAddresses,
        activeManualAddressIndex: state.activeManualAddressIndex,
        isConsolidated: state.isConsolidated,
        walletLabels: state.walletLabels, // 4. Persist Labels
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      }
    }
  )
);