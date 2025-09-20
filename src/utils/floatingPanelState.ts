import { ref } from 'vue'

// 悬浮窗类型
export type FloatingPanelType = 'email-subscription' | 'temp-mail' | null

// 全局状态：当前显示的悬浮窗
export const currentFloatingPanel = ref<FloatingPanelType>(null)

// 显示指定的悬浮窗（会自动关闭其他悬浮窗）
export const showFloatingPanel = (panelType: FloatingPanelType) => {
  currentFloatingPanel.value = panelType
}

// 关闭悬浮窗
export const closeFloatingPanel = () => {
  currentFloatingPanel.value = null
}

// 检查指定悬浮窗是否显示
export const isFloatingPanelVisible = (panelType: FloatingPanelType) => {
  return currentFloatingPanel.value === panelType
}
