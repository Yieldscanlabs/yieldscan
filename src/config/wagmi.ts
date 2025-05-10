import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, bsc } from 'wagmi/chains'
import { 
  walletConnect, 
  coinbaseWallet, 
  metaMask 
} from 'wagmi/connectors'
import { QueryClient } from '@tanstack/react-query'

// Create a client for managing caching
export const queryClient = new QueryClient()

// Define your WalletConnect project ID - you'll need to get this from WalletConnect dashboard
const projectId = '8155f91f51cfd21b6c518ca281bfe43e'

// Create config
export const config = createConfig({
  chains: [mainnet, arbitrum, bsc],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
  },
  connectors: [
    metaMask({
        
    }),
    coinbaseWallet({ 
      appName: 'YieldScanner',
    }),
    walletConnect({ 
      projectId,
      showQrModal: true,
      metadata: {
        name: 'YieldScanner',
        description: 'Find the best yield opportunities for your assets across multiple chains',
        url: window.location.origin,
        icons: [`${window.location.origin}/vite.svg`]
      }
    }),
  ],
})