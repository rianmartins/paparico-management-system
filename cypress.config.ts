import path from 'node:path';

import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        resolve: {
          dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
          alias: {
            '@': path.resolve(__dirname, 'src')
          }
        }
      }
    },
    specPattern: 'src/**/*.cy.{ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
});
