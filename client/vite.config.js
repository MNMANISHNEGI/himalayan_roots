import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Proxy only runs in local dev — in production the real VITE_API_URL is used
  server: mode === 'development'
    ? {
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
          '/uploads': {
            target: 'http://localhost:5000',
            changeOrigin: true,
          },
        },
      }
    : { port: 5173 },

  build: {
    outDir: 'dist',
    sourcemap: false,
    // Warn if any single chunk exceeds 600 kB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libs into a separate chunk for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
}))
