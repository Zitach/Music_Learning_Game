import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Music_Learning_Game/',
  server: {
    port: 5173,
    strictPort: true
  }
})
