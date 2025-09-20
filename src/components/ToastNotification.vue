<template>
  <div class="toast-container position-fixed top-0 start-0 p-3" style="z-index: 1055;">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast show toast-slide"
        :class="getToastClass(toast.type)"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        @mouseenter="pauseTimer(toast.id)"
        @mouseleave="resumeTimer(toast.id)"
      >
      <div class="toast-header">
        <svg 
          class="me-2" 
          :class="getIconClass(toast.type)"
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          stroke-width="2" 
          stroke="currentColor" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path v-if="toast.type === 'success'" d="M5 12l5 5l10 -10"/>
          <circle v-else-if="toast.type === 'error'" cx="12" cy="12" r="9"/>
          <line v-if="toast.type === 'error'" x1="12" y1="8" x2="12" y2="12"/>
          <line v-if="toast.type === 'error'" x1="12" y1="16" x2="12.01" y2="16"/>
          <path v-else-if="toast.type === 'warning'" d="M12 9v2m0 4v.01"/>
          <path v-if="toast.type === 'warning'" d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/>
          <circle v-else-if="toast.type === 'info'" cx="12" cy="12" r="9"/>
          <line v-if="toast.type === 'info'" x1="12" y1="8" x2="12" y2="12"/>
          <line v-if="toast.type === 'info'" x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <strong class="me-auto">{{ getToastTitle(toast.type) }}</strong>
        <small class="text-muted">{{ formatTime(toast.timestamp) }}</small>
        <button 
          type="button" 
          class="btn-close" 
          @click="removeToast(toast.id)"
          aria-label="Close"
        ></button>
      </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
        <!-- 倒计时进度条 -->
        <div class="toast-progress" :style="{ '--toast-duration': (toast.remainingTime || toast.duration || 0) + 'ms' }">
          <div
            class="toast-progress-bar"
            :class="{ running: toast.running }"
            :style="getProgressStyle(toast)"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
  duration?: number
  timerId?: number
  remainingTime?: number
  pausedAt?: number
  endAt?: number
  running?: boolean
  started?: boolean
}

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

const getToastClass = (type: string) => {
  const baseClass = 'border-0'
  switch (type) {
    case 'success':
      return `${baseClass} bg-success text-white`
    case 'error':
      return `${baseClass} bg-danger text-white`
    case 'warning':
      return `${baseClass} bg-warning text-dark`
    case 'info':
      return `${baseClass} bg-info text-white`
    default:
      return baseClass
  }
}

const getIconClass = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-white'
    case 'error':
      return 'text-white'
    case 'warning':
      return 'text-dark'
    case 'info':
      return 'text-white'
    default:
      return 'text-muted'
  }
}

const getToastTitle = (type: string) => {
  switch (type) {
    case 'success':
      return '成功'
    case 'error':
      return '错误'
    case 'warning':
      return '警告'
    case 'info':
      return '信息'
    default:
      return '通知'
  }
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const addToast = (toast: Omit<Toast, 'id' | 'timestamp'>) => {
  const newToast: Toast = {
    ...toast,
    id: ++toastIdCounter,
    timestamp: new Date(),
    duration: toast.duration || 5000,
    remainingTime: toast.duration || 5000,
    running: false,
    started: false
  }

  toasts.value.push(newToast)
  // 延后一帧启动，确保初始宽度100%先渲染，再触发过渡
  nextTick(() => {
    requestAnimationFrame(() => startTimer(newToast))
  })

  // 设置自动移除计时器
  startTimer(newToast)
}

const startTimer = (toast: Toast) => {
  if (toast.timerId) {
    clearTimeout(toast.timerId)
  }

  // 设置结束时间并开始倒计时
  toast.endAt = Date.now() + (toast.remainingTime || 0)
  toast.started = true
  toast.running = true

  toast.timerId = window.setTimeout(() => {
    removeToast(toast.id)
  }, toast.remainingTime)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    const toast = toasts.value[index]
    if (toast.timerId) {
      clearTimeout(toast.timerId)
    }
    toasts.value.splice(index, 1)
  }
}

const pauseTimer = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && toast.timerId) {
    clearTimeout(toast.timerId)
    const now = Date.now()
    if (toast.endAt) {
      toast.remainingTime = Math.max(0, toast.endAt - now)
    }
    toast.running = false
    toast.timerId = undefined
  }
}

const resumeTimer = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && toast.remainingTime != null) {
    if (toast.remainingTime > 0) {
      startTimer(toast)
    } else {
      removeToast(id)
    }
  }
}

// 进度条宽度样式
const getProgressStyle = (toast: Toast) => {
  const total = toast.duration || 0
  const remaining = toast.remainingTime || 0
  const percent = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0
  return toast.running ? { width: '0%' } : { width: percent + '%' }
}

// 全局方法
const showSuccess = (message: string, duration?: number) => {
  addToast({ type: 'success', message, duration })
}

const showError = (message: string, duration?: number) => {
  addToast({ type: 'error', message, duration })
}

const showWarning = (message: string, duration?: number) => {
  addToast({ type: 'warning', message, duration })
}

const showInfo = (message: string, duration?: number) => {
  addToast({ type: 'info', message, duration })
}

// 暴露方法给父组件
defineExpose({
  showSuccess,
  showError,
  showWarning,
  showInfo,
  addToast,
  removeToast
})

// 全局事件监听
const handleGlobalToast = (event: CustomEvent) => {
  addToast(event.detail)
}

onMounted(() => {
  window.addEventListener('show-toast', handleGlobalToast as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('show-toast', handleGlobalToast as EventListener)
  // 清理所有计时器
  toasts.value.forEach(toast => {
    if (toast.timerId) {
      clearTimeout(toast.timerId)
    }
  })
})
</script>

<style scoped>
.toast {
  min-width: 300px;
  margin-bottom: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.toast-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.toast-body {
  word-wrap: break-word;
}

/* 进度条 */
.toast-progress {
  position: relative;
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
}

.toast-progress-bar {
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.75);
  transition: none;
  display: block;
  margin-right: auto; /* 左对齐，宽度减少时右侧向左移动，实现从右到左的运动效果 */
}

/* 运行中：从当前宽度缓动到 0% */
.toast-progress-bar.running {
  transition: width var(--toast-duration, 0ms) linear;
  width: 0%;
}

/* 淡色背景时使用深色进度条（如 warning）*/
.bg-warning .toast-progress {
  background: rgba(0, 0, 0, 0.1);
}
.bg-warning .toast-progress-bar {
  background: rgba(0, 0, 0, 0.45);
}

.btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.bg-warning .btn-close {
  filter: none;
}

/* 滑动动画效果 */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}

/* 悬停效果 */
.toast:hover {
  transform: translateX(5px);
  transition: transform 0.2s ease;
}

/* 响应式调整 */
@media (max-width: 576px) {
  .toast {
    min-width: 280px;
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .toast-container {
    left: 0;
    right: 0;
    padding: 1rem;
  }
}
</style>
