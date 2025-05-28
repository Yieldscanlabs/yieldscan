import type { SupportedToken } from '../types';
import { PROTOCOL_NAMES } from './constants';
import { AAVE_V3_MARKETS, RADIANT_V3_MARKETS, VENUS_V3_MARKETS, COMPOUND_V3_MARKETS, SPARK_MARKETS, MORPHO_BLUE_MARKETS, FLUID_MARKETS, ROCKET_POOL_MARKETS } from './markets';
import { EigenLayerUtils } from './eigenLayerUtils';

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