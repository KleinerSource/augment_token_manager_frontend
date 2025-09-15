export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// 全局提示函数
export const showToast = (options: ToastOptions) => {
  const event = new CustomEvent('show-toast', {
    detail: options
  })
  window.dispatchEvent(event)
}

// 便捷方法
export const toast = {
  success: (message: string, duration?: number) => {
    showToast({ type: 'success', message, duration })
  },
  
  error: (message: string, duration?: number) => {
    showToast({ type: 'error', message, duration })
  },
  
  warning: (message: string, duration?: number) => {
    showToast({ type: 'warning', message, duration })
  },
  
  info: (message: string, duration?: number) => {
    showToast({ type: 'info', message, duration })
  }
}
