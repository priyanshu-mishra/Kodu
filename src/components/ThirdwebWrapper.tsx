import React, { useState, useEffect } from 'react';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { THIRDWEB_CONFIG, SUPPORTED_CHAINS } from '../config/thirdweb';

interface ThirdwebWrapperProps {
  children: React.ReactNode;
}

const ThirdwebWrapper: React.FC<ThirdwebWrapperProps> = ({ children }) => {
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);

  useEffect(() => {
    // Create QueryClient after component mounts
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes
        },
        mutations: {
          retry: 1,
        },
      },
    });
    
    setQueryClient(client);
  }, []);

  if (!queryClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider
        clientId={THIRDWEB_CONFIG.clientId}
        activeChain={THIRDWEB_CONFIG.activeChain}
        supportedChains={SUPPORTED_CHAINS}
      >
        {children}
      </ThirdwebProvider>
    </QueryClientProvider>
  );
};

export default ThirdwebWrapper;
