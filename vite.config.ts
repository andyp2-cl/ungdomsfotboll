
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
  },
  server: {
    port: 8080
  },
  build: {
    chunkSizeWarningLimit: 2000, // Increase the warning limit to 2MB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-tabs', '@radix-ui/react-dialog'],
          charts: ['recharts']
        }
      }
    }
  }
});
