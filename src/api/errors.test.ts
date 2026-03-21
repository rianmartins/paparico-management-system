import { describe, expect, it } from 'vitest';

import {
  ApiError,
  BadRequestError,
  NetworkError,
  NotFoundError,
  ServerError,
  ValidationError,
  normalizeApiError
} from '@/api/errors';

function createAxiosError(status?: number, data?: unknown) {
  return {
    isAxiosError: true,
    message: 'Axios error',
    toJSON: () => ({ message: 'Axios error' }),
    response:
      typeof status === 'number'
        ? {
            status,
            data
          }
        : undefined
  };
}

describe('normalizeApiError', () => {
  it('maps transport failures to NetworkError', () => {
    const normalized = normalizeApiError(createAxiosError());

    expect(normalized).toBeInstanceOf(NetworkError);
    expect(normalized.status).toBe(0);
    expect(normalized.message).toBe('The backend is unreachable. Check your connection and try again.');
  });

  it('maps 400 responses to BadRequestError', () => {
    const normalized = normalizeApiError(
      createAxiosError(400, {
        code: 'BAD_REQUEST',
        message: 'Invalid query',
        details: { field: 'page' }
      })
    );

    expect(normalized).toBeInstanceOf(BadRequestError);
    expect(normalized.status).toBe(400);
    expect(normalized.code).toBe('BAD_REQUEST');
    expect(normalized.message).toBe('Invalid query');
    expect(normalized.details).toEqual({ field: 'page' });
  });

  it('maps 404 responses to NotFoundError', () => {
    const normalized = normalizeApiError(
      createAxiosError(404, {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found'
      })
    );

    expect(normalized).toBeInstanceOf(NotFoundError);
    expect(normalized.status).toBe(404);
    expect(normalized.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('maps 422 responses to ValidationError', () => {
    const normalized = normalizeApiError(
      createAxiosError(422, {
        errors: {
          name: ['Name is required']
        }
      })
    );

    expect(normalized).toBeInstanceOf(ValidationError);
    expect(normalized.status).toBe(422);
    expect(normalized.details).toEqual({
      name: ['Name is required']
    });
  });

  it('maps 500 responses to ServerError', () => {
    const normalized = normalizeApiError(createAxiosError(500, { message: 'Unexpected failure' }));

    expect(normalized).toBeInstanceOf(ServerError);
    expect(normalized.status).toBe(500);
    expect(normalized.message).toBe('Unexpected failure');
  });

  it('maps unknown failures to ApiError', () => {
    const normalized = normalizeApiError(new Error('Boom'));

    expect(normalized).toBeInstanceOf(ApiError);
    expect(normalized.message).toBe('Boom');
  });
});
