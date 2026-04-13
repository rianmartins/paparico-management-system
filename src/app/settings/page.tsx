import LogoutButton from '@/features/Auth/LogoutButton';
import { CurrentUserInformation, UpdatePasswordSection } from '@/features/Settings';

import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.settingsHeader}>
        <div className={styles.settingsHeaderInner}>
          <h3 className={styles.settingsHeaderBrand}>Paparico Management</h3>
          <LogoutButton />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.userSection}>
          <h1 className={styles.title}>Settings</h1>
          <CurrentUserInformation />
        </section>

        <UpdatePasswordSection />
      </main>
    </div>
  );
}
