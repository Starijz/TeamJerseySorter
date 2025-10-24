import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANT: Replace 'team-jersey-color' with your repository name if it's different.
  base: '/team-jersey-color/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        "name": "Team Jersey Color Splitter",
        "short_name": "Team Colors",
        "icons": [
          {
            "src": "icons/icon-192x192.svg",
            "sizes": "192x192",
            "type": "image/svg+xml",
            "purpose": "any maskable"
          },
          {
            "src": "icons/icon-512x512.svg",
            "sizes": "512x512",
            "type": "image/svg+xml",
            "purpose": "any maskable"
          }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#1f2937",
        "background_color": "#111827"
      }
    })
  ],
})