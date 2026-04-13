'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { hasStoredSession, subscribeToStoredSession } from '@/features/Auth/session';
import { productsQueryKey, productsQueryOptions } from '@/features/Products';

export default function AppWarmup() {
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
