
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";
import pwaOptions from './vite-pwa.config';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA(pwaOptions),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    port: 8080,
    host: "::"
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
}));
