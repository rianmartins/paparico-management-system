'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Sidebar from '@/components/Sidebar';
import LogoutButton from '@/features/Auth/LogoutButton';
import { useCurrentUserQuery } from '@/features/Auth/query';

import styles from './AppSidebar.module.css';
import Image from 'next/image';
import Button from '@/components/Button';
import PackageIcon from '@/icons/PackageIcon';
import SettingsIcon from '@/icons/SettingsIcon';

const navigationItems = [
  // { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/products', label: 'Produtos', icon: <PackageIcon /> },
  // { href: '/orders', label: 'Pedidos', icon: <ShoppingBagIcon /> },
  // { href: '/customers', label: 'Clientes', icon: <UsersIcon /> },
  // { href: '/calendar', label: 'Calendário', icon: <CalendarIcon /> },
  { href: '/settings', label: 'Configurações', icon: <SettingsIcon /> }
];

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
        <Link href="/">
          <Image alt="Paparico" className={styles.logo} height={64} priority src="/logo.png" width={235} />
        </Link>
      </div>

      <Button className={styles.newOrderButton} variant="primary">
        + Novo Pedido
      </Button>

      <nav aria-label="Management sections" className={styles.sidebarNavigation}>
        {navigationItems.map(({ href, label, icon }) => (
          <Link
            aria-current={pathname === href ? 'page' : undefined}
            className={styles.sidebarLink}
            href={href}
            key={href}
          >
            <span aria-hidden="true" className={styles.sidebarLinkIcon}>
              {icon}
            </span>
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
