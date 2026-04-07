import AppProviders from './providers';
import { appFontVariables, appMetadata } from './branding';
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
