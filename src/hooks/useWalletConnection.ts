import { useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { WalletInfo } from '../types';

export default function useWalletConnection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use wagmi hooks for wallet connection
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Create a wallet info object to match your existing implementation
  const wallet: WalletInfo = {
    // address: address || '',
    // address: '0xe7D463DFf4E8c01040DafD137598d006292A7Aa3',
    address: '0x5fbc2F7B45155CbE713EAa9133Dd0e88D74126f6',
    // address: '0xf2cdC57277CD919460E5815DE7084422B45D2DD1',
    // address: '0x933cbA14C63C818eF96a50Ad8b58fc92ebE4CA85',
    isConnected: isConnected || false,
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