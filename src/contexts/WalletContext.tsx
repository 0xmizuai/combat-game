import React, { createContext, useContext, ReactNode } from 'react';
import { RainbowKitProvider, getDefaultWallets, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client for React Query
const queryClient = new QueryClient();

// Get WalletConnect project ID from environment variables
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID';

// Configure chains & providers
const { connectors } = getDefaultWallets({
  appName: 'MIZU Pool: AI Battle Royale',
  projectId,
});

// Create wagmi config
export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors,
});

// Create context
interface WalletContextType {
  // Add any additional wallet-related functions or state here
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#34a853', // MIZU color
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
        >
          <WalletContext.Provider value={{}}>
            {children}
          </WalletContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 