import type { ReactNode } from 'react';
import cx from 'classnames';

import styles from './Chip.module.css';

type ChipColor = 'default' | 'success' | 'error';
type ChipSize = 'sm' | 'md';

export type ChipProps = {
  children: ReactNode;
  color?: ChipColor;
  size?: ChipSize;
  className?: string;
};

export default function Chip({ children, color = 'default', size = 'sm', className = '' }: ChipProps) {
  return <span className={cx(styles.Chip, styles[color], styles[size], className)}>{children}</span>;
}
