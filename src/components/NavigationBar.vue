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
          <router-link
            v-if="hasComprehensiveManagement"
            to="/"
            class="nav-link px-3"
            active-class="active"
          >
            <span class="nav-link-icon me-2">
              <i class="bi bi-grid" style="font-size: 1.25rem;"></i>
            </span>
            <span class="nav-link-title">综合管理</span>
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
                      <span class="time-badge">{{ token.remaining_time }}</span>
                      <span class="credits-badge">{{ token.remaining_credits }}次</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表图标 -->
        <div class="nav-item dropdown me-3" ref="chartDropdownRef">
          <button
            @click="toggleChartDropdown"
            class="nav-link d-flex align-items-center p-1 border-0 bg-transparent position-relative chart-icon-btn"
            aria-label="查看图表"
          >
            <!-- 实时迷你图表 -->
            <div class="mini-chart-container">
              <div class="mini-chart-frame">
                <svg width="40" height="20" viewBox="0 0 40 20" class="mini-chart">
                  <!-- 背景网格 -->
                  <defs>
                    <pattern id="grid" width="5" height="4" patternUnits="userSpaceOnUse">
                      <path d="M 5 0 L 0 0 0 4" fill="none" stroke="currentColor" stroke-width="0.15" opacity="0.08"/>
                    </pattern>
                  </defs>
                  <rect width="40" height="20" fill="url(#grid)"/>

                  <!-- 显示3条账号数据趋势曲线 -->
                  <!-- 有效Token趋势曲线 -->
                  <path
                    :d="validTokensPath"
                    stroke="#28a745"
                    stroke-width="1"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="0.9"
                  />
                  <!-- 即将到期Token趋势曲线 -->
                  <path
                    :d="expiringTokensPath"
                    stroke="#ffc107"
                    stroke-width="1"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="0.9"
                  />
                  <!-- 已失效Token趋势曲线 -->
                  <path
                    :d="invalidTokensPath"
                    stroke="#dc3545"
                    stroke-width="1"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    opacity="0.9"
                  />

                  <!-- 当前数值点 -->
                  <circle cx="36" :cy="getPointY(currentStats.validTokens)" r="0.8" fill="#28a745" opacity="0.9"/>
                  <circle cx="36" :cy="getPointY(currentStats.expiringTokens)" r="0.8" fill="#ffc107" opacity="0.9"/>
                  <circle cx="36" :cy="getPointY(currentStats.invalidTokens)" r="0.8" fill="#dc3545" opacity="0.9"/>

                  <!-- 右上角居中显示有效总次数 -->
                  <text x="20" y="15" font-size="12" fill="currentColor" font-weight="bold" text-anchor="middle" opacity="0.95">{{ formatCredits(currentStats.totalCredits) }}</text>
                </svg>
              </div>
            </div>
          </button>

          <!-- 图表下拉菜单 -->
          <div
            class="dropdown-menu dropdown-menu-end chart-dropdown"
            :class="{ 'show': isChartDropdownOpen }"
          >
            <div class="chart-dropdown-header">
              <h6 class="dropdown-header d-flex align-items-center">
                <i class="bi bi-bar-chart me-2"></i>
                综合统计图表
              </h6>
              <button type="button" class="btn-close btn-close-sm" @click="closeChartDropdown"></button>
            </div>

            <div class="chart-dropdown-body">
              <!-- 时间范围切换 -->
              <div class="chart-controls mb-3 d-flex justify-content-end">
                <div class="btn-group">
                  <button
                    @click="setZoomLevel('7days')"
                    class="btn btn-sm"
                    :class="zoomLevel === '7days' ? 'btn-primary' : 'btn-outline-primary'"
                  >
                    <i class="bi bi-calendar-week me-1"></i>
                    7天
                  </button>
                  <button
                    @click="setZoomLevel('1day')"
                    class="btn btn-sm"
                    :class="zoomLevel === '1day' ? 'btn-primary' : 'btn-outline-primary'"
                  >
                    <i class="bi bi-calendar-day me-1"></i>
                    1天
                  </button>
                </div>
              </div>

              <!-- Token数量趋势图 -->
              <div class="chart-section mb-4">
                <h6 class="chart-title">
                  <i class="bi bi-graph-up me-2"></i>
                  Token数量趋势 ({{ zoomLevel === '7days' ? '最近7天' : '最近24小时' }})
                </h6>
                <div class="chart-container-mini">
                  <Line
                    v-if="tokenCountChartData.labels.length > 0"
                    :key="`token-chart-${zoomLevel}`"
                    :data="tokenCountChartData"
                    :options="tokenCountChartOptions"
                  />
                  <div v-else class="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div class="text-center">
                      <i class="bi bi-graph-up" style="font-size: 1.2rem;"></i>
                      <div class="mt-1 small">暂无历史数据</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 有效次数趋势图 -->
              <div class="chart-section">
                <h6 class="chart-title">
                  <i class="bi bi-calculator me-2"></i>
                  有效次数趋势 ({{ zoomLevel === '7days' ? '最近7天' : '最近24小时' }})
                </h6>
                <div class="chart-container-mini">
                  <Line
                    v-if="creditsChartData.labels.length > 0"
                    :key="`credits-chart-${zoomLevel}`"
                    :data="creditsChartData"
                    :options="creditsChartOptions"
                  />
                  <div v-else class="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div class="text-center">
                      <i class="bi bi-calculator" style="font-size: 1.2rem;"></i>
                      <div class="mt-1 small">暂无历史数据</div>
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
            <h6 class="dropdown-header">管理功能</h6>
            <router-link
              v-if="hasTokenManagement"
              to="/tokens"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <i class="bi bi-key dropdown-item-icon"></i>
              Token 管理
            </router-link>
            <router-link
              v-if="hasActivationCodeManagement"
              to="/activation"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <i class="bi bi-credit-card dropdown-item-icon"></i>
              激活码管理
            </router-link>
            <router-link
              v-if="hasUuidManagement"
              to="/uuid"
              class="dropdown-item"
              @click="closeDropdown"
            >
              <i class="bi bi-fingerprint dropdown-item-icon"></i>
              UUID 管理
            </router-link>
            <div class="dropdown-divider"></div>
            <button
              v-if="needsActivation"
              @click="showActivation"
              class="dropdown-item text-warning"
            >
              <i class="bi bi-shield-exclamation dropdown-item-icon"></i>
              激活授权
            </button>
            <button
              v-if="hasValidLicense"
              @click="showLicenseInfo"
              class="dropdown-item text-success"
            >
              <i class="bi bi-shield-check dropdown-item-icon"></i>
              授权信息
            </button>
            <button @click="handleLogout" class="dropdown-item">
              <i class="bi bi-box-arrow-right dropdown-item-icon"></i>
              登出
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- 授权激活模态框 -->
  <div
    v-if="showActivationModal"
    class="modal modal-blur fade show"
    style="display: block;"
    @click.self="closeActivationModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-shield-check me-2"></i>
            激活授权
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeActivationModal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <label class="form-label">机器码</label>
            <div class="input-group">
              <input
                type="text"
                class="form-control font-monospace"
                :value="machineCode"
                readonly
                placeholder="正在获取机器码..."
              >
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="copyMachineCode"
                :disabled="!machineCode"
              >
                <i class="bi bi-copy"></i>
              </button>
            </div>
            <div class="form-hint">
              请将此机器码提供给管理员以获取授权码
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">授权码</label>
            <textarea
              v-model="licenseCode"
              class="form-control font-monospace"
              rows="4"
              placeholder="请输入授权码..."
              :disabled="isActivating"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn me-auto"
            @click="closeActivationModal"
            :disabled="isActivating"
          >
            取消
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="activateLicense"
            :disabled="isActivating || !licenseCode.trim()"
          >
            <span v-if="isActivating" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-shield-check me-2"></i>
            {{ isActivating ? '激活中...' : '激活' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 授权信息模态框 -->
  <div
    v-if="showLicenseInfoModal"
    class="modal modal-blur fade show"
    style="display: block;"
    @click.self="closeLicenseInfoModal"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-shield-check me-2 text-success"></i>
            授权信息
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeLicenseInfoModal"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="licenseStatus">
            <!-- 授权状态卡片 -->
            <div class="mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h6 class="mb-0">
                  <i class="bi bi-shield-check me-2"></i>
                  授权状态
                </h6>
                <div class="d-flex align-items-center gap-2">
                  <span
                    :class="['badge badge-lg text-white', licenseStatus.is_valid ? 'bg-success' : 'bg-danger']"
                  >
                    <i :class="['bi', licenseStatus.is_valid ? 'bi-check-circle' : 'bi-x-circle']" class="me-1"></i>
                    {{ licenseStatus.is_valid ? '有效' : '无效' }}
                  </span>
                  <span v-if="licenseStatus.is_expired" class="badge badge-lg bg-warning text-white">
                    <i class="bi bi-clock me-1"></i>
                    已过期
                  </span>
                </div>
              </div>

              <!-- 时间信息 -->
              <div class="row g-3 mb-3">
                <div class="col-6">
                  <div class="text-center p-3 bg-light rounded">
                    <div class="h2 mb-1 text-primary">{{ licenseStatus.days_left }}</div>
                    <div class="text-muted small">剩余天数</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="text-center p-3 bg-light rounded">
                    <div class="small text-muted mb-1">到期时间</div>
                    <div class="fw-bold">
                      {{ licenseStatus.expires_at ? new Date(licenseStatus.expires_at).toLocaleDateString() : '未设置' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 权限信息 -->
            <div class="mb-4">
              <h6 class="mb-3">
                <i class="bi bi-key me-2"></i>
                授权权限
              </h6>
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="permission in licenseStatus.permissions"
                  :key="permission"
                  class="badge bg-primary-lt text-primary px-3 py-2"
                >
                  <i class="bi bi-check-circle me-1"></i>
                  {{ permission }}
                </span>
                <span v-if="!licenseStatus.permissions || licenseStatus.permissions.length === 0"
                      class="badge bg-secondary-lt text-secondary px-3 py-2">
                  <i class="bi bi-dash-circle me-1"></i>
                  无特殊权限
                </span>
              </div>
            </div>

            <!-- 状态信息 -->
            <div class="alert alert-info mb-0">
              <div class="d-flex align-items-center">
                <i class="bi bi-info-circle me-2"></i>
                <div>{{ licenseStatus.message }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn me-auto"
            @click="closeLicenseInfoModal"
          >
            关闭
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="showDeactivateConfirm"
            :disabled="isDeactivating"
          >
            <i class="bi bi-shield-x me-2"></i>
            反激活
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 反激活确认模态框 -->
  <div
    v-if="showDeactivateConfirmModal"
    class="modal modal-blur fade show"
    style="display: block;"
    @click.self="closeDeactivateConfirm"
  >
    <div class="modal-dialog modal-dialog-centered modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle me-2 text-warning"></i>
            确认反激活
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeDeactivateConfirm"
          ></button>
        </div>
        <div class="modal-body">
          <div class="text-center">
            <div class="mb-3">
              <i class="bi bi-shield-x text-danger" style="font-size: 3rem;"></i>
            </div>
            <h6 class="mb-3">确定要反激活当前授权吗？</h6>
            <p class="text-muted mb-0">
              反激活后将失去所有高级功能权限，只能使用基础的 Token 管理功能。
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn me-auto"
            @click="closeDeactivateConfirm"
            :disabled="isDeactivating"
          >
            取消
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click="deactivateLicense"
            :disabled="isDeactivating"
          >
            <span v-if="isDeactivating" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-shield-x me-2"></i>
            {{ isDeactivating ? '反激活中...' : '确认反激活' }}
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '../utils/toast'
import { logoutRequest, apiGet, apiPost } from '../utils/api'
import { PermissionManager } from '../types/permissions'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
)

// 简化的Token类型定义（仅用于props）
interface ExpiringToken {
  id: string
  email_note: string
  remaining_time: string
  remaining_credits: string
}

// 到期Token状态
const expiringTokens = ref<ExpiringToken[]>([])

const router = useRouter()
const username = ref<string>('')
const isDropdownOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement>()

// 权限检查计算属性
const hasComprehensiveManagement = computed(() => PermissionManager.hasComprehensiveManagement())
const hasTokenManagement = computed(() => PermissionManager.hasTokenManagement())
const hasActivationCodeManagement = computed(() => PermissionManager.hasActivationCodeManagement())
const hasUuidManagement = computed(() => PermissionManager.hasUuidManagement())

// 授权状态相关
const licenseStatus = ref<any>(null)
const showActivationModal = ref(false)
const machineCode = ref('')
const licenseCode = ref('')
const isActivating = ref(false)
const isLoadingMachineCode = ref(false)

// 检查授权状态
const checkLicenseStatus = async () => {
  try {
    const response = await apiGet('/api/license/status')
    if (response.success) {
      licenseStatus.value = response.data

      // 根据授权状态设置权限
      if (response.data.is_valid && response.data.permissions) {
        PermissionManager.setPermissionsFromLicense(response.data.permissions)
      } else {
        // 授权无效时，只保留基础权限
        PermissionManager.setPermissionsFromLicense(null)
      }
    }
  } catch (error) {
    console.error('检查授权状态失败:', error)
    // 检查失败时，只保留基础权限
    PermissionManager.setPermissionsFromLicense(null)
  }
}

// 计算是否需要显示激活按钮
const needsActivation = computed(() => {
  return licenseStatus.value && !licenseStatus.value.is_valid
})

// 计算是否需要显示授权信息按钮
const hasValidLicense = computed(() => {
  return licenseStatus.value && licenseStatus.value.is_valid
})

// 授权信息模态框相关
const showLicenseInfoModal = ref(false)
const isDeactivating = ref(false)

// 反激活确认模态框
const showDeactivateConfirmModal = ref(false)

// 到期提醒相关状态
const showExpiringPopover = ref<boolean>(false)
const bellRef = ref<HTMLElement>()

// 图表下拉菜单相关状态
const isChartDropdownOpen = ref<boolean>(false)
const chartDropdownRef = ref<HTMLElement>()

// 图表相关数据
const zoomLevel = ref<'7days' | '1day'>(
  (localStorage.getItem('chart-zoom-level') as '7days' | '1day') || '7days'
)

// 当前统计数据（用于mini统计显示）
const currentStats = ref({
  validTokens: 0,
  expiringTokens: 0,
  invalidTokens: 0,
  totalCredits: 0
})

// 3条曲线的路径数据
const validTokensPath = ref<string>('')
const expiringTokensPath = ref<string>('')
const invalidTokensPath = ref<string>('')

// 历史数据用于绘制曲线（保存最近的几个数据点）
const miniChartHistory = ref<{
  valid: number[],
  expiring: number[],
  invalid: number[]
}>({
  valid: [],
  expiring: [],
  invalid: []
})

// Token数量图表数据
const tokenCountChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: '有效',
      data: [] as number[],
      borderColor: '#28a745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#28a745',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    },
    {
      label: '即将到期',
      data: [] as number[],
      borderColor: '#ffc107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#ffc107',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    },
    {
      label: '已失效',
      data: [] as number[],
      borderColor: '#dc3545',
      backgroundColor: 'rgba(220, 53, 69, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#dc3545',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }
  ]
})

// 有效次数图表数据
const creditsChartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: '有效次数',
      data: [] as number[],
      borderColor: '#007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: '#007bff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2
    }
  ]
})

// Token数量图表配置
const tokenCountChartOptions = computed((): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#ffffff',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}))

// 有效次数图表配置
const creditsChartOptions = computed((): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#ffffff',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      display: true,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        font: {
          size: 11
        }
      }
    }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  }
}))

// 监听到期Token更新事件
const handleExpiringTokensUpdate = (event: CustomEvent) => {
  expiringTokens.value = event.detail || []
}

onMounted(() => {
  // 获取用户名
  const storedUsername = localStorage.getItem('username')
  username.value = storedUsername || 'Admin'

  // 添加全局点击事件监听器（支持触摸设备）
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)

  // 监听到期Token更新事件
  window.addEventListener('update-expiring-tokens', handleExpiringTokensUpdate as EventListener)

  // 初始化图表数据
  loadChartData()

  // 初始显示当前数据
  updateChartDisplay()

  // 检查授权状态
  checkLicenseStatus()
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
  window.removeEventListener('update-expiring-tokens', handleExpiringTokensUpdate as EventListener)
})

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// 关闭下拉菜单
const closeDropdown = () => {
  isDropdownOpen.value = false
}

// 处理点击外部区域关闭下拉菜单和悬浮窗
const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
  if (bellRef.value && !bellRef.value.contains(event.target as Node)) {
    showExpiringPopover.value = false
  }
  if (chartDropdownRef.value && !chartDropdownRef.value.contains(event.target as Node)) {
    isChartDropdownOpen.value = false
  }
}

// 图表下拉菜单控制
const toggleChartDropdown = async () => {
  isChartDropdownOpen.value = !isChartDropdownOpen.value
  if (isChartDropdownOpen.value) {
    // 打开时刷新数据
    await loadChartData()
  }
}

const closeChartDropdown = () => {
  isChartDropdownOpen.value = false
}



// 切换到期提醒悬浮窗
const toggleExpiringPopover = () => {
  showExpiringPopover.value = !showExpiringPopover.value
}

// 关闭到期提醒悬浮窗
const closeExpiringPopover = () => {
  showExpiringPopover.value = false
}

// 显示激活模态框
const showActivation = async () => {
  isDropdownOpen.value = false
  showActivationModal.value = true

  // 获取机器码
  await getMachineCode()
}

// 获取机器码
const getMachineCode = async () => {
  isLoadingMachineCode.value = true
  try {
    const response = await apiGet('/api/machine-code')
    if (response.success && response.data) {
      machineCode.value = response.data.machine_code
    } else {
      toast.error('获取机器码失败')
    }
  } catch (error) {
    toast.error('获取机器码失败')
  } finally {
    isLoadingMachineCode.value = false
  }
}

// 复制机器码
const copyMachineCode = async () => {
  if (!machineCode.value) return

  try {
    await window.navigator.clipboard.writeText(machineCode.value)
    toast.success('机器码已复制到剪贴板')
  } catch (error) {
    // 降级方案：使用传统方法复制
    const textArea = document.createElement('textarea')
    textArea.value = machineCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    toast.success('机器码已复制到剪贴板')
  }
}

// 激活授权码
const activateLicense = async () => {
  if (!licenseCode.value.trim()) {
    toast.error('请输入授权码')
    return
  }

  isActivating.value = true
  try {
    const response = await apiPost('/api/license/active', {
      license_code: licenseCode.value.trim()
    })

    if (response.success) {
      toast.success(response.message || '授权码激活成功')
      showActivationModal.value = false
      licenseCode.value = ''

      // 重新检查授权状态并更新权限
      await checkLicenseStatus()

      // 激活成功后刷新页面让权限生效
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      toast.error(response.message || '授权码激活失败')
    }
  } catch (error) {
    toast.error('授权码激活失败')
  } finally {
    isActivating.value = false
  }
}

// 关闭激活模态框
const closeActivationModal = () => {
  showActivationModal.value = false
  licenseCode.value = ''
}

// 显示授权信息模态框
const showLicenseInfo = () => {
  isDropdownOpen.value = false
  showLicenseInfoModal.value = true
}

// 关闭授权信息模态框
const closeLicenseInfoModal = () => {
  showLicenseInfoModal.value = false
}

// 显示反激活确认模态框
const showDeactivateConfirm = () => {
  showDeactivateConfirmModal.value = true
}

// 关闭反激活确认模态框
const closeDeactivateConfirm = () => {
  showDeactivateConfirmModal.value = false
}

// 反激活授权
const deactivateLicense = async () => {
  isDeactivating.value = true
  try {
    const response = await apiPost('/api/license/deactivate', {})

    if (response.success) {
      toast.success(response.message || '授权已成功反激活')
      showLicenseInfoModal.value = false
      showDeactivateConfirmModal.value = false

      // 重新检查授权状态并更新权限
      await checkLicenseStatus()

      // 反激活成功后刷新页面让权限生效
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      toast.error(response.message || '反激活失败')
    }
  } catch (error) {
    toast.error('反激活失败')
  } finally {
    isDeactivating.value = false
  }
}

const handleLogout = async () => {
  // 关闭下拉菜单
  isDropdownOpen.value = false

  try {
    const data = await logoutRequest()

    if (data.success) {
      // 清除登录信息和权限
      localStorage.removeItem('auth_token')
      localStorage.removeItem('username')
      PermissionManager.clearPermissions()

      toast.success('登出成功')

      // 跳转到登录页
      router.push('/login')
    } else {
      // API返回失败，但仍然清除本地信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('username')
      PermissionManager.clearPermissions()

      toast.warning('登出请求失败，但已清除本地登录信息')
      router.push('/login')
    }
  } catch (error) {

    // 网络错误时也清除本地信息
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
    PermissionManager.clearPermissions()

    toast.warning('登出请求失败，但已清除本地登录信息')
    router.push('/login')
  }
}

// 图表数据管理
const CHART_DATA_KEY = 'atm-chart-data'

// 获取当前小时的时间字符串 (YYYY-MM-DD-HH)
const getCurrentHourString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  return `${year}-${month}-${day}-${hour}`
}





// 加载Token和激活码数据
// 从API获取统计数据
const loadStatsFromAPI = async () => {
  try {
    const days = zoomLevel.value === '1day' ? 1 : 7
    const response = await apiPost('/api/token-stats/range', { days })

    if (response.success && response.data && response.data.stats) {
      const stats = response.data.stats || []

      // 直接处理API返回的数据
      processStatsData(stats)
    } else {
      // 没有数据时设置默认值
      setDefaultStats()
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 错误时也设置默认值
    setDefaultStats()
  }
}

// 设置默认统计数据
const setDefaultStats = () => {
  currentStats.value = {
    validTokens: 0,
    expiringTokens: 0,
    invalidTokens: 0,
    totalCredits: 0
  }

  // 清空图表数据
  const emptyLabels: string[] = []
  const emptyData: number[] = []

  if (zoomLevel.value === '1day') {
    // 生成24小时标签
    for (let i = 23; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60 * 60 * 1000)
      emptyLabels.push(`${time.getHours().toString().padStart(2, '0')}:00`)
      emptyData.push(0)
    }
  } else {
    // 生成7天标签
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      emptyLabels.push(`${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`)
      emptyData.push(0)
    }
  }

  updateChartData(emptyLabels, emptyData, emptyData, emptyData, emptyData)
}

// 处理统计数据
const processStatsData = (stats: any[]) => {
  if (stats.length === 0) {
    setDefaultStats()
    return
  }

  // 获取最新的统计数据用于当前状态显示（第一个元素是最新的）
  const latestStat = stats[0]

  // 更新当前统计数据
  currentStats.value = {
    validTokens: latestStat.valid_count || 0,
    expiringTokens: latestStat.expiring_count || 0,
    invalidTokens: latestStat.invalid_count || 0,
    totalCredits: latestStat.total_credits_balance || 0
  }

  // 处理图表数据 - 反转数组让时间从左到右
  const reversedStats = [...stats].reverse()
  processChartData(reversedStats)
}

// 处理图表数据（统一处理1天和7天视图）
const processChartData = (stats: any[]) => {
  if (stats.length === 0) return

  // 准备数据 - 直接使用API返回的数据，按照参考代码的方式
  const labels = stats.map(stat => {
    const date = new Date(stat.last_refresh_time)
    return zoomLevel.value === '1day'
      ? `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      : `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  })

  const validData = stats.map(stat => stat.valid_count || 0)
  const expiringData = stats.map(stat => stat.expiring_count || 0)
  const invalidData = stats.map(stat => stat.invalid_count || 0)
  const creditsData = stats.map(stat => stat.total_credits_balance || 0)

  updateChartData(labels, validData, expiringData, invalidData, creditsData)
}

// 更新图表数据的统一方法
const updateChartData = (labels: string[], validData: number[], expiringData: number[], invalidData: number[], creditsData: number[]) => {
  // 强制创建新的数据对象来触发响应式更新
  tokenCountChartData.value = {
    labels: [...labels],
    datasets: [
      {
        ...tokenCountChartData.value.datasets[0],
        data: [...validData]
      },
      {
        ...tokenCountChartData.value.datasets[1],
        data: [...expiringData]
      },
      {
        ...tokenCountChartData.value.datasets[2],
        data: [...invalidData]
      }
    ]
  }

  creditsChartData.value = {
    labels: [...labels],
    datasets: [
      {
        ...creditsChartData.value.datasets[0],
        data: [...creditsData]
      }
    ]
  }

  // 更新历史数据用于绘制曲线
  updateMiniChartHistory(validData, expiringData, invalidData)
}

// 更新迷你图表历史数据
const updateMiniChartHistory = (validData: number[], expiringData: number[], invalidData: number[]) => {
  // 更新历史数据用于绘制曲线（保留最近6个数据点）
  const maxPoints = 6

  // 取最近的数据点
  const recentValid = validData.slice(-maxPoints)
  const recentExpiring = expiringData.slice(-maxPoints)
  const recentInvalid = invalidData.slice(-maxPoints)

  miniChartHistory.value = {
    valid: recentValid,
    expiring: recentExpiring,
    invalid: recentInvalid
  }

  // 更新曲线路径
  updateMiniChartPaths()
}

// 更新mini图表的曲线路径
const updateMiniChartPaths = () => {
  validTokensPath.value = generateCurvePath(miniChartHistory.value.valid)
  expiringTokensPath.value = generateCurvePath(miniChartHistory.value.expiring)
  invalidTokensPath.value = generateCurvePath(miniChartHistory.value.invalid)
}

// 生成曲线路径
const generateCurvePath = (data: number[]): string => {
  if (data.length === 0) return ''

  const maxValue = Math.max(...Object.values(miniChartHistory.value).flat(), 1)
  const width = 36 // 可用宽度
  const height = 16 // 可用高度
  const startX = 2
  const startY = 18

  let path = ''

  data.forEach((value, index) => {
    const x = startX + (index / Math.max(data.length - 1, 1)) * width
    const y = startY - (value / maxValue) * height

    if (index === 0) {
      path = `M ${x} ${y}`
    } else {
      path += ` L ${x} ${y}`
    }
  })

  return path
}

// 计算当前数值点的Y坐标
const getPointY = (value: number): number => {
  const allValues = [
    ...miniChartHistory.value.valid,
    ...miniChartHistory.value.expiring,
    ...miniChartHistory.value.invalid
  ]
  const maxValue = Math.max(...allValues, 1)
  const height = 16
  const startY = 18

  return startY - (value / maxValue) * height
}

// 格式化总次数显示（缩短大数字）
const formatCredits = (credits: number): string => {
  if (credits >= 1000000) {
    return Math.floor(credits / 100000) / 10 + 'M'
  } else if (credits >= 1000) {
    return Math.floor(credits / 100) / 10 + 'K'
  } else {
    return credits.toString()
  }
}







// 更新图表显示（现在数据直接从API获取，此方法主要用于触发图表重绘）
const updateChartDisplay = () => {
  // 图表数据已在loadStatsFromAPI中更新，这里只需要触发响应式更新
  // Vue的响应式系统会自动处理图表的重新渲染
}





// 设置特定的缩放级别
const setZoomLevel = async (level: '7days' | '1day') => {
  zoomLevel.value = level
  // 保存用户偏好到localStorage
  localStorage.setItem('chart-zoom-level', level)
  // 重新加载对应时间范围的数据（key属性变化会自动触发图表重新渲染）
  await loadStatsFromAPI()
}

// 加载图表数据
const loadChartData = async () => {
  await loadStatsFromAPI()
  updateChartDisplay()
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
  color: var(--tblr-dark);
  text-decoration: none;
  transition: all 0.15s ease-in-out;
}

.dropdown-item:hover {
  background-color: var(--tblr-primary-lt);
  color: var(--tblr-primary);
}

.dropdown-item-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.dropdown-header {
  padding: 0.5rem 1rem 0.25rem;
  margin-bottom: 0;
  font-size: 0.75rem;
  color: var(--tblr-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid var(--tblr-border-color);
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

/* 图表图标样式 */
.chart-icon-btn {
  transition: all 0.2s ease;
  border-radius: 0.375rem;
}

.chart-icon-btn:hover {
  background-color: var(--tblr-bg-surface-secondary) !important;
  transform: translateY(-1px);
}

.mini-chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-chart-frame {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  padding: 3px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.chart-icon-btn:hover .mini-chart-frame {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mini-chart {
  width: 40px;
  height: 20px;
  display: block;
}

.chart-line {
  transition: stroke 0.2s ease;
}

.chart-point {
  transition: fill 0.2s ease;
}

.chart-icon-btn:hover .chart-line {
  stroke: #20c997;
}

.chart-icon-btn:hover .chart-point {
  fill: #20c997;
}

/* 深色主题适配 */
@media (prefers-color-scheme: dark) {
  .mini-chart-frame {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .chart-icon-btn:hover .mini-chart-frame {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .chart-line {
    stroke: #20c997;
  }

  .chart-point {
    fill: #20c997;
  }

  .chart-icon-btn:hover .chart-line {
    stroke: #6fd8a8;
  }

  .chart-icon-btn:hover .chart-point {
    fill: #6fd8a8;
  }
}

/* 图表下拉菜单样式 */
.chart-dropdown {
  width: 600px;
  max-width: 95vw;
  padding: 0;
  border: 1px solid var(--tblr-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.chart-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--tblr-bg-surface-secondary);
  border-bottom: 1px solid var(--tblr-border-color);
  border-radius: 0.5rem 0.5rem 0 0;
}

.chart-dropdown-header .dropdown-header {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--tblr-dark);
}

.chart-dropdown-body {
  padding: 1.25rem;
  max-height: 600px;
  overflow-y: auto;
}

.chart-controls {
  margin-bottom: 1rem;
}

.chart-section {
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--tblr-dark);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.chart-container-mini {
  position: relative;
  width: 100%;
  height: 200px;
  background: var(--tblr-bg-surface);
  border: 1px solid var(--tblr-border-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.chart-container-mini canvas {
  max-height: 180px !important;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .chart-dropdown {
    width: 500px;
  }

  .chart-container-mini {
    height: 160px;
  }

  .chart-container-mini canvas {
    max-height: 140px !important;
  }
}

/* iPhone和小屏设备优化 */
@media (max-width: 576px) {
  .chart-dropdown {
    position: fixed !important;
    top: 60px !important;
    left: 10px !important;
    right: 10px !important;
    width: auto !important;
    max-width: none !important;
    z-index: 1060 !important;
    transform: none !important;
    background: var(--tblr-bg-surface) !important;
    border: 1px solid var(--tblr-border-color) !important;
    box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.2) !important;
  }

  .chart-dropdown-body {
    padding: 1rem;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    background: var(--tblr-bg-surface) !important;
  }

  .chart-container-mini {
    height: 180px;
    background: var(--tblr-bg-surface) !important;
  }

  .chart-container-mini canvas {
    max-height: 160px !important;
  }

  /* 添加遮罩层 */
  .chart-dropdown.show::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
}

/* 超小屏设备（iPhone SE等） */
@media (max-width: 375px) {
  .chart-dropdown {
    left: 5px !important;
    right: 5px !important;
  }

  .chart-dropdown-body {
    padding: 0.75rem;
  }

  .chart-container-mini {
    height: 160px;
  }

  .chart-container-mini canvas {
    max-height: 140px !important;
  }
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
