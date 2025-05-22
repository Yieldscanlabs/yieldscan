import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface PriceState {
  prices: Record<string, number>; // token symbol (lowercase) -> price in USD
  lastUpdated: Record<string, number>; // token symbol -> timestamp of last update
  isLoading: boolean;
  error: string | null;
  
  // Methods
  fetchPrices: () => Promise<void>;
  getPrice: (symbol: string) => number | null;
  getLastUpdated: (symbol: string) => number | null;
}

export const usePriceStore = create<PriceState>()(
  persist(
    (set, get) => ({
      prices: {},
      lastUpdated: {},
      isLoading: false,
      error: null,

      fetchPrices: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
          const allPrices = response.data;
          
          // Create a direct map of token symbols to prices
          const updatedPrices: Record<string, number> = {};
          const updatedLastUpdated: Record<string, number> = {};
          const now = Date.now();
          
          allPrices.forEach((item: { symbol: string, price: string }) => {
            // Only process USDT pairs
            if (item.symbol.endsWith('USDT')) {
              // Extract token symbol by removing USDT
              const tokenSymbol = item.symbol.replace('USDT', '').toLowerCase();
              const price = parseFloat(item.price);
              
              // Store price directly by symbol
              updatedPrices[tokenSymbol] = price;
              updatedLastUpdated[tokenSymbol] = now;
            }
          });
          
          set((state) => ({
            prices: {
              ...state.prices,
              ...updatedPrices
            },
            lastUpdated: {
              ...state.lastUpdated,
              ...updatedLastUpdated
            },
            isLoading: false
          }));
        } catch (error) {
          console.error('Error fetching prices:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Unknown error fetching prices' 
          });
        }
      },
      
      getPrice: (symbol: string) => {
        let symbolLower = symbol.toLowerCase();
        let symb = symbolLower === 'weth' ? 'eth' : symbolLower === 'wbtc' ? 'btc' : symbolLower === 'wbnb' ? 'bnb' : symbolLower;
        const { prices } = get();
        return prices[symb.toLowerCase()] || null;
      },
      
      getLastUpdated: (symbol: string) => {
        const { lastUpdated } = get();
        return lastUpdated[symbol.toLowerCase()] || null;
      },
    }),
    {
      name: 'price-store',
      partialize: (state) => ({
        prices: state.prices,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Set up polling to regularly update prices
let priceUpdateInterval: NodeJS.Timeout | null = null;

// Function to start polling
const startPricePolling = (intervalMs = 600000) => {
  // Fetch immediately
  usePriceStore.getState().fetchPrices();
  
  // Then set up interval
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }
  
  priceUpdateInterval = setInterval(() => {
    usePriceStore.getState().fetchPrices();
  }, intervalMs);
};

// Function to stop polling
const stopPricePolling = () => {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
    priceUpdateInterval = null;
  }
};

// Initialize price polling when in browser environment
if (typeof window !== 'undefined') {
  startPricePolling();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    stopPricePolling();
  });
}

// Export polling control functions
export { startPricePolling, stopPricePolling };