import { Wallet } from "lucide-react";
import React from "react";
import { WALLET_TYPES, type WalletType } from "../constants/walletTypes";

export function detectWalletType(
  connectorId?: string,
  connectorName?: string,
): WalletType {
  const id = (connectorId ?? "").toLowerCase();
  const name = (connectorName ?? "").toLowerCase();

  if (id.includes(WALLET_TYPES.RABBY) || name.includes(WALLET_TYPES.RABBY))
    return WALLET_TYPES.RABBY;
  if (id.includes(WALLET_TYPES.PHANTOM) || name.includes(WALLET_TYPES.PHANTOM))
    return WALLET_TYPES.PHANTOM;
  if (
    id.includes(WALLET_TYPES.METAMASK) ||
    name.includes(WALLET_TYPES.METAMASK)
  )
    return WALLET_TYPES.METAMASK;

  return WALLET_TYPES.MANUAL;
}

export function getWalletIcon(type: WalletType): React.ReactNode {
  switch (type) {
    case WALLET_TYPES.METAMASK:
      return <span>🦊</span>;
    case WALLET_TYPES.RABBY:
      return <img src="/icons/rabby.png" width={16} height={16} alt="Rabby" />;
    case WALLET_TYPES.PHANTOM:
      return (
        <img src="/icons/phantom.svg" width={16} height={16} alt="Phantom" />
      );
    default:
      return <Wallet size={16} />;
  }
}

export function getWalletLabel(type: WalletType): string {
  switch (type) {
    case WALLET_TYPES.METAMASK:
      return "MetaMask";
    case WALLET_TYPES.RABBY:
      return "Rabby";
    case WALLET_TYPES.PHANTOM:
      return "Phantom";
    default:
      return "Manual";
  }
}
