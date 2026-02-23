// Chain mappings
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  56: 'BNB Chain',
  8453: 'Base',
  // Add more chains as needed
};

/**
 * Gets a readable chain name from a chain ID
 * @param chainId The blockchain network ID
 * @returns The human-readable chain name
 */
export const getChainName = (chainId: number): string => {
  return CHAIN_NAMES[chainId] || `Chain #${chainId}`;
};