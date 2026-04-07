'use client';

import { useEffect } from 'react';

import { appFontVariables, appName } from './branding';
import ErrorPage from './components/ErrorPage';
import './globals.css';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html className={appFontVariables} lang="en">
      <body>
        <title>{`Application error | ${appName}`}</title>
        <ErrorPage context={{ label: 'Scope', value: 'Application shell' }} error={error} onRetry={unstable_retry} />
      </body>
    </html>
  );
}
