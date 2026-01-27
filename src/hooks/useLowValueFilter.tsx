import type { Asset } from '../types';
import { useUserPreferencesStore } from '../store/userPreferencesStore';

export const HARD_MIN_USD = 0.1; // Assets below this are NEVER shown (0.10)
export const SOFT_MIN_USD = 1.00; // Assets below this are hidden when checkbox is checked (1.00)

/**
 * Pure function to check visibility.
 * Useful when we need to check visibility based on a state that isn't the hook's own state
 * (e.g., inside a loop of wallets where each has its own boolean flag).
 */
export const checkIsAssetVisible = (asset: Asset, shouldHideLowValues: boolean) => {
  const balanceUsd = parseFloat(asset.balanceUsd || '0');

  // 1. Hard Rule: Always hide dust (< $0.10)
  if (balanceUsd < HARD_MIN_USD) {
    return false;
  }

  // 2. Soft Rule: If checked, hide low values (<= $1.00)
  if (shouldHideLowValues && balanceUsd <= SOFT_MIN_USD) {
    return false;
  }

  return true;
};

export function useLowValueFilter() {
  const { hideLowValues, setHideLowValues } = useUserPreferencesStore();

  const shouldShowAsset = (asset: Asset) => {
    return checkIsAssetVisible(asset, hideLowValues);
  };

  const isAboveHardDust = (asset: Asset) => {
    return parseFloat(asset.balanceUsd || '0') >= HARD_MIN_USD;
  };

  const isAboveHardYieldDust = (asset: Asset) => {
    // Check the actual amount earning yield, not just what's in the wallet
    return parseFloat(asset.currentBalanceInProtocolUsd || '0') >= HARD_MIN_USD;
  };

  return {
    hideLowValues,
    setHideLowValues,
    shouldShowAsset,
    isAboveHardDust,
    isAboveHardYieldDust
  };
}