import AppProviders from './providers';
import AppWarmup from './AppWarmup';
import { appFontVariables, appMetadata } from './branding';
import AuthGuard from '@/features/Auth/AuthGuard';
import './globals.css';

export const metadata = appMetadata;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={appFontVariables}>
      <body>
        <AppProviders>
          <AppWarmup />
          <AuthGuard>{children}</AuthGuard>
        </AppProviders>
      </body>
    </html>
  );
}
