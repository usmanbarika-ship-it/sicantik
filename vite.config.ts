import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Memuat env berdasarkan mode (development/production)
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Tetap pertahankan ini jika Anda menggunakan process.env di bagian lain
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          // Mengatur alias '@' agar merujuk ke folder root atau src
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        outDir: 'dist', // Memastikan hasil build masuk ke folder dist untuk Vercel
      }
    };
});
