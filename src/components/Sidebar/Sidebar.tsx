import type { ComponentPropsWithoutRef } from 'react';

import styles from './Sidebar.module.css';

export type SidebarProps = ComponentPropsWithoutRef<'aside'>;

export default function Sidebar({
  'aria-label': ariaLabel = 'Sidebar',
  className = '',
  children,
  ...props
}: SidebarProps) {
  return (
    <aside {...props} aria-label={ariaLabel} className={`${styles.Sidebar} ${className}`.trim()}>
      {children}
    </aside>
  );
}
