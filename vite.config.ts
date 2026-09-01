import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project site is served at /<repo>/ — this repo is named "-".
const base = process.env.GITHUB_PAGES === 'true' ? '/-/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: '공사 사진관리',
        short_name: '공사사진관리',
        description: '공사 현장 사진을 촬영일시, 위치, 공종·내용과 함께 기록하고 관리하는 앱',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'ko',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
})
