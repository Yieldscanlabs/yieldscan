import { http, createConfig } from "wagmi";
import { mainnet, arbitrum, bsc, base } from "wagmi/chains";

export const config = createConfig({
  chains: [mainnet, arbitrum, bsc, base],
  transports: {
    [mainnet.id]: http(import.meta.env.VITE_MAINNET_RPC_URL),
    [arbitrum.id]: http(import.meta.env.VITE_ARBITRUM_RPC_URL),
    [bsc.id]: http(import.meta.env.VITE_BSC_RPC_URL),
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL),
  },
});
