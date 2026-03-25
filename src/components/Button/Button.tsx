import type { ButtonHTMLAttributes, ReactNode } from 'react';
import cx from 'classnames';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button {...props} className={cx(styles.Button, styles[variant], className)} type={type}>
      {children}
    </button>
  );
}
