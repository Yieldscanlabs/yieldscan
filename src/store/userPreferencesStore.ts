import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 'cards' | 'table';

interface UserPreferencesState {
  // View preferences for different pages
  yieldsPageView: ViewType;
  walletPageView: ViewType;
  hideLowValues: boolean;
  activeDecimalDigits: number;
  // Actions
  setYieldsPageView: (view: ViewType) => void;
  setWalletPageView: (view: ViewType) => void;
  resetPreferences: () => void;
  setHideLowValues: (hide: boolean) => void;
  setActiveDecimalDigits: (digits: number) => void;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Default preferences
      yieldsPageView: 'cards',
      walletPageView: 'cards',
      hideLowValues: true,
      activeDecimalDigits: 2, 

      // Actions
      setYieldsPageView: (view: ViewType) =>
        set({ yieldsPageView: view }),

      setWalletPageView: (view: ViewType) =>
        set({ walletPageView: view }),

      resetPreferences: () =>
        set({
          yieldsPageView: 'cards',
          walletPageView: 'cards'
        }),
      setHideLowValues: (hide) => set({ hideLowValues: hide }),
      setActiveDecimalDigits: (digits) => set({ activeDecimalDigits: digits }),
    }),
    {
      name: 'yieldscan-user-preferences',
      partialize: (state) => ({
        yieldsPageView: state.yieldsPageView,
        walletPageView: state.walletPageView,
        hideLowValues: state.hideLowValues,
        activeDecimalDigits: state.activeDecimalDigits,
      }),
    }
  )
); 