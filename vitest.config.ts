import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    allowOnly: false,
    alias: {
      'next-sanity/live': fileURLToPath(new URL('./test/mocks/next-sanity-live.ts', import.meta.url)),
      'server-only': fileURLToPath(new URL('./test/mocks/server-only.ts', import.meta.url)),
    },
    environment: 'node',
    setupFiles: ['./test/setup-env.ts'],
  },
})
