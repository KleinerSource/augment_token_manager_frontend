// 功能标志类型定义
export interface FeatureFlags {
  VITE_ENABLE_EMAIL_SUBSCRIPTION: boolean
  VITE_ENABLE_UUID_MANAGER: boolean
  VITE_ENABLE_ACTIVATION_CODE_MANAGER: boolean
}

// 全局功能标志声明
declare global {
  const __FEATURE_FLAGS__: FeatureFlags
}

// 功能标志访问器
export const featureFlags: FeatureFlags = typeof __FEATURE_FLAGS__ !== 'undefined' 
  ? __FEATURE_FLAGS__ 
  : {
      // 开发环境默认值（全部启用）
      VITE_ENABLE_EMAIL_SUBSCRIPTION: true,
      VITE_ENABLE_UUID_MANAGER: true,
      VITE_ENABLE_ACTIVATION_CODE_MANAGER: true
    }

// 便捷的功能检查函数
export const isEmailSubscriptionEnabled = () => featureFlags.VITE_ENABLE_EMAIL_SUBSCRIPTION
export const isUuidManagerEnabled = () => featureFlags.VITE_ENABLE_UUID_MANAGER
export const isActivationCodeManagerEnabled = () => featureFlags.VITE_ENABLE_ACTIVATION_CODE_MANAGER
