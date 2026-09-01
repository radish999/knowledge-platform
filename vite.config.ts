import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const seoConfig = JSON.parse(readFileSync(path.join(projectRoot, 'config/seo-pages.json'), 'utf8')) as {
  pages: Array<{ slug: string }>
}
const seoInputs = Object.fromEntries(
  seoConfig.pages.map((page) => [page.slug, path.join(projectRoot, `${page.slug}.html`)]),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.join(projectRoot, 'index.html'),
        ...seoInputs,
      },
    },
  },
})
