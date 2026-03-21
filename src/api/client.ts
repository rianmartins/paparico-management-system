import axios from 'axios';

import { normalizeApiError } from '@/api/errors';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('Missing NEXT_PUBLIC_API_BASE_URL environment variable.');
}

const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error))
);

export function getApiClient() {
  return apiClient;
}

export { apiClient };
