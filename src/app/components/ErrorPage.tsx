'use client';

import type { ReactNode } from 'react';

import type { ErrorPageContext } from '@/types/ErrorPage';

import { appName } from '../branding';
import { normalizeErrorForDisplay } from '../error-utils';
import styles from './ErrorPage.module.css';

export type ErrorPageProps = {
  error: unknown;
  onRetry: () => void;
  context?: ErrorPageContext;
  homeHref?: string;
  homeLabel?: ReactNode;
};

export default function ErrorPage({
  error,
  onRetry,
  context,
  homeHref = '/',
  homeLabel = 'Back to dashboard'
}: ErrorPageProps) {
  const { title, description, diagnostics } = normalizeErrorForDisplay(error, context);

  return (
    <main className={styles.page}>
      <section aria-live="assertive" className={styles.panel} role="alert">
        <p className={styles.eyebrow}>{appName}</p>

        <div className={styles.content}>
          <div className={styles.copy}>
            <h1>{title}</h1>
            <p className={styles.description}>{description}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.primaryAction} onClick={onRetry} type="button">
              Try again
            </button>

            <a className={styles.secondaryAction} href={homeHref}>
              {homeLabel}
            </a>
          </div>

          <div className={styles.diagnosticSection}>
            <p className={styles.diagnosticTitle}>Available diagnostics</p>

            {diagnostics.length > 0 ? (
              <dl className={styles.diagnostics}>
                {diagnostics.map((diagnostic) => (
                  <div className={styles.diagnosticCard} key={`${diagnostic.label}-${diagnostic.value}`}>
                    <dt>{diagnostic.label}</dt>
                    <dd>{diagnostic.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={styles.diagnosticFallback}>No extra diagnostic details were available for this error.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
