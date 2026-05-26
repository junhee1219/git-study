import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')
  const base = env.VITE_BASE ?? '/git-page/'
  return {
    base,
    plugins: [
      { enforce: 'pre', ...mdx() },
      react({ include: /\.(jsx|tsx|mdx)$/ }),
    ],
  }
})
