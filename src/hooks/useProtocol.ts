import { useState, useEffect, useCallback } from 'react';
import { getProtocol } from '../protocols/registry';
import type { ProtocolAdapter, ApyInfo, DepositResponse, WithdrawResponse } from '../protocols/types';

interface UseProtocolOptions {
  protocolName: string;
  tokenAddress: string;
  chainId: number;
}

interface UseProtocolResult {
  protocol: ProtocolAdapter | null;
  apy: number | null;
  deposit: (amount: string) => Promise<DepositResponse>;
  withdraw: (amount: string) => Promise<WithdrawResponse>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for interacting with a specific protocol's deposit and withdraw functions
 */
export function useProtocol({ 
  protocolName, 
  tokenAddress, 
  chainId 
}: UseProtocolOptions): UseProtocolResult {
  const [apy, setApy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the protocol adapter
  const protocol = protocolName ? getProtocol(protocolName) : null;
  
  // Function to fetch APY
  const fetchApy = useCallback(async () => {
    if (!protocol || !tokenAddress || !chainId) {
      setError('Missing required parameters');
      return;
    }
    
    setLoading(true);
    try {
      const apyInfo = await protocol.getApy(tokenAddress, chainId);
      setApy(apyInfo.value);
      setError(apyInfo.error);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch APY');
    } finally {
      setLoading(false);
    }
  }, [protocol, tokenAddress, chainId]);
  
  // Fetch APY on mount and when dependencies change
  useEffect(() => {
    if (protocol && tokenAddress && chainId) {
      fetchApy();
    }
  }, [protocol, tokenAddress, chainId, fetchApy]);
  
  // Wrapper function for deposit
  const deposit = useCallback(async (amount: string): Promise<DepositResponse> => {
    if (!protocol) {
      return { success: false, txHash: null, error: 'Protocol not found' };
    }
    
    setLoading(true);
    try {
      const result = await protocol.deposit(tokenAddress, amount, chainId);
      if (!result.success) {
        setError(result.error || 'Deposit failed');
      }
      return result;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error during deposit';
      setError(errorMsg);
      return { success: false, txHash: null, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [protocol, tokenAddress, chainId]);
  
  // Wrapper function for withdraw
  const withdraw = useCallback(async (amount: string): Promise<WithdrawResponse> => {
    if (!protocol) {
      return { success: false, txHash: null, error: 'Protocol not found' };
    }
    
    setLoading(true);
    try {
      const result = await protocol.withdraw(tokenAddress, amount, chainId);
      if (!result.success) {
        setError(result.error || 'Withdrawal failed');
      }
      return result;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error during withdrawal';
      setError(errorMsg);
      return { success: false, txHash: null, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [protocol, tokenAddress, chainId]);
  
  return {
    protocol,
    apy,
    deposit,
    withdraw,
    loading,
    error
  };
}