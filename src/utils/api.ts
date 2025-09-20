/**
 * API 请求工具
 * 统一处理 API 请求、错误处理和认证失效
 */

// API 响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 请求选项接口
export interface RequestOptions extends RequestInit {
  skipAuthCheck?: boolean // 跳过认证检查（用于登录等接口）
}

// 注意：认证失效处理现在由全局认证管理器处理

/**
 * 统一的 API 请求方法
 */
export const apiRequest = async <T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { skipAuthCheck = false, ...fetchOptions } = options

  try {
    // 设置默认请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>)
    }

    // 添加认证头（除非跳过认证检查）
    if (!skipAuthCheck) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // 发送请求
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    })

    // 检查 HTTP 错误状态
    if (!response.ok) {
      // 尝试解析错误响应
      try {
        const errorData = await response.json()

        // 对于 401 错误，返回具体的错误信息
        if (response.status === 401) {
          return {
            success: false,
            error: errorData.error || errorData.message || '认证失效，请重新登录'
          }
        }

        // 其他 HTTP 错误
        return {
          success: false,
          error: errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    }

    // 解析成功响应
    const data = await response.json()
    return data

  } catch (error) {
    console.error('API 请求失败:', error)
    
    // 网络错误或其他异常
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误，请检查网络连接后重试'
    }
  }
}

/**
 * GET 请求
 */
export const apiGet = <T = any>(url: string, options: RequestOptions = {}) => {
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export const apiPost = <T = any>(url: string, data?: any, options: RequestOptions = {}) => {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  })
}

/**
 * PUT 请求
 */
export const apiPut = <T = any>(url: string, data?: any, options: RequestOptions = {}) => {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  })
}

/**
 * DELETE 请求
 */
export const apiDelete = <T = any>(url: string, options: RequestOptions = {}) => {
  return apiRequest<T>(url, { ...options, method: 'DELETE' })
}

/**
 * 检查认证状态
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await apiGet('/api/auth/status')
    return response.success
  } catch {
    return false
  }
}

/**
 * 登录请求（跳过认证检查）
 */
export const loginRequest = (credentials: { username: string; password: string }) => {
  return apiPost('/api/auth/login', credentials, { skipAuthCheck: true })
}

/**
 * 登出请求
 */
export const logoutRequest = () => {
  return apiPost('/api/auth/logout')
}
