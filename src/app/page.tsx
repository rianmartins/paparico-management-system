import LoginForm from '@/features/Auth/LoginForm';
import { sanitizeNextPath } from '@/features/Auth/redirects';
import styles from './page.module.css';

type HomePageProps = {
  searchParams: Promise<{ redirects_to?: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const { redirects_to } = await searchParams;
  const redirectsTo = sanitizeNextPath(redirects_to);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LoginForm redirectsTo={redirectsTo} />
      </main>
    </div>
  );
}
