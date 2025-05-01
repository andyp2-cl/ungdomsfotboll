
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pwaOptions from './vite-pwa.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA(pwaOptions)
  ],
  optimizeDeps: {
    include: ['react', 'react-dom'],
  }
});
