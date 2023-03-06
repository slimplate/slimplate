import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': resolve(fileURLToPath(new URL('.', import.meta.url)), './src')
    }
  }
})
