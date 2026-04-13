'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import LogoutButton from '@/features/Auth/LogoutButton';
import { CurrentUserInformation, UpdatePasswordSection } from '@/features/Settings';
import Sidebar from '@/components/Sidebar';

import styles from './page.module.css';
import tabs from '../tabs';

export default function SettingsPage() {
  const [selectedTabId, setSelectedTabId] = useState('settings');
  const router = useRouter();

  const handleTabSelect = (tabId: string) => {
    setSelectedTabId(tabId);
    router.push(`/${tabId}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.settingsHeader}>
        <div className={styles.settingsHeaderInner}>
          <h3 className={styles.settingsHeaderBrand}>Paparico Management</h3>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <Sidebar
          ariaLabel="Management navigation"
          data-testid="sidebar"
          onTabSelect={handleTabSelect}
          selectedTabId={selectedTabId}
          tabs={tabs}
        />
        <section className={styles.userSection}>
          <h1 className={styles.title}>Settings</h1>
          <CurrentUserInformation />
          <UpdatePasswordSection />
        </section>
      </main>
    </div>
  );
}
