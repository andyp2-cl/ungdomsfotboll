import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    sourcemap: mode === 'development',
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority'],
          'charts-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          
          // Feature chunks
          'player-features': [
            './src/components/player-list',
            './src/components/player-ui',
            './src/components/player-management'
          ],
          'activity-features': [
            './src/components/activity-list',
            './src/components/activity-detail'
          ],
          'statistics-features': [
            './src/components/performance-charts',
            './src/components/player-management/statistics'
          ]
        }
      }
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize assets
    assetsInlineLimit: 4096,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'date-fns',
      'clsx',
      'class-variance-authority',
      'lucide-react'
    ],
    exclude: ['lovable-tagger']
  },
  
  // Performance optimizations
  esbuild: {
    target: 'esnext',
    supported: {
      'top-level-await': true
    }
  }
}));
