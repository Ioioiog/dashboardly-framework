import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 8080,
    hmr: {
      protocol: 'wss',
      host: process.env.VITE_HMR_HOST || 'localhost',
      port: Number(process.env.VITE_HMR_PORT) || 8080,
      clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) || 443,
    },
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 8080,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
  },
  base: '/',
});