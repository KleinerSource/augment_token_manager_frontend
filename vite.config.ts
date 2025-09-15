import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 自定义插件：复制图标文件到构建目录
const copyIconsPlugin = () => {
  return {
    name: 'copy-icons',
    writeBundle() {
      const iconsDir = resolve(__dirname, 'src/assets/icons')
      const distIconsDir = resolve(__dirname, 'dist/icons')

      // 创建目标目录
      if (!existsSync(distIconsDir)) {
        mkdirSync(distIconsDir, { recursive: true })
      }

      // 复制所有图标文件
      const iconFiles = [
        'codebuddy.svg',
        'cursor.svg',
        'kiro.svg',
        'qoder.svg',
        'trae.svg',
        'vscode.svg',
        'vscodium.svg'
      ]

      iconFiles.forEach(file => {
        const src = resolve(iconsDir, file)
        const dest = resolve(distIconsDir, file)
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log(`Copied ${file} to dist/icons/`)
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 功能模块配置
  // 开发环境：默认全部启用
  // 生产环境：默认全部禁用
  const isDevelopment = mode === 'development'

  const featureFlags = {
    VITE_ENABLE_EMAIL_SUBSCRIPTION: env.VITE_ENABLE_EMAIL_SUBSCRIPTION === 'true' || (isDevelopment && env.VITE_ENABLE_EMAIL_SUBSCRIPTION !== 'false'),
    VITE_ENABLE_UUID_MANAGER: env.VITE_ENABLE_UUID_MANAGER === 'true' || (isDevelopment && env.VITE_ENABLE_UUID_MANAGER !== 'false'),
    VITE_ENABLE_ACTIVATION_CODE_MANAGER: env.VITE_ENABLE_ACTIVATION_CODE_MANAGER === 'true' || (isDevelopment && env.VITE_ENABLE_ACTIVATION_CODE_MANAGER !== 'false')
  }

  console.log(`🚀 Feature Flags Configuration (${mode} mode):`)
  console.log('  📧 Email Subscription:', featureFlags.VITE_ENABLE_EMAIL_SUBSCRIPTION ? '✅ Enabled' : '❌ Disabled')
  console.log('  🔑 UUID Manager:', featureFlags.VITE_ENABLE_UUID_MANAGER ? '✅ Enabled' : '❌ Disabled')
  console.log('  🎫 Activation Code Manager:', featureFlags.VITE_ENABLE_ACTIVATION_CODE_MANAGER ? '✅ Enabled' : '❌ Disabled')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      copyIconsPlugin(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      // 将功能标志注入到应用中
      __FEATURE_FLAGS__: JSON.stringify(featureFlags)
    },
    server: {
      host: '0.0.0.0', // 允许外部IP访问
      port: 5173,      // 指定端口
      proxy: {
        '/api': {
          target: 'https://10.0.0.52:14444',
          changeOrigin: true,
          secure: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    }
  }
})
