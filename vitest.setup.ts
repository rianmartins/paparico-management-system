import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Geist: () => ({
    variable: 'font-geist-sans'
  }),
  Geist_Mono: () => ({
    variable: 'font-geist-mono'
  })
}));

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000';
}
