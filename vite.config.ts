import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const local = { host: true, port: 8519, strictPort: true, allowedHosts: ['jarvis', '.ts.net'] }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: local,
  preview: local,
})
