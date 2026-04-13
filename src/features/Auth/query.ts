'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';

import AuthAPI from '@/api/AuthAPI';
import { isUnauthorizedApiError } from '@/api/errors';

export const currentUserQueryKey = ['auth', 'me'] as const;

export const currentUserQueryOptions = queryOptions({
  queryKey: currentUserQueryKey,
  queryFn: async () => AuthAPI.me(),
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  throwOnError: (error) => !isUnauthorizedApiError(error)
});

export function useCurrentUserQuery() {
  return useQuery(currentUserQueryOptions);
}
