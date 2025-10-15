import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      root: '.',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      build: {
        // Optimizaciones de build
        target: 'es2015',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Eliminar console.log en producción
            drop_debugger: true,
          },
        },
        rollupOptions: {
          output: {
            // Dividir el código en chunks más pequeños
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'supabase': ['@supabase/supabase-js'],
            },
          },
        },
        chunkSizeWarningLimit: 1000,
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@supabase/supabase-js'],
      },
    };
});
