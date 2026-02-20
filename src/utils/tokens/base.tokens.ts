export default [
  {
    token: 'USDC' as const,
    chain: 'BASE' as const,
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    chainId: 8453, // Base mainnet
    yieldbearingToken: false,
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDT' as const,
    chain: 'BASE' as const, 
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Base USDT
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    yieldbearingToken: false,
    chainId: 8453, // Base mainnet
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'aBasUSDC' as const,
    chain: 'BASE' as const,
    address: '0x4b7cA45bE1610724d9C4B6A29F9713d29aBC4e3C', // Aave v3 aUSDC on Base
    underlyingAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    withdrawContract: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Aave v3 Pool contract on Base
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5760.png',
    chainId: 8453,
    protocol: 'Aave',
    decimals: 6,
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    usdPrice: 1 // Value tracks underlying asset
  },
  {
    token: 'aBasUSDT' as const,
    chain: 'BASE' as const,
    address: '0x17492CeF1a718b94420cA63a5C5eEcF1Df769940', // Aave v3 aUSDT on Base
    underlyingAsset: '0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D', // Base USDT
    withdrawContract: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', // Aave v3 Pool contract on Base
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png',
    chainId: 8453,
    protocol: 'Aave',
    decimals: 6,
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    usdPrice: 1 // Value tracks underlying asset
  },
  {
    token: 'cUSDC' as const,
    chain: 'BASE' as const,
    address: '0x1d0188c4B276A09366D05d6Be06aF61a73bC7535', // Compound III USDC on Base
    underlyingAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    withdrawContract: '0x1d0188c4B276A09366D05d6Be06aF61a73bC7535', // Same as token address for Compound III
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x39AA39c021dfbaE8faC545936693aC917d5E7563/logo.png',
    chainId: 8453,
    protocol: 'Compound',
    yieldBearingToken: true,
    decimals: 8, // cTokens typically have 8 decimals
    maxDecimalsShow: 2,
    usdPrice: 1 // Approximate value; may vary slightly due to interest accrual
  },
  {
    token: 'Radiant USDC' as const,
    chain: 'BASE' as const,
    address: '0x1CD3E2A23C45a690a74E4A4633A1f34893Cf8C2d', // Radiant USDC on Base
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7958.png',
    chainId: 8453,
    withdrawContract: '0x2dADe5b7df9DA3a7e1c9748d169Cd6dFf77e3d01', // Radiant LendingPool on Base
    underlyingAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    protocol: 'Radiant',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6,
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'Radiant USDT' as const,
    chain: 'BASE' as const,
    address: '0xFF8B9c2e5dAf6fe5Ccb4644e457b75DaC997657A', // Radiant USDT on Base
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21106.png',
    chainId: 8453,
    withdrawContract: '0x2dADe5b7df9DA3a7e1c9748d169Cd6dFf77e3d01', // Radiant LendingPool on Base
    underlyingAsset: '0x4A3A6Dd60A34bB2Aba60D73B4C88315E9CeB6A3D', // Base USDT
    protocol: 'Radiant',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6,
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'BASEUSDC+' as const,
    chain: 'BASE' as const,
    address: '0x82120f821954c89cE4eEF92A2278152fE16bBF16', // Morpho Blue USDC+ on Base
    icon: 'https://assets.coingecko.com/coins/images/51339/standard/usdc.png?1730814974',
    chainId: 8453,
    withdrawContract: '0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85', // Morpho Blue on Base
    approvalContract: '0x05498574BD0Fa99eeCB01e1241661E7eE58F8a85', // Morpho Blue on Base
    underlyingAsset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    protocol: 'Morpho Blue',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 18,
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'ETH' as const,
    chain: 'BASE' as const,
    address: '0x4200000000000000000000000000000000000006',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    chainId: 8453,
    yieldBearingToken: false,
    decimals: 18,
    maxDecimalsShow: 4,
    usdPrice: 1,                     
  },
];