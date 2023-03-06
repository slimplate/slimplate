import path from 'node:path'
import { defineConfig } from 'vite'
import * as packageJson from './package.json'

export default defineConfig({
  plugins: [
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'SlimplateUtils',
      formats: ['es', 'cjs'],
      fileName: (format) => `utils.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)]
    }
  }
})
