import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      // Feeds live at the site root on the server (FeedsModule).
      "/rss.xml": "http://localhost:8000",
      "/sitemap.xml": "http://localhost:8000",
      "/robots.txt": "http://localhost:8000",
    }
  },
})
