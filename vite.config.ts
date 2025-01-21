import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { ConfigEnv, UserConfig } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 8080,
      clientPort: 8080,
    },
  },
  preview: {
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js', '@supabase/auth-ui-react'],
        },
      },
    },
  },
}));