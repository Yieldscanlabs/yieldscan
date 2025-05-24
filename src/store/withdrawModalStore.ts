import { create } from 'zustand';
import type { Asset } from '../types';

interface WithdrawModalState {
  isOpen: boolean;
  asset: Asset | null;
  protocol: string;
  balance: number;
  maxDecimals: number;
  isNativeToken: boolean;
  onWithdraw: ((amount: string) => Promise<boolean>) | null;
  onComplete: (() => void) | null;
  
  // Actions
  openModal: (data: {
    asset: Asset;
    protocol: string;
    balance: number;
    maxDecimals: number;
    isNativeToken: boolean;
    onWithdraw: (amount: string) => Promise<boolean>;
    onComplete: () => void;
  }) => void;
  closeModal: () => void;
}

export const useWithdrawModalStore = create<WithdrawModalState>((set) => ({
  isOpen: false,
  asset: null,
  protocol: '',
  balance: 0,
  maxDecimals: 6,
  isNativeToken: false,
  onWithdraw: null,
  onComplete: null,
  
  openModal: (data) => set({
    isOpen: true,
    asset: data.asset,
    protocol: data.protocol,
    balance: data.balance,
    maxDecimals: data.maxDecimals,
    isNativeToken: data.isNativeToken,
    onWithdraw: data.onWithdraw,
    onComplete: data.onComplete,
  }),
  
  closeModal: () => set({
    isOpen: false,
    asset: null,
    protocol: '',
    balance: 0,
    maxDecimals: 6,
    isNativeToken: false,
    onWithdraw: null,
    onComplete: null,
  }),
})); 