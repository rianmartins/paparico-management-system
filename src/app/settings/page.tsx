import AppSidebar from '@/features/AppSidebar';
import { CurrentUserInformation, UpdatePasswordSection } from '@/features/Settings';

import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <AppSidebar />

      <div className={styles.contentShell}>
        <main className={styles.main}>
          <section className={styles.userSection}>
            <h1 className={styles.title}>Settings</h1>
            <CurrentUserInformation />
            <UpdatePasswordSection />
          </section>
        </main>
      </div>
    </div>
  );
}
