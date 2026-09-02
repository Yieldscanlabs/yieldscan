import { PROTOCOL_NAMES } from '../utils/constants';

export interface BestApyResult {
  bestApy: number | null;
  bestProtocol: typeof PROTOCOL_NAMES[keyof typeof PROTOCOL_NAMES] | null;
  aaveApy: number | null;
  compoundApy: number | null;
  loading: boolean;
  error: string | null;
}
