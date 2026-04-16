'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import LogoutButton from '@/features/Auth/LogoutButton';
import { useCurrentUserQuery } from '@/features/Auth/query';

import styles from './AppSidebar.module.css';

const navigationItems = [
  { href: '/products', label: 'Products' },
  { href: '/settings', label: 'Settings' }
] as const;

function getUserInitials(name?: string | null, email?: string) {
  const source = name?.trim() || email?.trim();

  if (!source) {
    return 'PM';
  }

  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: user, isPending } = useCurrentUserQuery();
  const accountName = user?.name?.trim() || (isPending ? 'Loading user' : 'Not available');
  const accountEmail = user?.email || (isPending ? 'Loading...' : 'Not available');

  return (
    <Sidebar aria-label="Management navigation" className={styles.sidebar} data-testid="sidebar">
      <div className={styles.sidebarBrand}>
        <span aria-hidden="true" className={styles.sidebarBrandMark}>
          P
        </span>
        <div className={styles.sidebarBrandText}>
          <p className={styles.sidebarBrandName}>Paparico</p>
          <p className={styles.sidebarBrandSubtitle}>Backoffice</p>
        </div>
      </div>

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

      <footer className={styles.sidebarFooter}>
        <div className={styles.accountSummary}>
          <span aria-hidden="true" className={styles.accountAvatar}>
            {getUserInitials(user?.name, user?.email)}
          </span>
          <div className={styles.accountDetails}>
            <p className={styles.accountName}>{accountName}</p>
            <p className={styles.accountEmail}>{accountEmail}</p>
          </div>
        </div>
        <LogoutButton className={styles.logoutButton} />
      </footer>
    </Sidebar>
  );
}
