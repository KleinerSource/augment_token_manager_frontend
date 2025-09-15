<template>
  <header class="navbar navbar-expand-md navbar-light bg-white border-bottom d-print-none">
    <div class="container-xl">
      <!-- 项目品牌 -->
      <div class="navbar-brand d-flex align-items-center">
        <div class="brand-icon me-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-key" width="32" height="32" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="8" cy="15" r="4"/>
            <path d="m10.85 12.15l9.15 -9.15"/>
            <path d="m18 6l2 2"/>
            <path d="m15 9l-2 -2"/>
          </svg>
        </div>
        <div class="brand-text">
          <div class="brand-title">Augment Token Manager</div>
          <div class="brand-subtitle">令牌管理系统</div>
        </div>
      </div>

      <!-- 导航菜单 + 用户信息容器 -->
      <div class="nav-container d-flex align-items-center ms-auto flex-nowrap">
        <div class="nav-menu d-flex align-items-center flex-nowrap">
          <router-link to="/" class="nav-link px-3" active-class="active">
            <span class="nav-link-icon me-2">
              <i class="bi bi-key" style="font-size: 1.25rem;"></i>
            </span>
            <span class="nav-link-title">Token 管理</span>
          </router-link>
          <router-link
            v-if="isActivationCodeManagerEnabled()"
            to="/activation"
            class="nav-link px-3"
            active-class="active"
          >
            <span class="nav-link-icon me-2">
              <i class="bi bi-credit-card" style="font-size: 1.25rem;"></i>
            </span>
            <span class="nav-link-title">激活码管理</span>
          </router-link>
          <router-link
            v-if="isUuidManagerEnabled()"
            to="/uuid"
            class="nav-link px-3"
            active-class="active"
          >
            <span class="nav-link-icon me-2">
              <i class="bi bi-fingerprint" style="font-size: 1.25rem;"></i>
            </span>
            <span class="nav-link-title">UUID 管理</span>
          </router-link>
        </div>

        <!-- 到期提醒铃铛 -->
        <div class="nav-item me-3 position-relative" v-if="expiringTokens.length > 0" ref="bellRef">
          <div
            class="nav-link d-flex align-items-center p-2 border-0 bg-transparent position-relative cursor-pointer"
            @click="toggleExpiringPopover"
            :title="`有 ${expiringTokens.length} 个Token即将到期`"
          >
            <i class="bi bi-bell-fill notification-bell" style="font-size: 1.25rem;"></i>
            <span class="badge position-absolute top-0 start-100 translate-middle rounded-pill notification-badge">
              {{ expiringTokens.length }}
            </span>
          </div>

          <!-- 悬浮窗 -->
          <div
            v-if="showExpiringPopover"
            class="expiring-popover position-absolute"
            @click.stop
          >
            <div class="popover-header">
              <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              Token到期提醒
              <button type="button" class="btn-close btn-close-sm ms-auto" @click="closeExpiringPopover"></button>
            </div>
            <div class="popover-body">
              <div class="alert alert-warning alert-sm mb-3">
                <i class="bi bi-info-circle me-2"></i>
                以下Token快到期了且次数超过45次：
              </div>

              <div class="expiring-tokens-list">
                <div v-for="token in expiringTokens" :key="token.id" class="token-item">
                  <div class="token-info">
                    <div class="token-email">{{ token.email_note || '未设置备注' }}</div>
                    <div class="token-stats">
                      <span class="time-badge">{{ formatRemainingTime(token) }}</span>
                      <span class="credits-badge">{{ getRemainingCredits(token) }}次</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="nav-item dropdown ms-4" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            class="nav-link d-flex align-items-center p-2 border-0 bg-transparent"
            aria-label="Open user menu"
          >
            <span class="avatar avatar-sm me-2" style="background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjNjk3Njg5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzLjk5IDcuMDEgMTUuNzQgNiAxOC4yNEM1Ljk5IDE4LjQ4IDYuMTcgMTguNzEgNi40MSAxOC43MUgxNy41OUMxNy44MyAxOC43MSAxOC4wMSAxOC40OCAxOCAxOC4yNEMxNi45OSAxNS43NCAxNC42NyAxMy45OSAxMiAxNFoiIGZpbGw9IiM2OTc2ODkiLz4KPC9zdmc+)"></span>
            <div class="user-info d-none d-lg-block">
              <div class="user-name">{{ username }}</div>
              <div class="user-role">管理员</div>
            </div>
            <i
              class="bi bi-chevron-down ms-2 dropdown-arrow"
              :class="{ 'rotated': isDropdownOpen }"
            ></i>
          </button>
          <div
            class="dropdown-menu dropdown-menu-end"
            :class="{ 'show': isDropdownOpen }"
          >
            <button @click="handleLogout" class="dropdown-item">
              <i class="bi bi-box-arrow-right dropdown-item-icon"></i>
              登出
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>


</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '../utils/toast'
import { isUuidManagerEnabled, isActivationCodeManagerEnabled } from '../types/feature-flags'

// Token类型定义
interface Token {
  id: string
  email_note: string
  portal_info: string
  ban_status: string
  created_at: string
}

const router = useRouter()
const username = ref<string>('')
const isDropdownOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement>()

// 到期提醒相关状态
const tokens = ref<Token[]>([])
const showExpiringPopover = ref<boolean>(false)
const bellRef = ref<HTMLElement>()

onMounted(() => {
  // 获取用户名
  const storedUsername = localStorage.getItem('username')
  username.value = storedUsername || 'Admin'

  // 添加全局点击事件监听器
  document.addEventListener('click', handleClickOutside)

  // 加载Token数据
  loadTokens()

  // 定时刷新Token数据（每5分钟）
  setInterval(loadTokens, 5 * 60 * 1000)
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('click', handleClickOutside)
})

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 处理点击外部区域关闭下拉菜单和悬浮窗
const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
  if (bellRef.value && !bellRef.value.contains(event.target as Node)) {
    showExpiringPopover.value = false
  }
}

// 加载Token数据
const loadTokens = async () => {
  try {
    const response = await fetch('/api/tokens?limit=10000')

    if (response.ok) {
      const data = await response.json()
      if (data.success) {
        tokens.value = data.data || []
        console.log('加载Token数据成功:', tokens.value.length, '个Token')
      }
    }
  } catch (error) {
    console.error('加载Token数据失败:', error)
  }
}

// 计算剩余天数和小时数
const calculateRemainingTime = (token: Token): { days: number, hours: number, totalDays: number } => {
  try {
    const portalInfo = JSON.parse(token.portal_info)
    if (!portalInfo || !portalInfo.expiry_date) return { days: 0, hours: 0, totalDays: 0 }

    const expiryDate = new Date(portalInfo.expiry_date)
    if (isNaN(expiryDate.getTime())) return { days: 0, hours: 0, totalDays: 0 }

    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()

    if (diffTime <= 0) return { days: 0, hours: 0, totalDays: 0 }

    const totalHours = Math.floor(diffTime / (1000 * 60 * 60))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return { days, hours, totalDays }
  } catch {
    return { days: 0, hours: 0, totalDays: 0 }
  }
}

// 格式化剩余时间显示
const formatRemainingTime = (token: Token): string => {
  const timeInfo = calculateRemainingTime(token)
  if (timeInfo.totalDays === 0) return '-'

  if (timeInfo.days === 0) {
    return `${timeInfo.hours}小时`
  } else if (timeInfo.hours === 0) {
    return `${timeInfo.days}天`
  } else {
    return `${timeInfo.days}天${timeInfo.hours}小时`
  }
}

// 获取剩余次数
const getRemainingCredits = (token: Token): string => {
  try {
    const portalInfo = JSON.parse(token.portal_info)
    if (!portalInfo || portalInfo.credits_balance === undefined) return '-'
    return portalInfo.credits_balance.toString()
  } catch {
    return '-'
  }
}

// 计算即将到期的Token（时间<=1天且次数>45次）
const expiringTokens = computed(() => {
  const result = tokens.value.filter(token => {
    try {
      // 检查Token状态是否正常
      if (token.ban_status === '"ACTIVE"') return false

      // 解析portal_info获取到期时间
      const portalInfo = JSON.parse(token.portal_info)
      if (!portalInfo || !portalInfo.expiry_date) return false

      const expiryDate = new Date(portalInfo.expiry_date)
      if (isNaN(expiryDate.getTime())) return false

      // 计算距离到期的时间差（毫秒）
      const now = new Date()
      const diffTime = expiryDate.getTime() - now.getTime()

      // 如果已经过期，不提醒
      if (diffTime <= 0) return false

      // 转换为小时数
      const diffHours = diffTime / (1000 * 60 * 60)

      // 获取剩余次数
      const credits = getRemainingCredits(token)
      const creditsNum = credits === '-' ? 0 : parseInt(credits)

      // 剩余时间 <= 24小时 且 次数 > 45次
      const isExpiring = diffHours <= 24 && creditsNum > 45

      if (isExpiring) {
        console.log('发现即将到期Token:', token.email_note, '剩余小时:', Math.floor(diffHours), '剩余次数:', creditsNum, '到期时间:', portalInfo.expiry_date)
      }

      return isExpiring
    } catch (error) {
      console.error('解析Token信息失败:', error, token)
      return false
    }
  })

  console.log('总Token数:', tokens.value.length, '即将到期Token数:', result.length)
  return result
})

// 切换到期提醒悬浮窗
const toggleExpiringPopover = () => {
  showExpiringPopover.value = !showExpiringPopover.value
}

// 关闭到期提醒悬浮窗
const closeExpiringPopover = () => {
  showExpiringPopover.value = false
}

const handleLogout = async () => {
  // 关闭下拉菜单
  isDropdownOpen.value = false

  try {
    // 调用登出API
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    })

    const data = await response.json()

    if (data.success) {
      // 清除登录信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('username')

      toast.success('登出成功')

      // 跳转到登录页
      router.push('/login')
    } else {
      // API返回失败，但仍然清除本地信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('username')

      toast.warning('登出请求失败，但已清除本地登录信息')
      router.push('/login')
    }
  } catch (error) {
    console.error('登出请求失败:', error)

    // 网络错误时也清除本地信息
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')

    toast.warning('登出请求失败，但已清除本地登录信息')
    router.push('/login')
  }
}
</script>

<style scoped>
/* 品牌区域样式 */
.navbar-brand {
  margin-right: auto;
}

.brand-icon {
  color: var(--tblr-primary);
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--tblr-dark);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--tblr-muted);
  line-height: 1;
}

.nav-container {
  /* 保证在小屏下不换行 */
  white-space: nowrap;
}

/* 导航菜单样式 */
.nav-menu {
  border-right: 1px solid var(--tblr-border-color);
  padding-right: 1rem;
  margin-right: 1rem;
  flex: 0 1 auto;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 0.375rem;
  color: var(--tblr-muted);
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--tblr-primary-lt);
  color: var(--tblr-primary);
}

.nav-link.active {
  background-color: var(--tblr-primary);
  color: white !important;
}

.nav-link-icon {
  display: flex;
  align-items: center;
}

.nav-link-title {
  font-size: 0.875rem;
}

/* 大屏幕下图标和文字的间距 */
@media (min-width: 769px) {
  .nav-link-icon {
    margin-right: 0.5rem !important;
  }
}

/* 用户信息样式 */
.user-info {
  text-align: left;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--tblr-dark);
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: var(--tblr-muted);
  line-height: 1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  background-color: #fff;
  border: 1px solid var(--tblr-border-color);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.dropdown-item-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.dropdown-arrow {
  transition: transform 0.2s ease-in-out;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container-xl {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .brand-subtitle {
    display: none;
  }

  .brand-title {
    font-size: 1rem;
  }

  .nav-menu {
    border-right: none;
    padding-right: 0;
    margin-right: 0;
    flex-wrap: nowrap;
  }

  .nav-link-title {
    display: none;
  }

  .nav-link {
    padding: 0.375rem 0.25rem;
    margin: 0 0.125rem;
    min-width: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .nav-link-icon {
    margin-right: 0 !important;
  }

  .nav-item.dropdown {
    margin-left: 0.5rem;
  }

  .user-info {
    display: none !important;
  }

  .dropdown-arrow {
    margin-left: 0.25rem;
  }
}

@media (max-width: 576px) {
  .brand-text {
    display: none;
  }

  .brand-icon {
    margin-right: 0;
  }

  .nav-link {
    padding: 0.25rem;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .nav-item.dropdown {
    margin-left: 0.25rem;
  }

  .nav-link.d-flex {
    padding: 0.25rem 0.5rem;
  }
}

/* 到期提醒铃铛样式 */
.cursor-pointer {
  cursor: pointer;
}

.nav-link:hover .bi-bell-fill {
  animation: bell-shake 0.5s ease-in-out;
}

@keyframes bell-shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* 通知铃铛图标样式 */
.notification-bell {
  color: #ffa726 !important;
  filter: drop-shadow(0 1px 2px rgba(255, 167, 38, 0.3));
  transition: all 0.2s ease-in-out;
}

.nav-link:hover .notification-bell {
  color: #ff9800 !important;
  filter: drop-shadow(0 2px 4px rgba(255, 152, 0, 0.4));
}

/* 通知角标样式 */
.notification-badge {
  background: linear-gradient(135deg, #ff4757, #ff3742) !important;
  color: white !important;
  font-size: 0.65rem !important;
  font-weight: 600 !important;
  min-width: 18px !important;
  height: 18px !important;
  line-height: 18px !important;
  padding: 0 !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3) !important;
  text-align: center !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 到期提醒悬浮窗样式 */
.expiring-popover {
  top: 100%;
  right: 0;
  z-index: 1050;
  width: 320px;
  background: white;
  border: 1px solid var(--tblr-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-top: 0.5rem;
  animation: popover-fade-in 0.2s ease-out;
}

@keyframes popover-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.popover-header {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--tblr-bg-surface-secondary);
  border-bottom: 1px solid var(--tblr-border-color);
  border-radius: 0.5rem 0.5rem 0 0;
  font-weight: 600;
  font-size: 0.875rem;
}

.popover-body {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.alert-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.expiring-tokens-list {
  max-height: 200px;
  overflow-y: auto;
}

.token-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--tblr-border-color-light);
}

.token-item:last-child {
  border-bottom: none;
}

.token-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.token-email {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--tblr-dark);
  flex: 1;
  margin-right: 0.5rem;
}

.token-stats {
  display: flex;
  gap: 0.5rem;
}

.time-badge {
  background: var(--tblr-danger);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.credits-badge {
  background: var(--tblr-success);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.popover-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--tblr-border-color);
  background: var(--tblr-bg-surface-secondary);
  border-radius: 0 0 0.5rem 0.5rem;
}

.btn-close-sm {
  font-size: 0.75rem;
  width: 1rem;
  height: 1rem;
}

/* 额外的小屏修复，确保单行显示并避免换行 */
@media (max-width: 768px) {
  .navbar .container-xl {
    flex-wrap: nowrap;
  }

  .nav-menu {
    flex: 1 1 auto;
    min-width: 0;
  }

  .nav-item.dropdown {
    flex: 0 0 auto;
  }
}
</style>
