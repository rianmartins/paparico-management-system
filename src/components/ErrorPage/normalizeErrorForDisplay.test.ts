import { describe, expect, it } from 'vitest';

import { ApiError } from '@/api/errors';

import { normalizeErrorForDisplay } from './normalizeErrorForDisplay';

describe('normalizeErrorForDisplay', () => {
  it('normalizes ApiError diagnostics into safe display data', () => {
    const result = normalizeErrorForDisplay(
      new ApiError({
        status: 500,
        code: 'HTTP_500',
        message: 'The server could not process the request.'
      }),
      { label: 'Route', value: '/products' }
    );

    expect(result.title).toBe('We could not load this page');
    expect(result.description).toBe('The backend failed while preparing this page. Try again in a moment.');
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        { label: 'Route', value: '/products' },
        { label: 'Type', value: 'ApiError' },
        { label: 'Status', value: '500' },
        { label: 'Code', value: 'HTTP_500' }
      ])
    );
  });

  it('normalizes generic Error instances', () => {
    const result = normalizeErrorForDisplay(new Error('Unexpected client crash'));

    expect(result.title).toBe('Something went wrong');
    expect(result.description).toBe(
      'An unexpected error interrupted this page. Try again, or return to the dashboard.'
    );
    expect(result.diagnostics).toEqual([{ label: 'Type', value: 'Error' }]);
  });

  it('returns fallback messaging when the error has no usable details', () => {
    const result = normalizeErrorForDisplay(null);

    expect(result.title).toBe('Something went wrong');
    expect(result.description).toBe(
      'An unexpected error interrupted this page. Try again, or return to the dashboard.'
    );
    expect(result.diagnostics).toEqual([]);
  });

  it('extracts a Next.js digest-only error reference', () => {
    const result = normalizeErrorForDisplay({ digest: 'abc123digest' });

    expect(result.diagnostics).toEqual([{ label: 'Reference', value: 'abc123digest' }]);
  });
});
