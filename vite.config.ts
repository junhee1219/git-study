import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')
  const base = env.VITE_BASE ?? '/git-page/'
  return {
    base,
    plugins: [
      { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
      react({ include: /\.(jsx|tsx|mdx)$/ }),
    ],
  }
})
