import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Sistema-de-Analise-Fenologica-Automatizada-SAFA/'
})