const APP_ROUTE_PREFIXES = ['/api'];
const INTERNAL_ORIGIN = 'http://paparico.local';

function getSingleValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function sanitizeNextPath(value?: string | string[]) {
  const candidate = getSingleValue(value);

  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return undefined;
  }

  try {
    const url = new URL(candidate, INTERNAL_ORIGIN);

    if (url.origin !== INTERNAL_ORIGIN || isAppRoute(url.pathname)) {
      return undefined;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return undefined;
  }
}

export function getLoginHref(nextPath?: string | string[]) {
  const sanitizedNextPath = sanitizeNextPath(nextPath);

  if (!sanitizedNextPath || sanitizedNextPath === '/') {
    return '/';
  }

  return `/?redirects_to=${encodeURIComponent(sanitizedNextPath)}`;
}
