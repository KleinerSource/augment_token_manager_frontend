// 权限类型定义
export interface UserPermissions {
  // 基础功能权限
  token_management: boolean          // Token管理
  activation_code_management: boolean // 激活码管理
  uuid_management: boolean           // UUID管理
  comprehensive_management: boolean   // 综合管理
  
  // 扩展功能权限
  email_subscription: boolean        // 邮箱订阅
  temp_mail_service: boolean         // 临时邮箱服务
  
  // 管理员权限
  user_management?: boolean          // 用户管理
  system_settings?: boolean          // 系统设置
}

// 用户信息接口
export interface UserInfo {
  id: string
  username: string
  email?: string
  role: string
  permissions: UserPermissions
  created_at?: string
  last_login?: string
}

// 登录响应接口
export interface LoginResponse {
  success: boolean
  message?: string
  error?: string
  data?: {
    token: string
    user: UserInfo
  }
}

// 权限检查函数
export class PermissionManager {
  private static permissions: UserPermissions | null = null
  private static licensePermissions: string[] | null = null

  // 设置用户权限
  static setPermissions(permissions: UserPermissions) {
    this.permissions = permissions
    // 保存到 localStorage 以便页面刷新后恢复
    localStorage.setItem('user_permissions', JSON.stringify(permissions))
  }

  // 获取用户权限
  static getPermissions(): UserPermissions | null {
    if (this.permissions) {
      return this.permissions
    }
    
    // 从 localStorage 恢复权限
    const stored = localStorage.getItem('user_permissions')
    if (stored) {
      try {
        this.permissions = JSON.parse(stored)
        return this.permissions
      } catch (error) {
        console.error('Failed to parse stored permissions:', error)
        localStorage.removeItem('user_permissions')
      }
    }
    
    return null
  }

  // 清除权限
  static clearPermissions() {
    this.permissions = null
    this.licensePermissions = null
    localStorage.removeItem('user_permissions')
  }

  // 获取原始授权权限
  static getLicensePermissions(): string[] | null {
    return this.licensePermissions
  }

  // 检查是否有特定的授权权限
  static hasLicensePermission(permission: string): boolean {
    return this.licensePermissions?.includes(permission) ?? false
  }

  // 根据授权权限设置用户权限
  static setPermissionsFromLicense(licensePermissions: string[] | null) {
    // 存储原始授权权限
    this.licensePermissions = licensePermissions

    const permissions: UserPermissions = {
      // Token 管理始终可用
      token_management: true,
      // 综合管理需要 advanced 权限
      comprehensive_management: licensePermissions?.includes('advanced') ?? false,
      // 其他功能根据授权权限决定
      activation_code_management: licensePermissions?.includes('advanced') ?? false,
      uuid_management: licensePermissions?.includes('advanced') ?? false,
      email_subscription: licensePermissions?.includes('emailsubscription') ?? false,
      temp_mail_service: licensePermissions?.includes('tempmail') ?? false,
      user_management: false,
      system_settings: false
    }

    this.setPermissions(permissions)
  }

  // 权限检查方法
  static hasTokenManagement(): boolean {
    return this.getPermissions()?.token_management ?? false
  }

  static hasActivationCodeManagement(): boolean {
    return this.getPermissions()?.activation_code_management ?? false
  }

  static hasUuidManagement(): boolean {
    return this.getPermissions()?.uuid_management ?? false
  }

  static hasComprehensiveManagement(): boolean {
    return this.getPermissions()?.comprehensive_management ?? false
  }

  static hasEmailSubscription(): boolean {
    return this.getPermissions()?.email_subscription ?? false
  }

  static hasTempMailService(): boolean {
    return this.getPermissions()?.temp_mail_service ?? false
  }

  static hasUserManagement(): boolean {
    return this.getPermissions()?.user_management ?? false
  }

  static hasSystemSettings(): boolean {
    return this.getPermissions()?.system_settings ?? false
  }

  // 检查是否有任何管理权限
  static hasAnyManagementPermission(): boolean {
    const perms = this.getPermissions()
    if (!perms) return false
    
    return perms.token_management || 
           perms.activation_code_management || 
           perms.uuid_management || 
           perms.comprehensive_management
  }
}

// 默认权限配置（用于开发环境或权限获取失败时的后备）
export const DEFAULT_PERMISSIONS: UserPermissions = {
  token_management: true,
  activation_code_management: true,
  uuid_management: true,
  comprehensive_management: true,
  email_subscription: true,
  temp_mail_service: true,
  user_management: false,
  system_settings: false
}
