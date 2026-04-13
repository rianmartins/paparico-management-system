'use client';

import type { ReactNode } from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getLoginHref, hasStoredSession, sanitizeNextPath, subscribeToStoredSession } from './session';

export type AuthGuardProps = {
  children: ReactNode;
};

function buildCurrentPath(pathname: string) {
  if (typeof window === 'undefined') {
    return pathname;
  }

  const queryString = window.location.search.slice(1);
  return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
}

function getRedirectTargetFromLocation() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const searchParams = new URLSearchParams(window.location.search);

  return sanitizeNextPath(searchParams.get('redirects_to') ?? undefined);
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useSyncExternalStore(subscribeToStoredSession, hasStoredSession, () => false);
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === '/';

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (!isAuthenticated && !isLoginRoute) {
      router.replace(getLoginHref(buildCurrentPath(pathname)));
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      router.replace(getRedirectTargetFromLocation() ?? '/products');
    }
  }, [isAuthenticated, isLoginRoute, pathname, router]);

  if ((!isAuthenticated && !isLoginRoute) || (isAuthenticated && isLoginRoute)) {
    return null;
  }

  return <>{children}</>;
}
