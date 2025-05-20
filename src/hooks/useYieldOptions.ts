import { useState, useEffect } from 'react';
import type { Asset, YieldOption } from '../types';

export default function useYieldOptions(selectedAsset: Asset | null) {
  const [yieldOptions, setYieldOptions] = useState<YieldOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!selectedAsset) {
      setYieldOptions([]);
      return;
    }
    
    const fetchYieldOptions = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch yield options from an API
        // For now, use our mock data function
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching yield options:', error);
        setLoading(false);
      }
    };
    
    fetchYieldOptions();
  }, [selectedAsset]);
  
  return { yieldOptions, loading };
}