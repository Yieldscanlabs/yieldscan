import { useState, useEffect } from 'react';
import type { Asset } from '../types';
import { MOCK_ASSETS } from '../utils/constants';

export default function useAssets(walletAddress: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!walletAddress) {
      setAssets([]);
      return;
    }
    
    const fetchAssets = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch the user's assets from an API
        // For now, use our mock data
        setTimeout(() => {
          setAssets(MOCK_ASSETS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, [walletAddress]);
  
  return { assets, loading };
}