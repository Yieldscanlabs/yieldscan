import { ProtocolAdapter } from './types';
import { AaveAdapter } from './aave';
import { CompoundAdapter } from './compound';

/**
 * Registry of all supported protocol adapters
 */
export const protocolRegistry: Record<string, ProtocolAdapter> = {
  [AaveAdapter.name]: AaveAdapter,
  [CompoundAdapter.name]: CompoundAdapter,
  // Add other adapters as they are implemented
};

/**
 * Get a protocol adapter by name
 * @param name Protocol name
 * @returns Protocol adapter or undefined if not found
 */
export function getProtocol(name: string): ProtocolAdapter | undefined {
  return protocolRegistry[name];
}

/**
 * Get all available protocols
 * @returns Array of protocol adapters
 */
export function getAllProtocols(): ProtocolAdapter[] {
  return Object.values(protocolRegistry);
}