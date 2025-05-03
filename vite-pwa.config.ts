
import { VitePWAOptions } from 'vite-plugin-pwa';

const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'Hässleholms IF',
    short_name: 'HIF P2014',
    description: 'Hässleholms IF P2014 Spelarapp',
    theme_color: '#0066cc',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon'
      },
      {
        src: '/maskable_icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    start_url: '/',
    orientation: 'portrait'
  },
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html'
  },
  strategies: 'generateSW',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // <== 24 hours
          },
          cacheableResponse: {
            statuses: [0, 200]
          },
          networkTimeoutSeconds: 10
        }
      }
    ]
  }
};

export default pwaOptions;
