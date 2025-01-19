import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    host: "::",
    proxy: {
      // Redirect all requests that don't match a file to index.html
      '*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => '/index.html',
      },
    },
  },
  preview: {
    port: 8080,
    proxy: {
      '*': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => '/index.html',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})