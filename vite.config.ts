import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths for assets to work correctly on GitHub Pages subdirectories.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // We are defining the manifest here to ensure it's always correctly
      // generated and to avoid issues with file locations in the repository.
      manifest: {
        name: 'Team Jersey Color Splitter',
        short_name: 'Team Colors',
        description: "A progressive web app to split a list of names into teams, customize team colors, and share the results as an image. The app supports English, Latvian, and Russian languages.",
        icons: [
          {
            src: "icons/icon-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#1f2937",
        background_color: "#111827"
      }
    })
  ],
})
