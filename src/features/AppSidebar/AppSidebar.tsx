'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/Sidebar';

import styles from './AppSidebar.module.css';

const navigationItems = [
  { href: '/products', label: 'Products' },
  { href: '/settings', label: 'Settings' }
] as const;

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar aria-label="Management navigation" data-testid="sidebar">
      <nav aria-label="Management sections" className={styles.sidebarNavigation}>
        {navigationItems.map(({ href, label }) => (
          <Link
            aria-current={pathname === href ? 'page' : undefined}
            className={styles.sidebarLink}
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </nav>
    </Sidebar>
  );
}
