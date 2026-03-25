import type { LabelHTMLAttributes, ReactNode } from 'react';
import cx from 'classnames';

import styles from './Label.module.css';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export default function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label {...props} className={cx(styles.Label, className)}>
      {children}
    </label>
  );
}
