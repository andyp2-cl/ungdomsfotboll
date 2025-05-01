
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

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
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: "Hässleholms IF P2014",
        short_name: "HIF P2014",
        description: "Hässleholms IF P2014 - Fotbollslagshanterare",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#006633",
        icons: [
          {
            src: "/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
