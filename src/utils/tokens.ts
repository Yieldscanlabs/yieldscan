const tokens = [
  {
    token: 'USDC' as const,
    chain: 'ETH' as const,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDC
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    chainId: 1, // mainnet
    yieldbearingToken: false,
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDT' as const,
    chain: 'ETH' as const, 
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    yieldbearingToken: false,
    chainId: 1, // mainnet
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDC' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8/logo.png',
    yieldbearingToken: false,
    chainId: 42161, // arbitrum
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  {
    token: 'USDT' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum USDT
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png',
    yieldbearingToken: false,
    chainId: 42161, // arbitrum
    decimals: 6,
    maxDecimalsShow: 2,
    usdPrice: 1 // Stablecoin pegged to USD
  },
  // Aave aTokens on Ethereum
  {
    token: 'aUSDC' as const,
    chain: 'ETH' as const,
    address: '0xbcca60bb61934080951369a648fb03df4f96263c', // Ethereum aUSDC
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Aave USDC v3 on Ethereum
    withdrawContract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave v3 withdraw contract
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5760.png',
    chainId: 1, // mainnet
    protocol: 'Aave',
    decimals: 6,
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    usdPrice: 1 // Value tracks underlying asset
  },
  {
    token: 'aUSDT' as const,
    chain: 'ETH' as const,
    address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', // Aave aUSDT v2 on Ethereum
    withdrawContract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave v3 withdraw contract
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png',
    chainId: 1, // mainnet
    protocol: 'Aave',
    decimals: 6,
    maxDecimalsShow: 2,
    yieldBearingToken: true,

    usdPrice: 1 // Value tracks underlying asset
  },
  // Compound cTokens on Ethereum
  {
    token: 'cUSDC' as const,
    chain: 'ETH' as const,
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563', // 
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x39AA39c021dfbaE8faC545936693aC917d5E7563/logo.png',
    chainId: 1, // mainnet
    protocol: 'Compound',
    yieldBearingToken: true,
    decimals: 8, // Note: cTokens typically have 8 decimals
    maxDecimalsShow: 2,
    usdPrice: 0.02 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'cUSDT' as const,
    chain: 'ETH' as const,
    address: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // Compound cUSDT v2 on Ethereum
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9/logo.png',
    chainId: 1, // mainnet
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    protocol: 'Compound',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 8, // Note: cTokens typically have 8 decimals
    usdPrice: 0.02 // Approximate value (will need to be updated dynamically in production)
  },
  // Compound cTokens on Arbitrum One
  {
    token: 'cUSDC' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // Compound cUSDC v3 on Arbitrum
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x39AA39c021dfbaE8faC545936693aC917d5E7563/logo.png', // Using Ethereum icon
    chainId: 42161, // arbitrum
    underlyingAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
    protocol: 'Compound',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 8, // Note: cTokens typically have 8 decimals
    usdPrice: 0.02 // Approximate value (will need to be updated dynamically in production)
  },
  // {
  //   token: 'cUSDT' as const,
  //   chain: 'ARBITRUM_ONE' as const,
  //   address: '0x202e8d15BEa502bF92E2E2336E308c502445bbbB', // Compound cUSDT v3 on Arbitrum
  //   icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9/logo.png', // Using Ethereum icon
  //    protocol: 'Compound',
  //   chainId: 42161, // arbitrum
  //   yieldBearingToken: true,
  //   maxDecimalsShow: 2,
  //   decimals: 8, // Note: cTokens typically have 8 decimals
  //   usdPrice: 0.02 // Approximate value (will need to be updated dynamically in production)
  // }
];

export default tokens