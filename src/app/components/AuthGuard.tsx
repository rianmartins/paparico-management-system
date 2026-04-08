'use client';

import type { ReactNode } from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { getLoginHref, hasStoredSession, sanitizeNextPath, subscribeToStoredSession } from '@/auth/session';

export type AuthGuardProps = {
  children: ReactNode;
};

function buildCurrentPath(pathname: string, searchParams: ReturnType<typeof useSearchParams>) {
  const queryString = searchParams.toString();

  return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useSyncExternalStore(subscribeToStoredSession, hasStoredSession, () => false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoginRoute = pathname === '/';
  const redirectsTo = sanitizeNextPath(searchParams.get('redirects_to') ?? undefined);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (!isAuthenticated && !isLoginRoute) {
      router.replace(getLoginHref(buildCurrentPath(pathname, searchParams)));
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      router.replace(redirectsTo ?? '/products');
    }
  }, [isAuthenticated, isLoginRoute, pathname, redirectsTo, router, searchParams]);

  if ((!isAuthenticated && !isLoginRoute) || (isAuthenticated && isLoginRoute)) {
    return null;
  }

  return <>{children}</>;
}
