import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 443,
    host: true,
    https: true,
    hmr: {
      protocol: 'wss',
      host: 'www.adminchirii.ro',
      clientPort: 443,
      path: '/hmr/',
    },
    proxy: {
      '/api': {
        target: 'https://www.adminchirii.ro',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    port: 443,
    https: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}));