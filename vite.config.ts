import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      timeout: 5000,
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    middlewareMode: false,
    fs: {
      strict: true,
      allow: ['..'],
    },
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
  optimizeDeps: {
    force: true,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
}));
