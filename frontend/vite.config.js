import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // sockjs-client@1.x uses `global` (Node CJS) — polyfill for Vite ESM
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': { target: 'http://localhost:8080', ws: true },
    },
  },
  build: { outDir: 'dist' },
})

