import { describe, expect, it } from 'vitest';

import { getLoginHref, sanitizeNextPath } from './redirects';

describe('features/Auth/redirects', () => {
  it('accepts internal page paths and preserves their query string', () => {
    expect(sanitizeNextPath('/products?tab=active')).toBe('/products?tab=active');
  });

  it('rejects malformed, external, and app-route redirect targets', () => {
    expect(sanitizeNextPath('https://example.com')).toBeUndefined();
    expect(sanitizeNextPath('//example.com')).toBeUndefined();
    expect(sanitizeNextPath('/api/products')).toBeUndefined();
  });

  it('builds a safe login href with the redirects_to parameter only for allowed paths', () => {
    expect(getLoginHref('/products?tab=active')).toBe('/?redirects_to=%2Fproducts%3Ftab%3Dactive');
    expect(getLoginHref('/api/products')).toBe('/');
  });
});
