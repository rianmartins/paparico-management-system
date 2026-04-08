'use client';

import type { ReactNode } from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

import { hasStoredSession, subscribeToStoredSession } from '@/auth/session';
import { ToastProvider } from '@/components/Toast';
import { productsQueryKey, productsQueryOptions } from '@/features/products';

export type AppProvidersProps = {
  children: ReactNode;
};

function createQueryClient() {
  return new QueryClient();
}

function ProductsQueryWarmup() {
  const queryClient = useQueryClient();
  const isAuthenticated = useSyncExternalStore(subscribeToStoredSession, hasStoredSession, () => false);

  useEffect(() => {
    if (isAuthenticated) {
      void queryClient.prefetchQuery(productsQueryOptions);
      return;
    }

    queryClient.removeQueries({ queryKey: productsQueryKey });
  }, [isAuthenticated, queryClient]);

  return null;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ProductsQueryWarmup />
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
