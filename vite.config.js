import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Sistema-de-Analise-Fenologica-Automatizada-SAFA/',
  server: {
    host: true,
    // AQUI ESTÁ A MÁGICA
    proxy: {
      // Qualquer requisição para /api será redirecionada
      '/api': {
        target: 'https://map.silasogis.com', // O alvo é sua API real
        changeOrigin: true, // Necessário para o servidor de destino não rejeitar
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api antes de enviar
      },
    },
  },
});