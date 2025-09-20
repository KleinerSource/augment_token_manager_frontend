<template>
  <!-- 堆叠式悬浮按钮组 -->
  <div v-if="hasAnyAdvancedFeature" class="stacked-floating-buttons">
    <!-- 子按钮组（向上弹出） -->
    <div class="sub-buttons" :class="{ 'expanded': isExpanded }">
      <!-- 批量验证按钮 -->
      <button
        v-if="showBatchValidate && hasAdvancedPermission"
        class="sub-floating-btn validate-btn"
        :disabled="isBatchValidating"
        @click="handleBatchValidateClick"
        :title="isBatchValidating ? '验证中...' : '批量验证'"
      >
        <i
          :class="['bi', isBatchValidating ? 'bi-check-circle refresh-spin' : 'bi-check-circle']"
          :style="isBatchValidating ? 'animation: refresh-rotate 1s linear infinite; transform-origin: center center; display: inline-block;' : ''"
        ></i>
      </button>

      <!-- 批量刷新按钮 -->
      <button
        v-if="showBatchRefresh && hasAdvancedPermission"
        class="sub-floating-btn refresh-btn"
        :disabled="isBatchRefreshing"
        @click="handleBatchRefreshClick"
        :title="isBatchRefreshing ? '刷新中...' : '批量刷新'"
      >
        <i
          :class="['bi', isBatchRefreshing ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
          :style="isBatchRefreshing ? 'animation: refresh-rotate 1s linear infinite; transform-origin: center center; display: inline-block;' : ''"
        ></i>
      </button>
      <!-- 邮箱订阅按钮 -->
      <button 
        v-if="showEmailSubscription"
        class="sub-floating-btn email-btn"
        @click="handleEmailSubscriptionClick"
        title="邮箱订阅"
      >
        <i class="bi bi-envelope-fill"></i>
      </button>

      <!-- 临时邮箱按钮 -->
      <button 
        v-if="showTempMail"
        class="sub-floating-btn temp-mail-btn"
        @click="handleTempMailClick"
        title="临时邮箱"
      >
        <i class="bi bi-mailbox"></i>
      </button>
    </div>

    <!-- 主按钮 -->
    <button
      class="main-floating-btn"
      :class="{ 'expanded': isExpanded }"
      @click="toggleExpanded"
      :title="isExpanded ? '收起菜单' : '展开菜单'"
    >
      <i :class="['bi', isExpanded ? 'bi-x-lg' : 'bi-plus-lg']"></i>
    </button>

    <!-- 遮罩层 -->
    <div 
      v-if="isExpanded" 
      class="floating-overlay"
      @click="closeExpanded"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PermissionManager } from '../types/permissions'
import { showFloatingPanel, closeFloatingPanel, isFloatingPanelVisible } from '../utils/floatingPanelState'

// Props
interface Props {
  showBatchRefresh?: boolean
  isBatchRefreshing?: boolean
  showBatchValidate?: boolean
  isBatchValidating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBatchRefresh: false,
  isBatchRefreshing: false,
  showBatchValidate: false,
  isBatchValidating: false
})

// Emits
const emit = defineEmits<{
  batchRefresh: []
  batchValidate: []
}>()

// 状态
const isExpanded = ref(false)

// 计算属性
const showEmailSubscription = computed(() => PermissionManager.hasEmailSubscription())
const showTempMail = computed(() => PermissionManager.hasTempMailService())

// 检查是否有高级权限（控制刷新功能）
const hasAdvancedPermission = computed(() => {
  return PermissionManager.hasLicensePermission('advanced')
})

// 检查是否有任何高级功能权限（决定是否显示整个悬浮按钮组）
const hasAnyAdvancedFeature = computed(() => {
  return hasAdvancedPermission.value || showEmailSubscription.value || showTempMail.value
})

// 方法
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const closeExpanded = () => {
  isExpanded.value = false
}

const handleEmailSubscriptionClick = () => {
  if (isFloatingPanelVisible('email-subscription')) {
    closeFloatingPanel()
  } else {
    showFloatingPanel('email-subscription')
  }
  closeExpanded()
}

const handleTempMailClick = () => {
  if (isFloatingPanelVisible('temp-mail')) {
    closeFloatingPanel()
  } else {
    showFloatingPanel('temp-mail')
  }
  closeExpanded()
}

const handleBatchRefreshClick = () => {
  emit('batchRefresh')
  closeExpanded()
}

const handleBatchValidateClick = () => {
  emit('batchValidate')
  closeExpanded()
}
</script>

<style scoped>
/* 主容器 */
.stacked-floating-buttons {
  position: fixed;
  left: 20px; /* 改为左下角 */
  bottom: 20px;
  z-index: 1060;
  display: flex;
  flex-direction: column; /* 正常排列，子按钮在上方 */
  align-items: center;
}

/* 遮罩层 */
.floating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 主按钮 */
.main-floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background-color: #206bc4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-size: 1.5rem;
  z-index: 2;
}

.main-floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: #0054a6;
}

.main-floating-btn.expanded {
  background-color: #dc3545;
  transform: rotate(45deg);
}

.main-floating-btn.expanded:hover {
  background-color: #c82333;
}

/* 子按钮容器 */
.sub-buttons {
  display: flex;
  flex-direction: column; /* 正常排列，从上往下显示 */
  align-items: center;
  gap: 12px;
  margin-bottom: 12px; /* 下边距，与主按钮保持间距 */
  opacity: 0;
  transform: translateY(-20px); /* 向上移动，实现向上展开效果 */
  pointer-events: none;
  transition: all 0.3s ease;
}

.sub-buttons.expanded {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* 子按钮 */
.sub-floating-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-size: 1.2rem;
  transform: scale(0.8);
}

.sub-buttons.expanded .sub-floating-btn {
  transform: scale(1);
}

.sub-floating-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
}

.sub-floating-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sub-floating-btn:disabled:hover {
  transform: scale(1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

/* 邮箱订阅按钮 */
.email-btn {
  background-color: #206bc4;
}

.email-btn:hover {
  background-color: #0054a6;
}

/* 临时邮箱按钮 */
.temp-mail-btn {
  background-color: #28a745;
}

.temp-mail-btn:hover {
  background-color: #1e7e34;
}

/* 批量验证按钮 */
.validate-btn {
  background-color: #ffc107;
  color: #000;
}

.validate-btn:hover {
  background-color: #ffca2c;
}

/* 批量刷新按钮 */
.refresh-btn {
  background-color: #6c757d;
}

.refresh-btn:hover {
  background-color: #5c636a;
}

/* 旋转动画 */
@keyframes refresh-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-spin {
  animation: refresh-rotate 1s linear infinite;
}

/* 响应式设计 */
@media (max-width: 767.98px) {
  .stacked-floating-buttons {
    left: 16px; /* 移动端也在左下角 */
    bottom: 16px;
  }

  .main-floating-btn {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
  }

  .sub-floating-btn {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  .sub-buttons {
    gap: 10px;
    margin-bottom: 10px; /* 下边距 */
  }
}

/* 确保按钮在小屏幕上不与其他元素重叠 */
@media (max-width: 575.98px) {
  .stacked-floating-buttons {
    left: 12px; /* 小屏幕也在左下角 */
    bottom: 12px;
  }
}
</style>
