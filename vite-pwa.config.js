
// PWA configuration options
export default {
  // Increase the maximum file size that can be precached
  // Default is 2MB (2097152 bytes)
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
  
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
  }
};
