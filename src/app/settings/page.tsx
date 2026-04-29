import AppSidebar from '@/features/AppSidebar';
import { CurrentUserInformation, UpdatePasswordSection } from '@/features/Settings';

import pageStyles from '../page.module.css';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={pageStyles.page}>
      <AppSidebar />

      <div className={pageStyles.contentShell}>
        <main className={pageStyles.main}>
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
