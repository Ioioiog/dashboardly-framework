import type { VitePWAOptions } from 'vite-plugin-pwa'

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    id: 'ro.adminchirii.app',
    name: 'AdminChirii.ro',
    short_name: 'AdminChirii',
    description: 'Property management platform',
    theme_color: '#4169E1',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    screenshots: [
      {
        src: '/lovable-uploads/9c23bc1b-4e8c-433e-a961-df606dc6a2c6.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Dashboard Overview'
      },
      {
        src: '/lovable-uploads/a279fbbc-be90-4a4b-afe5-ae98a7d6c04d.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile Dashboard View'
      }
    ],
    icons: [
      {
        src: '/lovable-uploads/db1b2738-7e16-492b-9a02-a0f53d9da02b.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/lovable-uploads/db1b2738-7e16-492b-9a02-a0f53d9da02b.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/lovable-uploads/db1b2738-7e16-492b-9a02-a0f53d9da02b.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // Increased to 5MB
    runtimeCaching: [
      {
        // Cache Supabase API responses
        urlPattern: /^https:\/\/api\.adminchirii\.ro\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          cacheableResponse: {
            statuses: [0, 200]
          },
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      },
      {
        // Cache static assets
        urlPattern: /\.(js|css|png|jpg|jpeg|svg|gif)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
          }
        }
      },
      {
        // Cache fonts
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
          }
        }
      }
    ],
    skipWaiting: true,
    clientsClaim: true,
    cleanupOutdatedCaches: true
  },
  // Adding the missing required properties
  injectRegister: 'auto',
  minify: true,
  injectManifest: false,
  includeManifestIcons: true,
  disable: false
}