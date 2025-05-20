export default [
  {
    token: 'ETH' as const,
    chain: 'ETH' as const,
    address: '0x',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
    chainId: 1, // mainnet
    yieldBearingToken: false,
    decimals: 18,
    maxDecimalsShow: 8,
    usdPrice: 2500 // Approximate value (will need to be updated dynamically in production)
  },
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
  
  {
    token: 'aUSDC' as const,
    chain: 'ETH' as const,
    address: '0xbcca60bb61934080951369a648fb03df4f96263c', // Ethereum aUSDC v2
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
    token: 'AUSDT' as const,
    chain: 'ETH' as const,
    address: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // Ethereum aUSDC v2
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Aave USDC v3 on Ethereum
    withdrawContract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave v3 withdraw contract
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png',
    chainId: 1, // mainnet
    protocol: 'Aave',
    decimals: 6,
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    usdPrice: 1 // Value tracks underlying asset
  },
  {
    token: 'aUSDT v2' as const,
    chain: 'ETH' as const,
    address: '0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811', // Aave aUSDT v2 on Ethereum
    withdrawContract: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', // Aave v3 withdraw contract
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png',
    chainId: 1, // mainnet
    protocol: 'Aave',
    decimals: 6,
    maxDecimalsShow: 2,
    yieldBearingToken: true,

    usdPrice: 1 // Value tracks underlying asset
  },
  {
    token: 'AWETH' as const,
    chain: 'ETH' as const,
    address: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', 
    withdrawContract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave v3 withdraw contract
    underlyingAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH address
    yieldBearingToken: true,
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png',
    chainId: 1, // mainnet
    protocol: 'Aave',
    decimals: 18,
    maxDecimalsShow: 8,
    usdPrice: 2500 // Value tracks underlying asset
  },
  {
    token: 'cUSDC' as const,
    chain: 'ETH' as const,
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x39AA39c021dfbaE8faC545936693aC917d5E7563/logo.png',
    chainId: 1, // mainnet
    protocol: 'Compound',
    withdrawContract: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', // Aave v3 withdraw contract
    yieldBearingToken: true,
    decimals: 6, // Note: cTokens typically have 8 decimals
    maxDecimalsShow: 2,
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'cUSDT' as const,
    chain: 'ETH' as const,
    address: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', // Compound cUSDT v2 on Ethereum
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9/logo.png',
    chainId: 1, // mainnet
    withdrawContract: '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840', // compound usdt v3 withdraw contract
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    protocol: 'Compound',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },

    {
    token: 'USUALUSDC+' as const,
    chain: 'ETH' as const,
    address: '0xd63070114470f685b75B74D60EEc7c1113d33a3D', // Compound cUSDT v2 on Ethereum
    icon: 'https://assets.coingecko.com/coins/images/51339/standard/usdc.png?1730814974',
    chainId: 1, // mainnet
    withdrawContract: '0x6566194141eefa99Af43Bb5Aa71460Ca2Dc90245', // compound usdt v3 withdraw contract
    approvalContract: '0x4A6c312ec70E8747a587EE860a0353cd42Be0aE0', // compound usdt v3 withdraw contract
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDT
    protocol: 'Morpho Blue',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 18, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },


    {
    token: 'vUSDC' as const,
    chain: 'ETH' as const,
    address: '0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb', // Compound cUSDT v2 on Ethereum
    chainId: 1, // mainnet
    withdrawContract: '0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb', // compound usdt v3 withdraw contract
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDT
    protocol: 'Venus',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 8, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },

      {
    token: 'vUSDT' as const,
    chain: 'ETH' as const,
    address: '0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E', // Compound cUSDT v2 on Ethereum
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7957.png',
    chainId: 1, // mainnet
    withdrawContract: '0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E', // compound usdt v3 withdraw contract
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    protocol: 'Venus',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 8, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },

    {
    token: 'Radiant USDT' as const,
    chain: 'ETH' as const,
    address: '0x3c19d9F2Df0E25C077A637692DA2337D51daf8B7', // Compound cUSDT v2 on Ethereum
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/21106.png',
    chainId: 1, // mainnet
    withdrawContract: '0xA950974f64aA33f27F6C5e017eEE93BF7588ED07', // compound usdt v3 withdraw contract
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    protocol: 'Radiant',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },

      {
    token: 'Radiant USDC' as const,
    chain: 'ETH' as const,
    address: '0x9E85DF2B42b2aE5e666D7263ED81a744a534BF1f', // Compound cUSDT v2 on Ethereum
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7958.png',
    chainId: 1, // mainnet
    withdrawContract: '0xA950974f64aA33f27F6C5e017eEE93BF7588ED07', // compound usdt v3 withdraw contract
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDT
    protocol: 'Radiant',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  {
    token: 'stETH' as const,
    chain: 'ETH' as const,
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', // Lido stETH on Ethereum
    withdrawUri: 'https://stake.lido.fi/withdrawals/request',
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84/logo.png',
    chainId: 1, // mainnet
    protocol: 'Lido',
    yieldBearingToken: true,
    decimals: 18,
    maxDecimalsShow: 6,
    usdPrice: 2500 // Approximate value (will need to be updated dynamically in production)
  }
]