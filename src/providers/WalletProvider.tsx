import { WagmiProvider } from 'wagmi'
// import { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { config } from '../main'

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      {/* <QueryClientProvider client={QueryClient }> */}
        {children}
      {/* </QueryClientProvider> */}
    </WagmiProvider>
  )
}