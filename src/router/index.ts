import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import TokenManagerView from '../views/TokenManagerView.vue'
import ComprehensiveManagerView from '../views/ComprehensiveManagerView.vue'
import { PermissionManager } from '../types/permissions'

// 所有路由配置（权限控制在组件和导航层面处理）
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'home',
    component: ComprehensiveManagerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/tokens',
    name: 'tokens',
    component: TokenManagerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/uuid',
    name: 'uuid',
    component: () => import('../views/UuidManagerView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/activation',
    name: 'activation-code',
    component: () => import('../views/ActivationCodeView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
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
  } else if (to.meta.requiresAuth && isAuthenticated) {
    // 需要权限验证的页面，检查用户权限
    const permissions = PermissionManager.getPermissions()

    // 如果没有权限信息，允许访问（权限检查在组件层面处理）
    if (!permissions) {
      next()
      return
    }

    // 根据路由检查对应权限
    const routePermissionMap: Record<string, () => boolean> = {
      '/': () => PermissionManager.hasComprehensiveManagement(),
      '/tokens': () => PermissionManager.hasTokenManagement(),
      '/uuid': () => PermissionManager.hasUuidManagement(),
      '/activation': () => PermissionManager.hasActivationCodeManagement()
    }

    const checkPermission = routePermissionMap[to.path]
    if (checkPermission && !checkPermission()) {
      // 没有权限，跳转到有权限的第一个页面
      if (PermissionManager.hasTokenManagement()) {
        next('/tokens')
      } else {
        // 没有任何管理权限，跳转到登录页
        next('/login')
      }
      return
    }

    // 特殊处理：访问首页但没有综合管理权限时，跳转到 Token 管理
    if (to.path === '/' && !PermissionManager.hasComprehensiveManagement() && PermissionManager.hasTokenManagement()) {
      next('/tokens')
      return
    }

    next()
  } else {
    next()
  }
})

export default router
