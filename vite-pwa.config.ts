
/** @type {import('vite-plugin-pwa').VitePWAOptions} */
const pwaOptions = {
  // Increase the maximum file size that can be precached
  // Default is 2MB (2097152 bytes)
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
  // Base configuration for PWA
  registerType: "autoUpdate" as const,
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
  manifest: {
    name: 'Hässleholms IF P2014',
    short_name: 'HIF P2014',
    description: 'Hässleholms IF P2014 - Fotbollslagshanterare',
    theme_color: '#006633',
    icons: [
      {
        src: '/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/lovable-uploads/283f2e70-ce59-494a-b7c5-17020cba7215.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    // Configure Workbox to handle larger files
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB,
    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/zkrruihxszziifyogzko\.supabase\.co\/.*$/i,
        handler: 'NetworkFirst' as const, // Fixed: Use 'as const' to specify exact string literal type
        options: {
          cacheName: 'supabase-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  },
  // Fix: Use the enum value auto instead of a string
  injectRegister: "auto" as const,
  minify: true,
  injectManifest: undefined,
  includeManifestIcons: true,
  disable: false
};

export default pwaOptions;
