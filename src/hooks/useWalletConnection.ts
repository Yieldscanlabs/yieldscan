import { useState, useCallback, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { WalletInfo } from '../types';
import { useManualWalletStore } from '../store/manualWalletStore';

export default function useWalletConnection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { manualAddress, manualChainId, clearManualAddress } = useManualWalletStore();
  
  // Use wagmi hooks for wallet connection
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Create a wallet info object to match your existing implementation
  const effectiveAddress = manualAddress || address || '';
  const wallet: WalletInfo = {
    address: effectiveAddress,
    isConnected: Boolean(isConnected || manualAddress),
    chainId: manualAddress ? (manualChainId ?? 0) : (chainId || 0)
  };

  // If a manual address is active while a wallet is connected, proactively disconnect the wallet
  useEffect(() => {
    if (manualAddress && isConnected) {
      disconnect();
    }
  }, [manualAddress, isConnected, disconnect]);

  // If a real wallet connects while no manual override, prefer the real wallet
  useEffect(() => {
    if (isConnected && address && manualAddress === '') {
      // Nothing to clear; using real wallet
    }
  }, [isConnected, address, manualAddress]);
  
  const openConnectModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const connectWallet = useCallback(() => {
    connect({ connector: injected() });
    closeConnectModal();
  }, [connect, closeConnectModal]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    clearManualAddress();
  }, [disconnect]);

  return {
    wallet,
    isModalOpen,
    openConnectModal,
    closeConnectModal,
    connectWallet,
    disconnectWallet
  };
}