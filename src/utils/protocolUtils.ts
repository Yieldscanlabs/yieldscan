import type { SupportedToken } from '../types';
import { PROTOCOL_NAMES } from './constants';
import { AAVE_V3_MARKETS, RADIANT_V3_MARKETS, VENUS_V3_MARKETS, COMPOUND_V3_MARKETS, SPARK_MARKETS, MORPHO_BLUE_MARKETS, FLUID_MARKETS, ROCKET_POOL_MARKETS } from './markets';
import { EigenLayerUtils } from './eigenLayerUtils';

// Mirrors the backend's normalizeKey in server/index.ts exactly -- must stay
// in sync with that function. Multi-word protocol names (e.g. "Cream Finance")
// are stored in the APY table under their space-stripped form ("creamfinance"),
// except "Yearn V3" which is stored under "yearn", not "yearnv3".
export const normalizeProtocolKey = (name: string): string => {
  if (name === 'Yearn V3') return 'yearn';
  return name.toLowerCase().replace(/\s+/g, '');
};

// Reverse of normalizeProtocolKey: turns a raw backend APY-table key (e.g.
// "creamfinance") back into its display name (e.g. "Cream Finance"), for UI
// code that only has the raw key (from Object.entries on APY data) and needs
// something presentable. Matches by running normalizeProtocolKey on every
// PROTOCOL_NAMES value rather than comparing key casing directly, since
// PROTOCOL_NAMES itself mixes ALL_CAPS and camelCase keys inconsistently.
export const resolveProtocolDisplayName = (rawKey: string): string => {
  const match = Object.values(PROTOCOL_NAMES).find(
    (displayName) => normalizeProtocolKey(displayName) === rawKey.toLowerCase(),
  );
  return match ?? rawKey;
};

export const setupProtocol = (protocol: string, token: SupportedToken, chainId: number) => {
    if(protocol === PROTOCOL_NAMES.COMPOUND) {
        return COMPOUND_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.AAVE) {
        return AAVE_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.VENUS) {
      return VENUS_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.RADIANT) {
      return RADIANT_V3_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.LIDO) { 
      return '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
    } else if(protocol === PROTOCOL_NAMES.SPARK) {
      return SPARK_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.MORPHO_BLUE) {
      return MORPHO_BLUE_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.FLUID) {
      console.log('FLUID_MARKETS', FLUID_MARKETS[chainId][token], chainId, token)
      return FLUID_MARKETS[chainId][token] as `0x${string}`;
    } else if(protocol === PROTOCOL_NAMES.EIGENLAYER) {
      // EigenLayer PodManager address (mainnet)
      return EigenLayerUtils.getDefaultPodManagerAddress();
    } else if(protocol === PROTOCOL_NAMES.ROCKET_POOL) {
      return ROCKET_POOL_MARKETS[chainId][token] as `0x${string}`;
    }
    return '0x'
} 