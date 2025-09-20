/**
 * 认证管理工具
 * 处理用户认证状态、登录、登出和认证失效
 */

import { toast } from './toast'
import router from '../router'

/**
 * 检查是否已登录
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('auth_token')
}

/**
 * 获取当前用户名
 */
export const getCurrentUsername = (): string | null => {
  return localStorage.getItem('username')
}

/**
 * 设置认证信息
 */
export const setAuthInfo = (token: string, username: string) => {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('username', username)
}

/**
 * 清除认证信息
 */
export const clearAuthInfo = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('username')
  localStorage.removeItem('remembered_username')
  localStorage.removeItem('remembered_password')
  localStorage.removeItem('remember_me')
}

/**
 * 处理认证失效
 * 当收到 401 错误时调用
 */
export const handleAuthFailure = (showToast: boolean = true) => {
  // 清除认证信息
  clearAuthInfo()
  
  // 显示提示（可选）
  if (showToast) {
    toast.error('登录已过期，请重新登录')
  }
  
  // 跳转到登录页（避免重复跳转）
  if (router.currentRoute.value.path !== '/login') {
    router.push('/login')
  }
}

/**
 * 登出处理
 */
export const logout = (showToast: boolean = true) => {
  // 清除认证信息
  clearAuthInfo()
  
  // 显示提示（可选）
  if (showToast) {
    toast.success('已成功登出')
  }
  
  // 跳转到登录页
  router.push('/login')
}

/**
 * 全局 401 错误监听器
 * 监听所有 fetch 请求的 401 错误和认证失效响应
 */
export const setupGlobalAuthErrorHandler = () => {
  // 重写 fetch 方法以拦截 401 错误和认证失效响应
  const originalFetch = window.fetch

  window.fetch = async (...args) => {
    const response = await originalFetch(...args)

    // 检查是否为 401 错误
    if (response.status === 401) {
      // 检查是否为登录接口（登录接口的 401 是正常的）
      const url = args[0] as string
      const isLoginRequest = url.includes('/api/auth/login')

      if (!isLoginRequest) {
        // 非登录接口的 401 错误，处理认证失效
        handleAuthFailure()
      }
    } else if (response.ok) {
      // 检查响应体中的认证失效信息
      try {
        const clonedResponse = response.clone()
        const data = await clonedResponse.json()

        // 检查响应中是否包含认证失效信息
        if (data && !data.success && (
          data.error?.includes('登录已过期') ||
          data.error?.includes('认证失效') ||
          data.error?.includes('token无效') ||
          data.error?.includes('未登录')
        )) {
          const url = args[0] as string
          const isLoginRequest = url.includes('/api/auth/login')

          if (!isLoginRequest) {
            handleAuthFailure()
          }
        }
      } catch (error) {
        // 解析响应体失败，忽略
      }
    }

    return response
  }
}

/**
 * Cookie 有效期检查
 * 定期检查认证状态
 */
export const startAuthStatusCheck = (intervalMs: number = 300000) => { // 默认5分钟检查一次
  let checkInterval: number | null = null
  
  const checkAuthStatus = async () => {
    if (!isLoggedIn()) {
      return // 未登录，无需检查
    }
    
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.status === 401) {
        // 认证失效
        handleAuthFailure()
        stopAuthStatusCheck()
      }
    } catch (error) {
      // 网络错误，暂时忽略
      console.warn('认证状态检查失败:', error)
    }
  }
  
  // 立即检查一次
  checkAuthStatus()
  
  // 设置定期检查
  checkInterval = setInterval(checkAuthStatus, intervalMs)
  
  // 返回停止检查的函数
  const stopAuthStatusCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }
  
  return stopAuthStatusCheck
}

/**
 * 页面可见性变化时检查认证状态
 */
export const setupVisibilityAuthCheck = () => {
  const handleVisibilityChange = async () => {
    if (!document.hidden && isLoggedIn()) {
      // 页面重新可见且已登录，检查认证状态
      try {
        const response = await fetch('/api/auth/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        
        if (response.status === 401) {
          handleAuthFailure()
        }
      } catch (error) {
        // 网络错误，暂时忽略
        console.warn('认证状态检查失败:', error)
      }
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 返回清理函数
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}
