<template>
  <!-- 悬浮按钮 -->
  <div class="floating-button" @click="togglePanel">
    <i class="bi bi-envelope-fill"></i>
  </div>

  <!-- 邮件订阅悬浮窗 -->
  <div v-if="showPanel" class="floating-panel">
    <div class="panel-header">
      <h6 class="panel-title">
        <i class="bi bi-envelope me-2"></i>
        邮件订阅
      </h6>
      <button type="button" class="btn-close btn-close-sm" @click="closePanel"></button>
    </div>
    <div class="panel-body">
      <div class="mb-3">
        <label class="form-label small">邮箱地址</label>
        <div class="input-group input-group-sm">
          <input
            v-model="email"
            type="email"
            class="form-control"
            placeholder="请输入邮箱地址"
            :readonly="isConnected || isSubscribing"
          >
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="copyToClipboard(email, '邮箱地址')"
            :disabled="!email"
          >
            <i class="bi bi-copy"></i>
          </button>
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label small">验证码</label>
        <div class="input-group input-group-sm">
          <input
            v-model="verificationCode"
            type="text"
            class="form-control"
            placeholder="等待验证码..."
            readonly
          >
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="copyToClipboard(verificationCode, '验证码')"
            :disabled="!verificationCode"
          >
            <i class="bi bi-copy"></i>
          </button>
        </div>
      </div>
      <div v-if="connectionStatus" class="alert alert-info small py-2 mb-3">
        {{ connectionStatus }}
      </div>
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn btn-primary btn-xs flex-shrink-0"
          @click="generateEmail"
          :disabled="isGenerating"
        >
          <i v-if="isGenerating" class="bi bi-arrow-clockwise refresh-spin me-1"></i>
          <i v-else class="bi bi-arrow-repeat me-1"></i>
          {{ isGenerating ? '生成中...' : '生成' }}
        </button>
        <button
          type="button"
          :class="['btn', 'btn-sm', 'flex-grow-1', isConnected ? 'btn-danger' : 'btn-success']"
          @click="isConnected ? disconnectWebSocket() : subscribeEmail()"
          :disabled="!email || isSubscribing"
        >
          <i v-if="isSubscribing" class="bi bi-arrow-clockwise refresh-spin me-1"></i>
          <i v-else-if="isConnected" class="bi bi-x-lg me-1"></i>
          <i v-else class="bi bi-check-lg me-1"></i>
          {{ isSubscribing ? '连接中...' : (isConnected ? '断开连接' : '订阅邮件') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { toast } from '../utils/toast'

const showPanel = ref(false)
const email = ref('')
const verificationCode = ref('')
const connectionStatus = ref('')
const isGenerating = ref(false)
const isSubscribing = ref(false)
const isConnected = ref(false)
let websocket: WebSocket | null = null

// 复制到剪贴板
const copyToClipboard = async (text: string, label: string) => {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label}已复制到剪贴板`)
  } catch (error) {
    console.error('复制失败:', error)

    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success(`${label}已复制到剪贴板`)
    } catch (fallbackError) {
      console.error('降级复制方案也失败:', fallbackError)
      toast.error('复制失败，请手动复制')
    }
  }
}

// 生成邮箱
const generateEmail = async () => {
  isGenerating.value = true
  try {
    const response = await fetch('/api/email-subscribe/generate-mail')
    const data = await response.json()

    if (data.success && data.data?.email) {
      email.value = data.data.email
      verificationCode.value = ''
      connectionStatus.value = ''
      toast.success(data.message || '邮箱生成成功')
    } else {
      toast.error(data.message || '邮箱生成失败')
    }
  } catch (error) {
    console.error('生成邮箱失败:', error)
    toast.error('生成邮箱失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 订阅邮件
const subscribeEmail = () => {
  if (!email.value) {
    toast.error('请先生成邮箱地址')
    return
  }

  isSubscribing.value = true
  verificationCode.value = ''
  connectionStatus.value = '正在连接验证码推送服务...'

  // 关闭之前的连接
  if (websocket) {
    websocket.close()
  }

  // 对邮箱地址进行URL编码
  const encodedEmail = encodeURIComponent(email.value)

  // 使用相对路径，通过 Nginx 反向代理
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/mail/api/subscribe/${encodedEmail}`

  try {
    websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      isConnected.value = true
      isSubscribing.value = false
      connectionStatus.value = '已连接到推送服务，等待验证码...'
      toast.info('已连接到验证码推送服务')
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.status === 'connected') {
          connectionStatus.value = data.message || '已连接到推送服务，等待验证码...'
        } else if (data.code) {
          verificationCode.value = data.code
          connectionStatus.value = `验证码已接收: ${data.code}`
          toast.success(`验证码已接收: ${data.code}`)

          // 不自动关闭连接，用户可能需要重复收件
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket连接错误:', error)
      connectionStatus.value = '连接失败，请稍后重试'
      toast.error('连接验证码推送服务失败')
      isConnected.value = false
      isSubscribing.value = false
    }

    websocket.onclose = () => {
      connectionStatus.value = '连接已关闭'
      isConnected.value = false
      isSubscribing.value = false
    }
  } catch (error) {
    console.error('创建WebSocket连接失败:', error)
    toast.error('创建连接失败')
    isSubscribing.value = false
  }
}

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (websocket) {
    websocket.close()
    websocket = null
  }
  isConnected.value = false
  isSubscribing.value = false
  connectionStatus.value = '连接已断开'
  toast.info('已断开验证码推送服务')
}

// 切换悬浮窗显示
const togglePanel = () => {
  showPanel.value = !showPanel.value
}

// 关闭悬浮窗
const closePanel = () => {
  showPanel.value = false
  if (websocket) {
    websocket.close()
    websocket = null
  }
  isConnected.value = false
  isSubscribing.value = false
  connectionStatus.value = ''
}

// 组件卸载时清理WebSocket连接
onUnmounted(() => {
  if (websocket) {
    websocket.close()
  }
})
</script>

<style scoped>
.floating-button {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 56px;
  height: 56px;
  background-color: #206bc4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1060;
}

.floating-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: #0054a6;
}

.floating-button i {
  color: white;
  font-size: 1.25rem;
}

.floating-panel {
  position: fixed;
  bottom: 90px;
  left: 20px;
  width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--tblr-border-color);
  z-index: 1060;
  animation: slideUp 0.3s ease-out;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--tblr-border-color);
  background-color: var(--tblr-bg-surface);
  border-radius: 8px 8px 0 0;
}

.panel-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--tblr-body-color);
}

.panel-body {
  padding: 16px;
}

.btn-close-sm {
  font-size: 0.75rem;
  width: 1.5rem;
  height: 1.5rem;
}

.refresh-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 576px) {
  .floating-panel {
    width: calc(100vw - 40px);
    left: 20px;
    right: 20px;
  }
}

/* 自定义按钮尺寸 */
.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  line-height: 1.2;
  border-radius: 0.2rem;
}
</style>
