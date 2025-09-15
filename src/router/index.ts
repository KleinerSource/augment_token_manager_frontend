import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import TokenManagerView from '../views/TokenManagerView.vue'
import { isUuidManagerEnabled, isActivationCodeManagerEnabled } from '../types/feature-flags'

// 构建路由配置
const buildRoutes = (): RouteRecordRaw[] => {
  const routes: RouteRecordRaw[] = [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'token-manager',
      component: TokenManagerView,
      meta: { requiresAuth: true }
    }
  ]

  // 条件添加UUID管理路由
  if (isUuidManagerEnabled()) {
    routes.push({
      path: '/uuid',
      name: 'uuid-manager',
      component: () => import('../views/UuidManagerView.vue'),
      meta: { requiresAuth: true }
    })
  }

  // 条件添加激活码管理路由
  if (isActivationCodeManagerEnabled()) {
    routes.push({
      path: '/activation',
      name: 'activation-code',
      component: () => import('../views/ActivationCodeView.vue'),
      meta: { requiresAuth: true }
    })
  }

  return routes
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: buildRoutes(),
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 已登录但访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
