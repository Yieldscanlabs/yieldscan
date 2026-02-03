import { useCallback } from 'react';
import { useUserPreferencesStore } from '../store/userPreferencesStore';
import { formatNumber } from '../utils/helpers';

export const useCurrencyFormatter = () => {
  // 1. Subscribe to the store (This triggers the re-render)
  const activeDecimalDigits = useUserPreferencesStore((state) => state.activeDecimalDigits);

  // 2. Return a function that uses the current setting
  const formatValue = useCallback((value: number) => {
    return formatNumber(value, activeDecimalDigits);
  }, [activeDecimalDigits]);

  return formatValue;
};