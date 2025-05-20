import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, arbitrum, bsc, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import './index.css';

// Create wagmi config
export const config = createConfig({
  chains: [mainnet, arbitrum, bsc, base],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [bsc.id]: http(),
    [base.id]: http(),
  },
});

// Create a client for TanStack Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
