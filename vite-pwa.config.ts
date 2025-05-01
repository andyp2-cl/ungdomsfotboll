
import { VitePWAOptions } from 'vite-plugin-pwa';

const pwaOptions: VitePWAOptions = {
  // Base configuration for PWA
  registerType: 'autoUpdate',
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
    // Configure Workbox options
    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}'],
    // We'll use the standard maximumFileSizeToCacheInBytes option that exists in Workbox
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  }
};

export default pwaOptions;
