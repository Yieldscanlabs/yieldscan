import type { Asset, YieldOption } from '../types';

export const CHAIN_NAMES = {
  ETH: 'Ethereum',
  BSC: 'BNB Chain',
  ARBITRUM_ONE: 'Arbitrum One'
};

export const TOKEN_NAMES = {
  USDC: 'USD Coin',
  USDT: 'Tether',
  BTC: 'Bitcoin',
  ETH: 'Ethereum'
};

// Mock data
export const MOCK_ASSETS: Asset[] = [
  {
    token: 'USDC',
    chain: 'ETH',
    balance: '1000.00',
    balanceUsd: '1000.00',
    icon: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  {
    token: 'ETH',
    chain: 'ETH',
    balance: '2.5',
    balanceUsd: '5000.00',
    icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    token: 'USDT',
    chain: 'ETH',
    balance: '500.00',
    balanceUsd: '500.00',
    icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    token: 'BTC',
    chain: 'ARBITRUM_ONE',
    balance: '0.05',
    balanceUsd: '2000.00',
    icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  }
];

export const MOCK_YIELD_OPTIONS: YieldOption[] = [
  {
    id: '1',
    protocol: 'Aave',
    token: 'USDC',
    chain: 'ETH',
    apy: 3.5,
    tvl: '$500M',
    risk: 'Low',
    lockupDays: 0
  },
  {
    id: '2',
    protocol: 'Compound',
    token: 'USDC',
    chain: 'ETH',
    apy: 4.2,
    tvl: '$300M',
    risk: 'Low',
    lockupDays: 0
  },
  {
    id: '3',
    protocol: 'Venus',
    token: 'USDT',
    chain: 'BSC',
    apy: 5.8,
    tvl: '$200M',
    risk: 'Medium',
    lockupDays: 7
  },
  {
    id: '4',
    protocol: 'GMX',
    token: 'ETH',
    chain: 'ARBITRUM_ONE',
    apy: 8.2,
    tvl: '$150M',
    risk: 'Medium',
    lockupDays: 0
  },
  {
    id: '5',
    protocol: 'Radiant',
    token: 'BTC',
    chain: 'ARBITRUM_ONE',
    apy: 2.8,
    tvl: '$80M',
    risk: 'Low',
    lockupDays: 14
  },
  {
    id: '6',
    protocol: 'Aave',
    token: 'USDT',
    chain: 'ETH',
    apy: 3.1,
    tvl: '$250M',
    risk: 'Low',
    lockupDays: 0
  }
];