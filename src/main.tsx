import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, HashRouter } from 'react-router-dom';
import { http, createConfig, WagmiProvider } from 'wagmi';
import { mainnet, arbitrum, bsc, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './router';
import './styles/variables.css';
import './index.css';
import './App.css';

// Create wagmi config
export const config = createConfig({
  chains: [mainnet, arbitrum, bsc, base],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC_URL),
    [bsc.id]: http(import.meta.env.VITE_BSC_RPC_URL),
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
  },
});

// Create a query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
