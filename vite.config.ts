import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths for assets to work correctly on GitHub Pages subdirectories.
  base: './',
  plugins: [
    react(),
  ],
})
