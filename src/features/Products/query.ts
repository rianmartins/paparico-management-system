'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';

import { isUnauthorizedApiError } from '@/api/errors';
import ProductsService from '@/services/ProductsService';
import type { ListProductsParams, ListProductsResponse } from '@/types/Products';

export const productsQueryKey = ['products'] as const;

function normalizeListProductsParams(params: ListProductsParams = {}): ListProductsParams {
  const normalizedParams: ListProductsParams = {};
  const q = params.q?.trim();

  if (q) {
    normalizedParams.q = q;
  }

  if (typeof params.offset === 'number') {
    normalizedParams.offset = params.offset;
  }

  if (typeof params.limit === 'number') {
    normalizedParams.limit = params.limit;
  }

  return normalizedParams;
}

export function getProductsQueryKey(params: ListProductsParams = {}) {
  const normalizedParams = normalizeListProductsParams(params);

  return Object.keys(normalizedParams).length > 0 ? [...productsQueryKey, normalizedParams] : productsQueryKey;
}

export function createProductsQueryOptions(params: ListProductsParams = {}) {
  const normalizedParams = normalizeListProductsParams(params);
  const shouldRefetchOnUse =
    Boolean(normalizedParams.q) ||
    typeof normalizedParams.offset === 'number' ||
    typeof normalizedParams.limit === 'number';

  return queryOptions({
    queryKey: getProductsQueryKey(normalizedParams),
    queryFn: async () => ProductsService.loadProducts(normalizedParams),
    staleTime: shouldRefetchOnUse ? 0 : Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnMount: shouldRefetchOnUse,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    throwOnError: (error) => !isUnauthorizedApiError(error)
  });
}

export const productsQueryOptions = createProductsQueryOptions();

export type ProductSelector<TData> = (products: ListProductsResponse) => TData;

export function useProductsQuery(params: ListProductsParams = {}) {
  return useQuery(createProductsQueryOptions(params));
}

export function useProductsValue<TData>(selector: ProductSelector<TData>, params: ListProductsParams = {}) {
  return useQuery({
    ...createProductsQueryOptions(params),
    select: selector
  });
}
