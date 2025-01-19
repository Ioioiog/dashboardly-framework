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
    // Add historyApiFallback to handle client-side routing
    historyApiFallback: true,
  },
  preview: {
    // Also add historyApiFallback for preview/production mode
    historyApiFallback: true,
  },
  build: {
    // Generate a 200.html file that can be used for client-side routing
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})