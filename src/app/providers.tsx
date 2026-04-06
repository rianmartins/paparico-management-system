'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';

import { ToastProvider } from '@/components/Toast';
import { productsQueryOptions } from '@/features/products';

export type AppProvidersProps = {
  children: ReactNode;
};

function createQueryClient() {
  return new QueryClient();
}

function ProductsQueryWarmup() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.prefetchQuery(productsQueryOptions);
  }, [queryClient]);

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
