<template>
  <div class="activation-code-manager">
    <!-- 页面标题 -->
    <div class="page-header d-print-none">
      <div class="container-xl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">激活码管理</h2>
          </div>
          <div class="col-auto ms-auto d-print-none">
            <div class="btn-list">
              <button @click="showCreateCardModal" class="btn btn-primary" title="创建激活码">
                <i class="bi bi-plus-circle me-sm-2"></i>
                <span class="d-none d-sm-inline">创建激活码</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-body">
      <div class="container-xl">
        <!-- 状态统计窗口 -->
        <div class="row mb-4">
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-success': activeFilter === '已使用' }"
              @click="toggleFilter('已使用')"
              style="text-decoration: none;"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-success text-white avatar">
                      <i class="bi bi-check-circle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      已使用
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-success">{{ statusStats.used }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-secondary': activeFilter === '未使用' }"
              @click="toggleFilter('未使用')"
              style="text-decoration: none;"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-secondary text-white avatar">
                      <i class="bi bi-circle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      未使用
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-secondary">{{ statusStats.unused }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-danger': activeFilter === '即将过期' }"
              @click="toggleFilter('即将过期')"
              style="text-decoration: none;"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-danger text-white avatar">
                      <i class="bi bi-exclamation-triangle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      即将过期
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-danger">{{ statusStats.expiringSoon }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-danger': activeFilter === '失效' }"
              @click="toggleFilter('失效')"
              style="text-decoration: none;"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-danger text-white avatar">
                      <i class="bi bi-x-circle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      失效
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-danger">{{ statusStats.unavailable }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="card">
          <div class="table-responsive">
            <table class="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>激活码ID</th>
                  <th>充值时长</th>
                  <th>卡类型</th>
                  <th>绑定Token</th>
                  <th>状态</th>
                  <th>使用者</th>
                  <th>时间</th>
                  <th class="w-1">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">加载中...</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="activationCards.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">
                    {{ activeFilter ? `没有符合"${activeFilter}"条件的激活码` : '暂无激活码数据' }}
                  </td>
                </tr>
                <tr v-else v-for="card in activationCards" :key="card.id">
                  <td
                    class="text-muted font-monospace cursor-pointer"
                    :title="card.id + ' (点击复制完整激活码)'"
                    @click="copyActivationCode(card)"
                  >
                    {{ formatActivationCode(card.id) }}
                  </td>
                  <td class="text-muted">{{ getDaysText(card) }}</td>
                  <td>
                    <span :class="['badge', card.card_type === 'token_binding' ? 'bg-info text-white' : 'bg-secondary text-white']">
                      {{ getCardTypeText(card.card_type) }}
                    </span>
                  </td>
                  <td class="text-muted">
                    <div v-if="card.bound_token_id && getTokenInfo(card.bound_token_id)" class="small">
                      <div>
                        <span
                          :class="['badge', 'badge-sm', 'cursor-pointer',
                            refreshingTokenId === card.bound_token_id ? 'bg-warning text-dark' :
                            getTokenStatus(getTokenInfo(card.bound_token_id)!) === '正常' ? 'bg-success text-white' :
                            getTokenStatus(getTokenInfo(card.bound_token_id)!) === '失效' ? 'bg-danger text-white' :
                            getTokenStatus(getTokenInfo(card.bound_token_id)!) === '耗尽' ? 'bg-warning text-dark' : 'bg-secondary text-white']"
                          @click="showRefreshTokenModal(card.bound_token_id!)"
                          :title="refreshingTokenId === card.bound_token_id ? '刷新中...' : '点击刷新Token状态'"
                        >
                          <i
                            v-if="refreshingTokenId === card.bound_token_id"
                            class="bi bi-arrow-clockwise refresh-spin me-1"
                          ></i>
                          {{ refreshingTokenId === card.bound_token_id ? '刷新中' : getTokenStatus(getTokenInfo(card.bound_token_id)!) }}
                        </span>
                      </div>
                      <div class="mt-1">
                        <span :class="getDaysColorClass(getTokenInfo(card.bound_token_id)!)">
                          {{ formatRemainingTime(getTokenInfo(card.bound_token_id)!) }}
                        </span>
                        <span class="text-muted">/</span>
                        <span :class="getCreditsColorClass(getRemainingCredits(getTokenInfo(card.bound_token_id)!))">
                          {{ getRemainingCredits(getTokenInfo(card.bound_token_id)!) === '-' ? '-' : getRemainingCredits(getTokenInfo(card.bound_token_id)!) + '次' }}
                        </span>
                      </div>
                    </div>
                    <div v-else>
                      {{ card.bound_token_id || '-' }}
                    </div>
                  </td>
                  <td>
                    <span :class="['badge', card.is_used ? 'bg-success text-white' : 'bg-warning text-dark']">
                      {{ card.is_used ? '已使用' : '未使用' }}
                    </span>
                  </td>
                  <td class="text-muted" style="max-width: 150px;">
                    <!-- 已使用且有绑定Token -->
                    <div v-if="card.used_by && card.bound_token_id && getTokenInfo(card.bound_token_id)" class="small">
                      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="card.used_by">
                        {{ card.used_by }}
                      </div>
                      <div class="text-primary mt-1" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="getTokenInfo(card.bound_token_id)!.email_note || '无备注'">
                        {{ getTokenInfo(card.bound_token_id)!.email_note || '无备注' }}
                      </div>
                    </div>
                    <!-- 未使用但有绑定Token -->
                    <div v-else-if="!card.used_by && card.bound_token_id && getTokenInfo(card.bound_token_id)" class="small">
                      <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="'-'">
                        -
                      </div>
                      <div class="text-primary mt-1" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="getTokenInfo(card.bound_token_id)!.email_note || '无备注'">
                        {{ getTokenInfo(card.bound_token_id)!.email_note || '无备注' }}
                      </div>
                    </div>
                    <!-- 其他情况 -->
                    <div v-else style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="card.used_by || '-'">
                      {{ card.used_by || '-' }}
                    </div>
                  </td>
                  <td class="text-muted">
                    <div class="small">
                      <div>创建：{{ formatDateTime(card.created_at) }}</div>
                      <div v-if="card.used_at" class="text-primary">使用：{{ formatDateTime(card.used_at) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-list flex-nowrap">
                      <button
                        v-if="card.card_type === 'token_binding' && card.bound_token_id"
                        @click="refreshCard(card)"
                        class="btn btn-sm btn-success"
                        :disabled="refreshingCardId === card.id"
                      >
                        <i
                          :class="['bi', 'me-1',
                            refreshingCardId === card.id ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
                        ></i>
                        {{ refreshingCardId === card.id ? '刷新中' : '刷新' }}
                      </button>
                      <button @click="showDeleteCardModal(card)" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash me-1"></i>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页 -->
          <div class="card-footer d-flex align-items-center" v-if="pagination.total > 0">
            <p class="m-0 text-muted">
              显示第 {{ (pagination.page - 1) * pagination.limit + 1 }} 到
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 条，
              共 {{ pagination.total }} 条记录
            </p>
            <ul class="pagination m-0 ms-auto">
              <li :class="['page-item', !pagination.has_prev ? 'disabled' : '']">
                <button
                  class="page-link"
                  @click="goToPrevPage"
                  :disabled="!pagination.has_prev"
                >
                  <i class="bi bi-chevron-left"></i>
                  上一页
                </button>
              </li>
              <li
                v-for="page in getPageNumbers()"
                :key="page"
                :class="['page-item', page === pagination.page ? 'active' : '']"
              >
                <button class="page-link" @click="goToPage(page)">
                  {{ page }}
                </button>
              </li>
              <li :class="['page-item', !pagination.has_next ? 'disabled' : '']">
                <button
                  class="page-link"
                  @click="goToNextPage"
                  :disabled="!pagination.has_next"
                >
                  下一页
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认刷新Token模态框 -->
    <div v-if="showRefreshModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认验证</h5>
            <button type="button" class="btn-close" @click="closeRefreshModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning" role="alert">
              <div class="d-flex">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 9v2m0 4v.01"/>
                    <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/>
                  </svg>
                </div>
                <div>
                  <h4 class="alert-title">刷新 Token 状态可能会导致 Token 失效！</h4>
                  <div class="text-muted">请谨慎操作！</div>
                </div>
              </div>
            </div>
            <div v-if="refreshingToken" class="text-muted small">
              <strong>邮箱备注：</strong>{{ refreshingToken.email_note || '无备注' }}<br>
              <strong>Tenant URL：</strong>{{ refreshingToken.tenant_url }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeRefreshModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-warning"
              @click="confirmRefreshToken"
              :disabled="refreshingTokenId !== null"
            >
              <i
                :class="['bi', 'me-1',
                  refreshingTokenId ? 'bi-arrow-clockwise refresh-spin' : 'bi-check-circle']"
              ></i>
              {{ refreshingTokenId ? '验证中...' : '确认验证' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建激活码模态框 -->
    <div v-if="showCreateModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建激活码</h5>
            <button type="button" class="btn-close" @click="closeCreateModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createCard">
              <div class="mb-3">
                <label class="form-label">激活码类型</label>
                <div class="form-selectgroup">
                  <label class="form-selectgroup-item">
                    <input
                      type="radio"
                      name="cardType"
                      value="普通"
                      v-model="newCard.cardType"
                      class="form-selectgroup-input"
                    >
                    <span class="form-selectgroup-label">普通</span>
                  </label>
                  <label class="form-selectgroup-item">
                    <input
                      type="radio"
                      name="cardType"
                      value="绑定"
                      v-model="newCard.cardType"
                      class="form-selectgroup-input"
                    >
                    <span class="form-selectgroup-label">绑定</span>
                  </label>
                </div>
              </div>

              <!-- 普通类型 -->
              <div v-if="newCard.cardType === '普通'">
                <div class="mb-3">
                  <label class="form-label">激活时长（天）</label>
                  <input
                    type="number"
                    v-model.number="newCard.rechargeDays"
                    class="form-control"
                    placeholder="请输入激活天数"
                    min="1"
                    required
                  >
                </div>
              </div>

              <!-- 绑定类型 -->
              <div v-if="newCard.cardType === '绑定'">
                <div class="mb-3">
                  <label class="form-label">选择 Token</label>
                  <div class="token-selection-container">
                    <div v-if="tokens.length === 0" class="text-muted text-center py-3">
                      暂无可用的 Token
                    </div>
                    <div v-else class="token-cards-grid">
                      <div
                        v-for="token in sortedTokens"
                        :key="token.id"
                        class="token-card"
                        :class="{
                          'token-card-selected': newCard.selectedToken === token.id,
                          'token-card-disabled': isTokenBound(token.id) || getTokenStatus(token) === '耗尽'
                        }"
                        @click="selectToken(token.id)"
                      >
                        <div class="token-card-header">
                          <div class="token-card-title">
                            {{ token.email_note || '无备注' }}
                          </div>
                          <div class="token-card-status">
                            <span :class="['badge', 'badge-sm', getTokenStatusClass(token)]">
                              {{ getTokenStatus(token) }}
                            </span>
                          </div>
                        </div>
                        <div class="token-card-info">
                          <span class="token-info-item">
                            <i class="bi bi-calendar3 me-1"></i>
                            {{ formatRemainingTime(token) }}
                          </span>
                          <span class="token-info-item">
                            <i class="bi bi-lightning me-1"></i>
                            {{ getRemainingCredits(token) === '-' ? '-' : getRemainingCredits(token) + '次' }}
                          </span>
                        </div>
                        <div class="token-card-badge">
                          <span
                            :class="['badge', 'badge-sm', isTokenBound(token.id) ? 'text-bg-danger' : 'text-bg-success']"
                          >
                            {{ isTokenBound(token.id) ? '已绑定' : '未绑定' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-hint">选择要绑定的 Token，激活时长将根据 Token 信息自动设置</div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeCreateModal">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createCard"
              :disabled="isCreating"
            >
              <i
                :class="['bi', 'me-1',
                  isCreating ? 'bi-arrow-clockwise refresh-spin' : 'bi-plus-circle']"
              ></i>
              {{ isCreating ? '创建中...' : '创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>确定要删除这个激活码吗？</p>
            <div class="text-muted small">
              <strong>激活码ID：</strong><span class="font-monospace">{{ deletingCard?.id }}</span><br>
              <strong>充值时长：</strong>{{ deletingCard ? getDaysText(deletingCard) : '-' }}<br>
              <strong>卡类型：</strong>{{ deletingCard?.card_type ? getCardTypeText(deletingCard.card_type) : '-' }}<br>
              <strong>状态：</strong>{{ deletingCard?.is_used ? '已使用' : '未使用' }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeDeleteModal">取消</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <i
                :class="['bi', 'me-1',
                  isDeleting ? 'bi-arrow-clockwise refresh-spin' : 'bi-trash']"
              ></i>
              {{ isDeleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { toast } from '../utils/toast'

interface ActivationCard {
  id: string
  days: number
  card_type: string
  bound_token_id?: string
  is_used: boolean
  used_by?: string
  created_at: string
  used_at?: string
}



interface Token {
  id: string
  tenant_url: string
  access_token: string
  portal_url: string
  email_note: string
  ban_status: string
  portal_info: string
  created_at: string
  updated_at: string
}

interface NewCard {
  cardType: '普通' | '绑定'
  rechargeDays: number
  selectedToken?: string
}

// 响应式数据
const allActivationCards = ref<ActivationCard[]>([]) // 存储所有激活码数据
const activationCards = ref<ActivationCard[]>([]) // 当前页显示的激活码数据
const pagination = ref({
  has_next: false,
  has_prev: false,
  limit: 12,
  page: 1,
  total: 0,
  total_pages: 0
})
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const newCard = ref<NewCard>({
  cardType: '普通',
  rechargeDays: 30
})
const deletingCard = ref<ActivationCard | null>(null)
const availableTokens = ref<string[]>([])
const isLoading = ref(false)
const tokens = ref<Token[]>([])
const refreshingTokenId = ref<string | null>(null)
const showRefreshModal = ref(false)
const refreshingToken = ref<Token | null>(null)
const isCreating = ref(false)
const isDeleting = ref(false)
const boundTokenIds = ref<string[]>([])
const refreshingCardId = ref<string | null>(null)

// 加载激活码列表
const loadActivationCards = async () => {
  isLoading.value = true

  try {
    // 不限制limit，获取所有数据
    const response = await fetch('/api/recharge-cards?limit=1000')
    const data = await response.json()

    if (data.success) {
      allActivationCards.value = data.data || []
      // 使用 nextTick 确保响应式数据更新后再初始化分页
      await nextTick()
      updatePagination(1)
    } else {
      console.error('激活码列表加载失败:', data)
      allActivationCards.value = []
    }
  } catch (error) {
    console.error('激活码列表加载错误:', error)
    allActivationCards.value = []
  } finally {
    isLoading.value = false
  }
}

// 加载Token列表
const loadTokens = async () => {
  try {
    const response = await fetch('/api/tokens?limit=1000')
    const data = await response.json()

    if (data.success) {
      tokens.value = data.data || []
    } else {
      console.error('Token列表加载失败:', data)
      tokens.value = []
    }
  } catch (error) {
    console.error('Token列表加载错误:', error)
    tokens.value = []
  }
}

// 加载已绑定的Token ID列表
const loadBoundTokens = async () => {
  try {
    const response = await fetch('/api/recharge-cards/bound-tokens')
    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      boundTokenIds.value = data.data
    } else {
      console.error('获取已绑定Token失败:', data)
    }
  } catch (error) {
    console.error('加载已绑定Token失败:', error)
  }
}

// 判断Token是否已绑定
const isTokenBound = (tokenId: string): boolean => {
  return boundTokenIds.value.includes(tokenId)
}

// 获取Token状态样式类
const getTokenStatusClass = (token: Token): string => {
  const status = getTokenStatus(token)
  switch (status) {
    case '正常':
      return 'text-success'
    case '失效':
      return 'text-danger'
    case '未验证':
      return 'text-secondary'
    case '耗尽':
      return 'text-warning'
    default:
      return 'text-secondary'
  }
}

// 根据剩余时间获取颜色类
const getDaysColorClass = (token: Token): string => {
  const timeInfo = calculateRemainingTime(token)
  if (timeInfo.totalDays === 0) return 'text-muted'

  if (timeInfo.totalDays > 5) return 'text-success'  // 绿色
  if (timeInfo.totalDays > 2) return 'text-warning'  // 橙色
  return 'text-danger'  // 红色
}

// 根据剩余次数获取颜色类
const getCreditsColorClass = (credits: string): string => {
  if (credits === '-') return 'text-muted'

  const creditsNum = parseInt(credits)
  if (creditsNum > 30) return 'text-success'  // 绿色
  if (creditsNum > 10) return 'text-warning'  // 橙色
  return 'text-danger'  // 红色
}

// 状态过滤
const activeFilter = ref<string | null>(null)

// 状态统计
const statusStats = computed(() => {
  const stats = {
    used: 0,
    unused: 0,
    expiringSoon: 0,
    unavailable: 0
  }

  allActivationCards.value.forEach(card => {
    // 检查是否失效（检查所有绑定Token类型的激活码）
    let isUnavailable = false
    if (card.card_type === 'token_binding' && card.bound_token_id) {
      const tokenInfo = getTokenInfo(card.bound_token_id)
      if (tokenInfo) {
        // 只检查 ban_status 失效状态
        if (tokenInfo.ban_status === '"ACTIVE"') {
          isUnavailable = true
          stats.unavailable++
        }
      } else {
      }
    } else {
    }

    if (!isUnavailable) {
      if (card.used_at) {
        stats.used++

        // 检查是否即将过期（天数小于2）
        if (card.card_type === 'token_binding' && card.bound_token_id) {
          const tokenInfo = getTokenInfo(card.bound_token_id)
          if (tokenInfo) {
            const timeInfo = calculateRemainingTime(tokenInfo)
            if (timeInfo.totalDays > 0 && timeInfo.totalDays < 2) {
              stats.expiringSoon++
            }
          }
        }
      } else {
        stats.unused++
      }
    }
  })

  return stats
})

// 过滤后的激活码列表
const filteredActivationCards = computed(() => {
  if (!activeFilter.value) {
    return allActivationCards.value
  }

  return allActivationCards.value.filter(card => {
    switch (activeFilter.value) {
      case '已使用':
        // 已使用且非失效的
        if (card.used_at) {
          if (card.card_type === 'token_binding' && card.bound_token_id) {
            const tokenInfo = getTokenInfo(card.bound_token_id)
            if (tokenInfo) {
              return tokenInfo.ban_status !== '"ACTIVE"'
            }
          }
          return true // 非绑定类型的已使用激活码
        }
        return false
      case '未使用':
        // 未使用且非失效的
        if (!card.used_at) {
          if (card.card_type === 'token_binding' && card.bound_token_id) {
            const tokenInfo = getTokenInfo(card.bound_token_id)
            if (tokenInfo) {
              return tokenInfo.ban_status !== '"ACTIVE"'
            }
          }
          return true // 非绑定类型的未使用激活码
        }
        return false
      case '即将过期':
        // 已使用且即将过期的（排除失效的）
        if (card.used_at && card.card_type === 'token_binding' && card.bound_token_id) {
          const tokenInfo = getTokenInfo(card.bound_token_id)
          if (tokenInfo) {
            // 排除失效的
            if (tokenInfo.ban_status === '"ACTIVE"') return false
            const timeInfo = calculateRemainingTime(tokenInfo)
            return timeInfo.totalDays > 0 && timeInfo.totalDays < 2
          }
        }
        return false
      case '失效':
        // 绑定失效Token的激活码（无论是否使用）
        if (card.card_type === 'token_binding' && card.bound_token_id) {
          const tokenInfo = getTokenInfo(card.bound_token_id)
          if (tokenInfo) {
            // 只检查 ban_status 失效状态
            return tokenInfo.ban_status === '"ACTIVE"'
          }
        }
        return false
      default:
        return true
    }
  })
})

// 切换过滤器
const toggleFilter = (filter: string | null) => {
  activeFilter.value = activeFilter.value === filter ? null : filter
  // 切换过滤器时重置到第一页
  updatePagination(1)
}

// 更新分页数据
const updatePagination = (page: number = 1) => {
  const filteredData = filteredActivationCards.value
  const total = filteredData.length
  const limit = pagination.value.limit
  const totalPages = Math.ceil(total / limit) || 1

  // 确保页码在有效范围内
  const currentPage = Math.max(1, Math.min(page, totalPages))

  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * limit
  const endIndex = Math.min(startIndex + limit, total)



  // 更新显示的激活码数据
  activationCards.value = filteredData.slice(startIndex, endIndex)

  // 更新分页信息
  pagination.value = {
    has_next: currentPage < totalPages,
    has_prev: currentPage > 1,
    limit: limit,
    page: currentPage,
    total: total,
    total_pages: totalPages
  }
}

// 监听数据变化，更新分页（仅在数据加载时）
watch(allActivationCards, () => {
  if (allActivationCards.value.length > 0) {
    updatePagination(1)
  }
})

// 分页导航函数
const goToPage = (page: number) => {
  updatePagination(page)
}

const goToPrevPage = () => {
  if (pagination.value.has_prev) {
    updatePagination(pagination.value.page - 1)
  }
}

const goToNextPage = () => {
  if (pagination.value.has_next) {
    updatePagination(pagination.value.page + 1)
  }
}

const getPageNumbers = (): number[] => {
  const pages: number[] = []
  const totalPages = pagination.value.total_pages
  const currentPage = pagination.value.page

  // 显示当前页前后2页
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, currentPage + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

// 卡类型文本转换
const getCardTypeText = (cardType: string): string => {
  switch (cardType) {
    case 'token_binding':
      return '绑定'
    default:
      return '普通'
  }
}

// 充值天数文本转换
const getDaysText = (card: ActivationCard): string => {
  if (card.card_type === 'token_binding') {
    return '绑定'
  }
  return `${card.days} 天`
}

// 获取Token详细信息
const getTokenInfo = (tokenId: string) => {
  return tokens.value.find(token => token.id === tokenId)
}

// 获取Token状态
const getTokenStatus = (token: Token): '正常' | '失效' | '未验证' | '耗尽' => {
  if ((!token.portal_info || token.portal_info === '{}') &&
      (!token.ban_status || token.ban_status === '{}')) {
    return '未验证'
  }

  // 检查剩余次数是否为0（耗尽状态）
  try {
    const portalInfo = JSON.parse(token.portal_info)
    if (portalInfo && portalInfo.credits_balance === 0) {
      return '耗尽'
    }
  } catch {
    // 继续其他检查
  }

  if (token.ban_status) {
    if (token.ban_status === '{}') {
      return '正常'
    }
    if (token.ban_status === '"ACTIVE"') {
      return '失效'
    }
  }

  try {
    const portalInfo = JSON.parse(token.portal_info)
    if (!portalInfo || !portalInfo.is_active) return '失效'

    const expiryDate = new Date(portalInfo.expiry_date)
    const now = new Date()
    return expiryDate > now ? '正常' : '失效'
  } catch {
    return '失效'
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

// 格式化日期时间
const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}



// 生命周期
onMounted(() => {
  loadActivationCards()
  loadTokens() // 加载Token列表用于显示绑定Token详情
  loadBoundTokens() // 加载已绑定Token列表
})

// 方法
const loadCards = () => {
  activationCards.value = []
}

// loadTokens方法已重新定义为异步方法




// 显示刷新Token确认模态框
const showRefreshTokenModal = (tokenId: string) => {
  const token = tokens.value.find(t => t.id === tokenId)
  if (!token) {
    toast.error('Token信息未找到')
    return
  }

  refreshingToken.value = token
  showRefreshModal.value = true
}

// 关闭刷新确认模态框
const closeRefreshModal = () => {
  showRefreshModal.value = false
  refreshingToken.value = null
}

// 确认刷新Token状态
const confirmRefreshToken = async () => {
  if (!refreshingToken.value || refreshingTokenId.value) {
    return
  }

  const tokenId = refreshingToken.value.id
  refreshingTokenId.value = tokenId

  try {
    const response = await fetch(`/api/tokens/${tokenId}/refresh`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      // 更新本地Token数据
      const tokenIndex = tokens.value.findIndex(t => t.id === tokenId)
      if (tokenIndex > -1 && data.data) {
        tokens.value[tokenIndex] = { ...tokens.value[tokenIndex], ...data.data }
      }

      toast.success(data.message || 'Token状态刷新成功')

      // 关闭模态框
      closeRefreshModal()
    } else {
      toast.error(data.error || data.message || 'Token状态刷新失败')
    }
  } catch (error) {
    console.error('Token状态刷新失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    refreshingTokenId.value = null
  }
}

// 格式化激活码显示（前4位+后4位，中间用*隐藏）
const formatActivationCode = (code: string): string => {
  if (!code || code.length <= 8) {
    return code // 如果激活码太短，直接显示
  }

  const firstFour = code.substring(0, 4)
  const lastFour = code.substring(code.length - 4)
  const middleLength = code.length - 8
  const stars = '*'.repeat(middleLength)

  return `${firstFour}${stars}${lastFour}`
}

// 获取复制用的天数和次数文本
const getCopyDaysText = (card: ActivationCard): string => {
  if (card.card_type === 'token_binding' && card.bound_token_id) {
    const tokenInfo = getTokenInfo(card.bound_token_id)
    if (tokenInfo) {
      const timeText = formatRemainingTime(tokenInfo)
      const remainingCredits = getRemainingCredits(tokenInfo)
      const creditsText = remainingCredits === '-' ? '0次' : `${remainingCredits}次`
      return `${timeText}/${creditsText}`
    }
  }
  // 普通激活码只显示天数，次数信息不确定
  return `${card.days}天`
}

// 复制激活码到剪贴板
const copyActivationCode = async (card: ActivationCard) => {
  try {
    const copyText = `激活码: ${card.id}
--- ${getCopyDaysText(card)} ---
先到先得, 用法自己研究.`

    await navigator.clipboard.writeText(copyText)
    toast.success('激活码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)

    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = `激活码: ${card.id}
--- ${getCopyDaysText(card)} ---
先到先得, 用法自己研究.`

      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      toast.success('激活码已复制到剪贴板')
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError)
      toast.error('复制失败，请手动复制')
    }
  }
}

// 排序后的Token列表
const sortedTokens = computed(() => {
  return [...tokens.value].sort((a, b) => {
    // 获取Token状态
    const aStatus = getTokenStatus(a)
    const bStatus = getTokenStatus(b)
    const aBound = isTokenBound(a.id)
    const bBound = isTokenBound(b.id)

    // 不可选择的Token（已绑定或耗尽）排到最后
    const aDisabled = aBound || aStatus === '耗尽'
    const bDisabled = bBound || bStatus === '耗尽'

    if (aDisabled && !bDisabled) return 1
    if (!aDisabled && bDisabled) return -1

    // 如果都是可选择或都是不可选择，按天数和次数排序
    const aTimeInfo = calculateRemainingTime(a)
    const bTimeInfo = calculateRemainingTime(b)
    const aCredits = getRemainingCredits(a)
    const bCredits = getRemainingCredits(b)

    // 处理无效值
    const aDaysNum = aTimeInfo.totalDays === 0 ? Infinity : aTimeInfo.totalDays
    const bDaysNum = bTimeInfo.totalDays === 0 ? Infinity : bTimeInfo.totalDays
    const aCreditsNum = aCredits === '-' ? Infinity : parseInt(aCredits)
    const bCreditsNum = bCredits === '-' ? Infinity : parseInt(bCredits)

    // 天数少的优先
    if (aDaysNum !== bDaysNum) {
      return aDaysNum - bDaysNum
    }

    // 天数相同时，次数少的优先
    return aCreditsNum - bCreditsNum
  })
})

// 选择Token
const selectToken = (tokenId: string) => {
  const token = tokens.value.find(t => t.id === tokenId)
  if (!token) return

  // 已绑定或耗尽的Token不能选择
  if (isTokenBound(tokenId) || getTokenStatus(token) === '耗尽') {
    return
  }

  if (newCard.value.selectedToken === tokenId) {
    // 如果点击的是已选中的Token，则取消选择
    newCard.value.selectedToken = undefined
  } else {
    // 否则选择该Token
    newCard.value.selectedToken = tokenId
  }
}

const showCreateCardModal = () => {
  newCard.value = {
    cardType: '普通',
    rechargeDays: 30
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  newCard.value = {
    cardType: '普通',
    rechargeDays: 30
  }
}

const createCard = async () => {
  if (isCreating.value) return

  isCreating.value = true

  try {
    let payload: any

    if (newCard.value.cardType === '普通' && newCard.value.rechargeDays > 0) {
      // 创建普通激活码
      payload = {
        card_type: 'normal',
        days: newCard.value.rechargeDays
      }
    } else if (newCard.value.cardType === '绑定' && newCard.value.selectedToken) {
      // 创建绑定激活码
      payload = {
        card_type: 'token_binding',
        bound_token_id: newCard.value.selectedToken,
        days: 0
      }
    } else {
      toast.error('请填写完整信息')
      return
    }

    const response = await fetch('/api/recharge-cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || '激活码创建成功')

      // 重新加载激活码列表
      await loadActivationCards()

      // 如果是绑定类型，重新加载已绑定Token列表
      if (payload.card_type === 'token_binding') {
        await loadBoundTokens()
      }

      closeCreateModal()
    } else {
      toast.error(data.error || data.message || '创建激活码失败')
    }
  } catch (error) {
    console.error('创建激活码失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    isCreating.value = false
  }
}

const refreshCard = async (card: ActivationCard) => {
  if (!card.bound_token_id || refreshingCardId.value) {
    return
  }

  refreshingCardId.value = card.id

  try {
    const response = await fetch(`/api/tokens/${card.bound_token_id}/refresh`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || 'Token信息已刷新')

      // 更新本地Token数据
      const tokenIndex = tokens.value.findIndex(t => t.id === card.bound_token_id)
      if (tokenIndex > -1 && data.data) {
        tokens.value[tokenIndex] = { ...tokens.value[tokenIndex], ...data.data }
      }

      // 不需要重新加载整个列表，Token数据已更新，界面会自动反映变化
    } else {
      toast.error(data.error || data.message || 'Token刷新失败')
    }
  } catch (error) {
    console.error('Token刷新失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    refreshingCardId.value = null
  }
}

const showDeleteCardModal = (card: ActivationCard) => {
  deletingCard.value = card
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCard.value = null
}

const confirmDelete = async () => {
  if (!deletingCard.value || isDeleting.value) return

  isDeleting.value = true

  try {
    const response = await fetch(`/api/recharge-cards/${deletingCard.value.id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || '激活码删除成功')

      // 重新加载激活码列表
      await loadActivationCards()

      // 重新加载已绑定Token列表，更新绑定状态
      await loadBoundTokens()

      closeDeleteModal()
    } else {
      toast.error(data.error || data.message || '删除激活码失败')
    }
  } catch (error) {
    console.error('删除激活码失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
/* 使用 Tabler 的默认样式，无需额外自定义 */

/* 旋转动画 */
.refresh-spin {
  animation: refresh-rotate 1s linear infinite !important;
  transform-origin: center center !important;
  display: inline-block !important;
}

@keyframes refresh-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 鼠标指针 */
.cursor-pointer {
  cursor: pointer;
}

/* 激活码虚线效果 */
.cursor-pointer {
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-color: #dee2e6;
  text-underline-offset: 2px;
  transition: text-decoration-color 0.2s ease;
}

.cursor-pointer:hover {
  text-decoration-color: #6c757d;
}

/* Token选择卡片样式 */
.token-selection-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.token-cards-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  .token-cards-grid {
    grid-template-columns: 1fr;
  }
}

.token-card {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.token-card:hover:not(.token-card-disabled) {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
  transform: translateY(-1px);
}

.token-card-selected {
  border-color: #0d6efd !important;
  background-color: #f8f9ff !important;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.token-card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8f9fa;
}

.token-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.token-card-title {
  font-weight: 600;
  color: #212529;
  font-size: 0.95rem;
  flex: 1;
  margin-right: 0.5rem;
  line-height: 1.3;
}

.token-card-status .badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  white-space: nowrap;
}

.token-card-info {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.token-info-item {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.token-info-item i {
  color: #adb5bd;
  font-size: 0.8rem;
}

.token-card-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
}

.token-card-badge .badge {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
}

/* 状态徽章颜色 */
.badge.text-success {
  background-color: #d1e7dd;
  color: #0f5132;
}

.badge.text-danger {
  background-color: #f8d7da;
  color: #842029;
}

.badge.text-warning {
  background-color: #fff3cd;
  color: #664d03;
}

.badge.text-secondary {
  background-color: #e2e3e5;
  color: #41464b;
}

/* 筛选卡片样式 */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

/* 移动端响应式设计 */
@media (max-width: 576px) {
  /* 移动端统计卡片优化 */
  .card-sm {
    margin-bottom: 0.75rem;
  }

  .card-sm .card-body {
    padding: 0.75rem;
  }

  .card-sm .h1 {
    font-size: 1.5rem;
  }

  .card-sm .font-weight-medium {
    font-size: 0.875rem;
  }

  .card-sm .text-muted {
    font-size: 0.75rem;
  }

  .card-sm .avatar {
    width: 2rem;
    height: 2rem;
  }

  .card-sm .avatar i {
    font-size: 1rem;
  }
}

/* 中等屏幕优化 */
@media (max-width: 768px) {
  .card-sm .row.align-items-center {
    gap: 0.5rem;
  }

  .card-sm .col-auto:last-child {
    text-align: right;
  }
}
</style>
