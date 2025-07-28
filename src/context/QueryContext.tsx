
import React from 'react';
import { QueryClient as TanstackQueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new TanstackQueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
