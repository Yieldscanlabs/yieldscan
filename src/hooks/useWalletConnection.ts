import { useState, useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import type { WalletInfo } from "../types";
import { fetchNewTransactions } from "../store/assetStore";

export default function useWalletConnection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Use wagmi hooks for wallet connection
  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  // Create a wallet info object to match your existing implementation
  const wallet: WalletInfo = {
    address: address || "",
    isConnected: isConnected || false,
    chainId: chainId || 0,
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
    fetchNewTransactions(address as string, chainId as any);
  }, [connect, closeConnectModal, address, chainId]);
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    wallet,
    isModalOpen,
    openConnectModal,
    closeConnectModal,
    connectWallet,
    disconnectWallet,
  };
}