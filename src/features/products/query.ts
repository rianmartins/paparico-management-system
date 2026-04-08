'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';

import { isUnauthorizedApiError } from '@/api/errors';
import ProductsService from '@/service/ProductsService';
import type { ListProductsResponse } from '@/types/Products';

export const productsQueryKey = ['products'] as const;

export const productsQueryOptions = queryOptions({
  queryKey: productsQueryKey,
  queryFn: async () => ProductsService.listProducts(),
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  throwOnError: (error) => !isUnauthorizedApiError(error)
});

export type ProductSelector<TData> = (products: ListProductsResponse) => TData;

export function useProductsQuery() {
  return useQuery(productsQueryOptions);
}

export function useProductsValue<TData>(selector: ProductSelector<TData>) {
  return useQuery({
    ...productsQueryOptions,
    select: selector
  });
}
