import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

export const appName = 'Paparico Management';
export const appDescription = 'Management dashboard for Paparico products and operational data.';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const appFontVariables = `${geistSans.variable} ${geistMono.variable}`;

export const appMetadata: Metadata = {
  title: appName,
  description: appDescription
};
