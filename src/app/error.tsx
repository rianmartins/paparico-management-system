'use client';

import { useEffect } from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import ErrorPage from './components/ErrorPage';

type AppErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function Error({ error, unstable_retry }: AppErrorProps) {
  const pathname = usePathname();
  const { reset } = useQueryErrorResetBoundary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      context={pathname ? { label: 'Route', value: pathname } : undefined}
      error={error}
      onRetry={() => {
        reset();
        unstable_retry();
      }}
    />
  );
}
