import '@tabler/core/dist/css/tabler.min.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupGlobalAuthErrorHandler } from './utils/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 初始化认证管理 - 只启用全局401错误拦截
setupGlobalAuthErrorHandler()

app.mount('#app')
