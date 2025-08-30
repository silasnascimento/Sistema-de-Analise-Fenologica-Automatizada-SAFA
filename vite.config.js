import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Apontando para o GITHUB PAGES
  base: '/Sistema-de-Analise-Fenologica-Automatizada-SAFA/', 

  server: {
    host: true
  }
});