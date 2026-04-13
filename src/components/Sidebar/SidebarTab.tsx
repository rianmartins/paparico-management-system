'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import cx from 'classnames';

import styles from './Sidebar.module.css';

export type SidebarTabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: ReactNode;
  icon: ReactNode;
  isSelected?: boolean;
  tooltip?: string;
  panelId?: string;
};

export default function SidebarTab({
  'aria-controls': ariaControls,
  className = '',
  icon,
  isSelected = false,
  label,
  panelId,
  tabIndex,
  tooltip,
  type = 'button',
  ...props
}: SidebarTabProps) {
  return (
    <button
      {...props}
      aria-controls={panelId ?? ariaControls}
      aria-selected={isSelected}
      className={cx(styles.SidebarTab, { [styles.selected]: isSelected }, className)}
      data-tooltip={tooltip}
      role="tab"
      tabIndex={tabIndex ?? (isSelected ? 0 : -1)}
      title={tooltip}
      type={type}
    >
      <span aria-hidden="true" className={styles.icon}>
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
