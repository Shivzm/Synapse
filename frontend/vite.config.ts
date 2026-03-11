import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When you call /api in React, it goes to FastAPI
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // When you call /search in React, it goes to Vespa
      '/search': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})