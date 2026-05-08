import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Daftarkan SW secara inline agar bisa dipakai di dev mode juga
      devOptions: {
        enabled: true,
      },
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Berbumi Database',
        short_name: 'Berbumi',
        description: 'Platform Monitoring Reforestasi DAS Bodri',
        theme_color: '#15803d',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'id',
        icons: [
          {
            src: '/icons/launchericon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: '/icons/launchericon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/launchericon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/launchericon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache semua asset statis
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Jangan cache data_pohon.csv di precache (terlalu besar), biarkan runtime
        globIgnores: ['**/data_pohon.csv'],
        runtimeCaching: [
          // Cache CSV data pohon dengan strategi CacheFirst
          {
            urlPattern: /\/data_pohon\.csv$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'csv-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 hari
              },
            },
          },
          // Cache Firestore API dengan NetworkFirst
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 jam
              },
            },
          },
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 tahun
              },
            },
          },
        ],
      },
    }),
  ],
})
