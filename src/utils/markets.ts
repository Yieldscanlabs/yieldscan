export const AVAILABLE_NETWORKS = [1, 56,42161]

export const COMPOUND_V3_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
    'WETH': '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
    'USDT': '0x3Afdc9BCA9213A35503b077a6072F3D0d5AB0840'
  },
  // Arbitrum
  42161: {
    'USDC': '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf'
  }
};

export const AAVE_V3_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    'WETH': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    'USDT': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    'DAI': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    'WBTC': '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    'ETH': '0xd01607c3C5eCABa394D8be377a08590149325722'
  },
  // Polygon
  137: {
    'USDC': '0x1a13F4Ca1d028320A707D99520AbFefca3998b7F',
    'WETH': '0x28424507fefb6f7f8E9D3860F56504E4e5f5f390',
    'USDT': '0x60D55F02A771d515e077c9C2403a1ef324885CeC',
    'DAI': '0x27F8D03b3a2196956ED754baDc28D73be8830A6e',
    'WBTC': '0x5c2ed810328349100A66B82b78a1791B101C9D61'
  },
  // Arbitrum
  42161: {
    'USDC': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'WETH': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'USDT': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'DAI': '0x625E7708f30cA75bfd92586e17077590C60eb4cD'
  },
  // bnb
  56: {
    'NATIVE': "0x9B00a09492a626678E5A3009982191586C444Df9",
    'USDC': '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
    'USDT': '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
    'wBNB': '0x6807dc923806fE8Fd134338EABCA509979a7e0cB',
  },
  // Avalanche
  43114: {
    'USDC': '0x625E7708f30cA75bfd92586e17077590C60eb4cD',
    'WAVAX': '0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97',
    'USDT': '0x6ab707Aca953eDAeFBc4fD23bA73294241490620'
  },
  // Base
  8453: {
    'USDC': '0x4F086A048C33f3BF9011dd2265861ce812624F2c',
    'WETH': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  }
};

export const VENUS_V3_MARKETS: Record<number, Record<string, string>> = {
  // BSC
  56: {
    'USDT': '0x4978591f17670A846137d9d613e333C38dc68A37',
    'USDC': '0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8',
    'wBNB': '0xe10E80B7FD3a29fE46E16C30CC8F4dd938B742e2',
    'DAI': '0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1',
  },
  // Ethereum
    1: {
        'USDC': '0x17c07e0c232f2f80dfdbd7a95b942d893a4c5acb',
        'USDT': '0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E',
    }
}

export const RADIANT_V3_MARKETS: Record<number, Record<string, string>> = {
  // BSC
  // Ethereum
    1: {
        // 'USDC': '0x17c07e0c232f2f80dfdbd7a95b942d893a4c5acb',
        'USDT': '0xA950974f64aA33f27F6C5e017eEE93BF7588ED07',
        "USDC": "0xA950974f64aA33f27F6C5e017eEE93BF7588ED07"
    },
    56: {
      "wBNB": ""
    }
}

export const LIDO_V3_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum
  1: {
    'ETH': '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
  }
}
export const SPARK_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum
  1: {
    'USDC': '0xBc65ad17c5C0a2A4D159fa5a503f4992c7B545FE'
  }
}

export const MORPHO_BLUE_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0xd63070114470f685b75B74D60EEc7c1113d33a3D'
  }
}

export const FLUID_MARKETS: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    'USDC': '0x9Fb7b4477576Fe5B32be4C1843aFB1e55F251B33'
  }
}