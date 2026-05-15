/**
 * RPC endpoint lists per chain ID.
 * Multiple endpoints are provided per chain so polling can
 * fall back to the next one if a node is slow or unresponsive.
 */
export const RPC_URLS: Record<number, string[]> = {
  56: [
    "https://bsc-rpc.publicnode.com",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed1.binance.org",
    "https://bsc-dataseed2.binance.org",
    "https://bsc-dataseed3.binance.org",
    "https://bsc-dataseed4.binance.org",
    "https://bsc-rpc.publicnode.com",
  ],
  1: [
    "https://rpc.ankr.com/eth",
    "https://ethereum.publicnode.com",
    "https://eth.drpc.org",
    "https://eth.rpc.blxrbdn.com",
    "https://cloudflare-eth.com",
  ],
  42161: [
    "https://arb1.arbitrum.io/rpc",
    "https://arbitrum-one-public.nodies.app",
    "https://arbitrum.meowrpc.com",
    "https://arbitrum.public-rpc.com",
  ],
  8453: [
    "https://base-rpc.publicnode.com",
    "https://base-public.nodies.app",
    "https://base-mainnet.gateway.tatum.io",
    "https://mainnet.base.org",
    "https://base.publicnode.com",
  ],
};

// Maximum uint256 value used for unlimited token approvals
export const MAX_UINT256 = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

// Number of polling attempts before giving up on finding a transaction receipt
export const POLLING_ATTEMPTS = 30;

// Milliseconds to wait between each round of RPC polling attempts
export const POLLING_INTERVAL_MS = 2000;

// Milliseconds to wait after switching chains to allow MetaMask to settle
export const CHAIN_SWITCH_DELAY_MS = 500;

// Milliseconds to wait for MetaMask provider before falling back to RPC polling
export const METAMASK_WAIT_TIMEOUT_MS = 30000;
