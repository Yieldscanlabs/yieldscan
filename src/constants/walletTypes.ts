export const WALLET_TYPES = {
  METAMASK: "metamask",
  RABBY: "rabby",
  PHANTOM: "phantom",
  MANUAL: "manual",
} as const;

export type WalletType = (typeof WALLET_TYPES)[keyof typeof WALLET_TYPES];
