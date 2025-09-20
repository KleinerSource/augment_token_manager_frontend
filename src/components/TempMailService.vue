<template>
  <!-- 临时邮箱悬浮窗 -->
  <div v-if="showPanel && hasTempMailServicePermission" class="floating-panel temp-mail-panel">
    <div class="panel-header">
      <h6 class="panel-title">
        <i class="bi bi-mailbox me-2"></i>
        临时邮箱
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
            :readonly="isPolling || isStartingPoll"
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
      <div v-if="statusMessage" class="alert alert-info small py-2 mb-3">
        {{ statusMessage }}
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
          :class="['btn', 'btn-sm', 'flex-grow-1', isPolling ? 'btn-danger' : 'btn-success']"
          @click="isPolling ? stopPolling() : startPolling()"
          :disabled="!email || isStartingPoll"
        >
          <i v-if="isStartingPoll" class="bi bi-arrow-clockwise refresh-spin me-1"></i>
          <i v-else-if="isPolling" class="bi bi-x-lg me-1"></i>
          <i v-else class="bi bi-check-lg me-1"></i>
          {{ isStartingPoll ? '启动中...' : (isPolling ? '停止监听' : '监听邮件') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { toast } from '../utils/toast'
import { showFloatingPanel, closeFloatingPanel, isFloatingPanelVisible } from '../utils/floatingPanelState'
import { PermissionManager } from '../types/permissions'

const showPanel = computed(() => isFloatingPanelVisible('temp-mail'))
const hasTempMailServicePermission = computed(() => PermissionManager.hasTempMailService())
const email = ref('')
const verificationCode = ref('')
const statusMessage = ref('')
const isGenerating = ref(false)
const isStartingPoll = ref(false)
const isPolling = ref(false)
let pollingInterval: number | null = null

// 复制到剪贴板
const copyToClipboard = async (text: string, label: string) => {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {

    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    } catch (fallbackError) {
      toast.error('复制失败，请手动复制')
    }
  }
}

// 生成临时邮箱
const generateEmail = async () => {
  isGenerating.value = true
  try {
    const response = await fetch('/api/temp-mail/generate-email')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.email) {
      email.value = data.email
      verificationCode.value = ''
      toast.success('临时邮箱生成成功')
    } else {
      toast.error('邮箱生成失败：响应中没有邮箱地址')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    toast.error(`生成邮箱失败：${errorMessage}`)
  } finally {
    isGenerating.value = false
  }
}

// 获取邮件并提取验证码
const checkEmails = async () => {
  if (!email.value) return

  try {
    const encodedEmail = encodeURIComponent(email.value)
    const response = await fetch(`/api/temp-mail/get-emails?email=${encodedEmail}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.emails && data.emails.length > 0) {
      // 筛选来自 support@augmentcode.com 的邮件
      const augmentEmails = data.emails.filter((email: any) =>
        email.from === 'support@augmentcode.com' &&
        email.subject === 'Welcome to Augment Code' &&
        email.content.includes('Your verification code is:')
      )

      if (augmentEmails.length > 0) {
        // 取最新的邮件（timestamp 最大的）
        const latestEmail = augmentEmails.reduce((latest: any, current: any) =>
          current.timestamp > latest.timestamp ? current : latest
        )

        // 提取验证码
        const codeMatch = latestEmail.content.match(/Your verification code is:\s*(\d+)/)
        if (codeMatch && codeMatch[1]) {
          const newCode = codeMatch[1]

          if (newCode !== verificationCode.value) {
            verificationCode.value = newCode
            toast.success(`收到新验证码: ${newCode}`)
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    statusMessage.value = `获取邮件失败：${errorMessage}`
  }
}

// 开始轮询邮件
const startPolling = () => {
  if (!email.value) {
    toast.error('请先输入邮箱地址或生成临时邮箱')
    return
  }

  isStartingPoll.value = true
  verificationCode.value = ''
  statusMessage.value = '开始监听邮件...'

  // 停止之前的轮询
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }

  // 立即检查一次
  checkEmails()

  // 每5秒检查一次邮件
  pollingInterval = setInterval(checkEmails, 5000)
  
  isPolling.value = true
  isStartingPoll.value = false
  statusMessage.value = '正在监听邮件，等待验证码...'
  toast.info('开始监听邮件')
}

// 停止轮询
const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
  isPolling.value = false
  statusMessage.value = '已停止监听邮件'
  toast.info('已停止监听邮件')
}

// 关闭悬浮窗
const closePanel = () => {
  closeFloatingPanel()
  stopPolling()
}

// 组件卸载时清理轮询
onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>

.floating-panel.temp-mail-panel {
  position: fixed;
  bottom: 100px;
  left: 20px;
  width: 250px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--tblr-border-color);
  z-index: 1065;
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
  .floating-button.temp-mail {
    left: 20px; /* 移动端调整位置 */
  }
  
  .floating-panel.temp-mail-panel {
    width: 200px;
    left: 5px;
    bottom: 5px;
  }
}
</style>
