'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { currentUserQueryKey, currentUserQueryOptions } from '@/features/Auth/query';
import { hasStoredSession, subscribeToStoredSession } from '@/features/Auth/session';
import productsStore from '@/store/ProductsStore';

export default function AppWarmup() {
  const queryClient = useQueryClient();
  const isAuthenticated = useSyncExternalStore(subscribeToStoredSession, hasStoredSession, () => false);

  useEffect(() => {
    if (isAuthenticated) {
      void queryClient.prefetchQuery(currentUserQueryOptions);
      void productsStore.loadProducts();
      return;
    }

    queryClient.removeQueries({ queryKey: currentUserQueryKey });
    productsStore.reset();
  }, [isAuthenticated, queryClient]);

  return null;
}
