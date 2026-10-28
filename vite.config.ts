import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const port = 8519

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port, strictPort: true },
  preview: { host: true, port, strictPort: true },
})
