import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    // 测试环境下的功能标志（全部启用）
    __FEATURE_FLAGS__: JSON.stringify({
      VITE_ENABLE_EMAIL_SUBSCRIPTION: true,
      VITE_ENABLE_UUID_MANAGER: true,
      VITE_ENABLE_ACTIVATION_CODE_MANAGER: true
    })
  },
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
