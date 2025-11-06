import { useState, useCallback, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { WalletInfo } from '../types';
import { useManualWalletStore } from '../store/manualWalletStore';

export default function useWalletConnection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { manualAddresses, activeManualAddressIndex, clearAllManualAddresses } = useManualWalletStore();

  // Use wagmi hooks for wallet connection
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Determine effective address based on active wallet
  const effectiveAddress = useMemo(() => {
    // If activeManualAddressIndex is set, use that manual address
    if (activeManualAddressIndex !== null && manualAddresses[activeManualAddressIndex]) {
      return manualAddresses[activeManualAddressIndex];
    }
    // Otherwise, use MetaMask address if connected
    return address || '';
  }, [activeManualAddressIndex, manualAddresses, address]);

  // Determine if we have any wallet connection (manual or MetaMask)
  const hasConnection = useMemo(() => {
    return Boolean(isConnected || (manualAddresses.length > 0 && activeManualAddressIndex !== null));
  }, [isConnected, manualAddresses.length, activeManualAddressIndex]);

  const wallet: WalletInfo = {
    address: effectiveAddress,
    isConnected: hasConnection,
    chainId: chainId || 0
  };

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
    clearAllManualAddresses();
  }, [disconnect, clearAllManualAddresses]);

  return {
    wallet,
    isModalOpen,
    openConnectModal,
    closeConnectModal,
    connectWallet,
    disconnectWallet
  };
}