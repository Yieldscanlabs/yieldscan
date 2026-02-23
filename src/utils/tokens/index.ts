import ethTokens from "./eth.tokens";
import bnbTokens from "./bnb.tokens";
import baseTokens from "./base.tokens";

const tokens = [
  ...ethTokens,
  // Compound cTokens on Arbitrum One
  {
    token: 'cUSDC' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // Compound cUSDC v3 on Arbitrum
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x39AA39c021dfbaE8faC545936693aC917d5E7563/logo.png', // Using Ethereum icon
    chainId: 42161, // arbitrum
    underlyingAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
    withdrawContract: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf', // Compound cUSDC v3 withdraw contract
    protocol: 'Compound',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  // {
  //   token: 'cUSDT' as const,
  //   chain: 'ARBITRUM_ONE' as const,
  //   address: '0x202e8d15BEa502bF92E2E2336E308c502445bbbB', // Compound cUSDT v3 on Arbitrum
  //   icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9/logo.png', // Using Ethereum icon
  //    protocol: 'Compound',
  //   chainId: 42161, // arbitrum
  //   yieldBearingToken: true,
  // withdrawcontract: '0xd98Be00b5D27fc98112BdE293e487f8D4cA57d07', // Compound cUSDT v3 withdraw contract
  //   maxDecimalsShow: 2,
  //   decimals: 8, // Note: cTokens typically have 8 decimals
  //   usdPrice: 0.02 // Approximate value (will need to be updated dynamically in production)
  // }
    {
    token: 'aArbUSDT' as const,
    chain: 'ARBITRUM_ONE' as const,
    address: '0x6ab707Aca953eDAeFBc4fD23bA73294241490620', // Compound cUSDC v3 on Arbitrum
    icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5761.png', // Using Ethereum icon
    chainId: 42161, // arbitrum
    underlyingAsset: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum USDC
    withdrawContract: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Compound cUSDC v3 withdraw contract
    protocol: 'Aave',
    yieldBearingToken: true,
    maxDecimalsShow: 2,
    decimals: 6, // Note: cTokens typically have 8 decimals
    usdPrice: 1 // Approximate value (will need to be updated dynamically in production)
  },
  ...bnbTokens,
  ...baseTokens
];

export default tokens