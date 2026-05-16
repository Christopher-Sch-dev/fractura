import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/alerts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/graph': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/entity': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/seed': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/detect': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})