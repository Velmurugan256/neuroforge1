// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'path';                  // ← add

export default defineConfig({
  plugins: [react()],
  resolve: {                              // ← add
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()]
    }
  }
});
