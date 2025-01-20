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
  build: {
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        preserveModules: true,
      },
      onwarn(warning, warn) {
        // Ignore certain warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        if (warning.code === 'EMPTY_BUNDLE') return;
        
        // Log all other warnings
        console.log('Build warning:', {
          code: warning.code,
          message: warning.message,
          loc: warning.loc,
          frame: warning.frame
        });
        warn(warning);
      },
    },
  },
  server: {
    port: 8080,
    host: "::",
  },
  preview: {
    port: 8080,
  },
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'unsupported-jsx-comment': 'silent'
    },
    jsx: 'automatic',
    jsxInject: `import React from 'react'`
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
  }
}));