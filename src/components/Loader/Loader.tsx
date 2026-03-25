import type { HTMLAttributes } from 'react';
import cx from 'classnames';

import styles from './Loader.module.css';

type LoaderSize = 'sm' | 'md' | 'lg';

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  size?: LoaderSize;
};

export default function Loader({ className = '', label = 'Loading...', size = 'md', ...props }: LoaderProps) {
  return (
    <div {...props} aria-live="polite" className={cx(styles.Loader, styles[size], className)} role="status">
      <span aria-hidden="true" className={styles.spinner} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
