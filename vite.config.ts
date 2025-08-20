import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import proxy from './proxy.local'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    proxy
  }
})
