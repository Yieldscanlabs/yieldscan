import type { Asset } from '../types';
import { useUserPreferencesStore } from '../store/userPreferencesStore';

export const HARD_MIN_USD = 0.1; 
export const SOFT_MIN_USD = 1.00; 

/**
 * Logic for the Wallet Page: Only looks at balanceUsd (dormant)
 */
export const checkIsWalletAssetVisible = (asset: Asset, shouldHideLowValues: boolean) => {
  const balanceUsd = parseFloat(asset.balanceUsd || '0');
  if (balanceUsd < HARD_MIN_USD) return false;
  if (shouldHideLowValues && balanceUsd <= SOFT_MIN_USD) return false;
  return true;
};

/**
 * Logic for the Yield Page: Looks at the HIGHER of wallet or protocol balance
 */
export const checkIsYieldAssetVisible = (asset: Asset, shouldHideLowValues: boolean) => {
  const walletBal = parseFloat(asset.balanceUsd || '0');
  const yieldBal = parseFloat(asset.currentBalanceInProtocolUsd || '0');
  const relevantBalance = Math.max(walletBal, yieldBal);

  if (relevantBalance < HARD_MIN_USD) return false;
  if (shouldHideLowValues && relevantBalance <= SOFT_MIN_USD) return false;
  return true;
};

export function useLowValueFilter() {
  const { hideLowValues, setHideLowValues } = useUserPreferencesStore();

  // For Wallet Page
  const shouldShowWalletAsset = (asset: Asset) => {
    return checkIsWalletAssetVisible(asset, hideLowValues);
  };

  // For Yield Page
  const shouldShowYieldAsset = (asset: Asset) => {
    return checkIsYieldAssetVisible(asset, hideLowValues);
  };

  const isAboveHardDust = (asset: Asset) => {
    return parseFloat(asset.balanceUsd || '0') >= HARD_MIN_USD;
  };

  const isAboveHardYieldDust = (asset: Asset) => {
    return parseFloat(asset.currentBalanceInProtocolUsd || '0') >= HARD_MIN_USD;
  };

  return {
    hideLowValues,
    setHideLowValues,
    shouldShowWalletAsset, // Use this in WalletPage
    shouldShowYieldAsset,  // Use this in MyYieldsPage
    isAboveHardDust,
    isAboveHardYieldDust
  };
}