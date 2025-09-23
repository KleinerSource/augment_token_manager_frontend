<template>
  <div v-if="hasPermission" class="uuid-manager">
    <!-- 权限检查通过，显示内容 -->
  </div>
  <div v-else class="no-permission">
    <!-- 无权限提示 -->
    <div class="page-body">
      <div class="container-xl">
        <div class="empty">
          <div class="empty-icon">
            <i class="bi bi-shield-exclamation" style="font-size: 3rem; color: var(--tblr-warning);"></i>
          </div>
          <p class="empty-title">无访问权限</p>
          <p class="empty-subtitle text-muted">
            您没有访问 UUID 管理功能的权限，请联系管理员获取相应权限。
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="hasPermission" class="uuid-manager-content">
    <!-- 页面标题 -->
    <div class="page-header d-print-none">
      <div class="container-xl">
        <!-- 页面标题行 -->
        <div class="row">
          <div class="col">
            <h2 class="page-title">UUID 管理</h2>
          </div>
        </div>

        <!-- 搜索和操作按钮行 -->
        <div class="row g-2 align-items-center mt-3">
          <div class="col-auto">
            <div class="input-group">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                placeholder="搜索UUID..."
                style="min-width: 200px;"
              >
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
            </div>
          </div>
          <div class="col-auto ms-auto d-print-none">
            <div class="btn-list">
              <button @click="showAddUuidModal" class="btn btn-primary" title="添加 UUID">
                <i class="bi bi-plus-circle me-sm-2"></i>
                <span class="d-none d-sm-inline">添加 UUID</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="page-body">
      <div class="container-xl">
        <div class="card">
          <div class="table-responsive">
            <table class="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>状态</th>
                  <th>剩余天数</th>
                  <th>时间</th>
                  <th class="w-1">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="5" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    加载中...
                  </td>
                </tr>
                <tr v-else-if="uuids.length === 0">
                  <td colspan="5" class="text-center py-4 text-muted">
                    暂无UUID数据
                  </td>
                </tr>
                <tr v-else v-for="uuid in uuids" :key="uuid.uuid" :class="{ 'table-danger': uuid.danger }">
                  <td class="text-muted font-monospace">{{ uuid.uuid }}</td>
                  <td>
                    <span :class="['badge', uuid.is_enabled ? 'bg-success text-white' : 'bg-danger text-white']">
                      {{ uuid.is_enabled ? '启用' : '停用' }}
                    </span>
                  </td>
                  <td class="text-muted">{{ uuid.days_left }}</td>
                  <td class="text-muted">
                    <div class="small">
                      <div>创建：{{ formatDateTime(uuid.created_at) }}</div>
                      <div class="text-primary">到期：{{ formatDateTime(uuid.expires_at) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-list flex-nowrap">
                      <button
                        @click="toggleUuidStatus(uuid)"
                        :class="['btn', 'btn-sm', uuid.is_enabled ? 'btn-warning' : 'btn-success']"
                        :disabled="isToggling && togglingUuid?.uuid === uuid.uuid"
                        :title="uuid.is_enabled ? '禁用UUID' : '启用UUID'"
                      >
                        <span v-if="isToggling && togglingUuid?.uuid === uuid.uuid" class="spinner-border spinner-border-sm me-1" role="status"></span>
                        <i v-else :class="['bi', 'me-1', uuid.is_enabled ? 'bi-pause-fill' : 'bi-play-fill']"></i>
                        {{ isToggling && togglingUuid?.uuid === uuid.uuid ? '切换中' : (uuid.is_enabled ? '禁用' : '启用') }}
                      </button>
                      <button @click="showEditUuidModal(uuid)" class="btn btn-sm btn-info">
                        <i class="bi bi-pencil-fill me-1"></i>
                        编辑
                      </button>
                      <button @click="showDeleteUuidModal(uuid)" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash-fill me-1"></i>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页器 -->
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
                  @click="loadUuids(pagination.page - 1)"
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
                <button class="page-link" @click="loadUuids(page)">{{ page }}</button>
              </li>
              <li :class="['page-item', !pagination.has_next ? 'disabled' : '']">
                <button
                  class="page-link"
                  @click="loadUuids(pagination.page + 1)"
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

    <!-- 编辑 UUID 模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showEditModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑 UUID</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateUuid">
              <div class="mb-3">
                <label class="form-label">UUID</label>
                <input
                  type="text"
                  v-model="editingUuid.uuid"
                  class="form-control"
                  placeholder="请输入 UUID"
                  required
                  readonly
                >
                <div class="form-hint">UUID 不可修改</div>
              </div>
              <div class="mb-3">
                <label class="form-label">到期时间</label>
                <input
                  type="datetime-local"
                  v-model="editingUuid.expires_at"
                  class="form-control"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">是否启用</label>
                <div class="form-check">
                  <input
                    type="checkbox"
                    v-model="editingUuid.is_enabled"
                    class="form-check-input"
                    id="editUuidEnabled"
                  >
                  <label class="form-check-label" for="editUuidEnabled">
                    启用此UUID
                  </label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeEditModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="updateUuid"
              :disabled="isEditing"
            >
              <span v-if="isEditing" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-if="!isEditing" class="bi bi-check-lg me-1"></i>
              {{ isEditing ? '更新中...' : '更新' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 删除确认模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showDeleteModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <p>确定要删除这个 UUID 吗？</p>
            <div class="text-muted small">
              <strong>UUID：</strong><span class="font-monospace">{{ deletingUuid?.uuid }}</span><br>
              <strong>状态：</strong>{{ deletingUuid?.is_enabled ? '启用' : '停用' }}<br>
              <strong>到期时间：</strong>{{ deletingUuid ? formatDateTime(deletingUuid.expires_at) : '' }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeDeleteModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmDelete"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-if="!isDeleting" class="bi bi-trash-fill me-1"></i>
              {{ isDeleting ? '删除中...' : '删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 添加 UUID 模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showAddModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">添加 UUID</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addUuid">
              <div class="mb-3">
                <label class="form-label">UUID</label>
                <input
                  type="text"
                  v-model="newUuid.uuid"
                  class="form-control"
                  placeholder="请输入 UUID"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">到期时间</label>
                <input
                  type="datetime-local"
                  v-model="newUuid.expires_at"
                  class="form-control"
                  required
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeAddModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="addUuid"
              :disabled="isCreating"
            >
              <span v-if="isCreating" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-if="!isCreating" class="bi bi-plus-lg me-1"></i>
              {{ isCreating ? '创建中...' : '添加' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from '../utils/toast'
import { PermissionManager } from '../types/permissions'

// 权限检查
const hasPermission = computed(() => PermissionManager.hasUuidManagement())

interface UuidItem {
  uuid: string
  key: string
  is_enabled: boolean
  expires_at: string
  created_at: string
  updated_at: string
  is_expired: boolean
  days_left: number
  danger?: boolean
}

interface NewUuid {
  uuid: string
  expires_at: string
}

interface EditingUuid {
  uuid: string
  expires_at: string
  is_enabled: boolean
}

interface Pagination {
  current_page: number
  has_next: boolean
  has_prev: boolean
  page_size: number
  total_pages: number
  total_records: number
}

// 响应式数据
const allUuids = ref<UuidItem[]>([]) // 存储所有UUID数据
const uuids = ref<UuidItem[]>([]) // 当前页显示的UUID数据
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const newUuid = ref<NewUuid>({
  uuid: '',
  expires_at: ''
})
const editingUuid = ref<EditingUuid>({
  uuid: '',
  expires_at: '',
  is_enabled: true
})
const deletingUuid = ref<UuidItem | null>(null)
const pagination = ref({
  has_next: false,
  has_prev: false,
  limit: 12,
  page: 1,
  total: 0,
  total_pages: 0
})
const isLoading = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)
const isToggling = ref(false)
const togglingUuid = ref<UuidItem | null>(null)

// 搜索功能
const searchQuery = ref('')

// 搜索过滤后的UUID列表
const filteredUuids = computed(() => {
  if (!searchQuery.value.trim()) {
    return allUuids.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return allUuids.value.filter(uuid =>
    uuid.uuid.toLowerCase().includes(query) ||
    (uuid.key && uuid.key.toLowerCase().includes(query))
  )
})

// 监听搜索查询变化，重新分页
watch(searchQuery, () => {
  if (allUuids.value.length > 0) {
    updatePagination(1) // 搜索时重置到第一页
  }
}, { immediate: false })



// 生命周期
onMounted(() => {
  loadUuids()
})

// 方法
const loadUuids = async (page: number = 1) => {
  // 如果已经有数据，只需要更新分页显示
  if (allUuids.value.length > 0) {
    updatePagination(page)
    return
  }

  isLoading.value = true
  try {
    // 一次性加载所有数据
    const response = await fetch('/api/uuids?limit=10000')
    const data = await response.json()

    if (data.success) {
      const fetchedUuids = data.data || []
      allUuids.value = fetchedUuids
      updatePagination(page)
    } else {
      toast.error(data.error || '获取UUID列表失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isLoading.value = false
  }
}

// 更新前端分页显示
const updatePagination = (page: number) => {
  const total = filteredUuids.value.length
  const limit = pagination.value.limit
  const totalPages = Math.ceil(total / limit) || 1

  // 确保页码在有效范围内
  const currentPage = Math.max(1, Math.min(page, totalPages))

  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * limit
  const endIndex = Math.min(startIndex + limit, total)

  // 更新显示的UUID数据
  uuids.value = filteredUuids.value.slice(startIndex, endIndex)

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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
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

const showAddUuidModal = () => {
  showAddModal.value = true
  newUuid.value = { uuid: '', expires_at: '' }
}

const closeAddModal = () => {
  showAddModal.value = false
  newUuid.value = { uuid: '', expires_at: '' }
}

const addUuid = async () => {
  if (!newUuid.value.uuid || !newUuid.value.expires_at) {
    toast.error('请填写完整的UUID信息')
    return
  }

  isCreating.value = true

  try {
    const response = await fetch('/api/uuids', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uuid: newUuid.value.uuid,
        expires_at: newUuid.value.expires_at.replace('T', ' ') + ':00'
      })
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || 'UUID创建成功')

      // 重新加载UUID列表
      allUuids.value = [] // 清空缓存
      await loadUuids(pagination.value.page)

      closeAddModal()
    } else {
      toast.error(data.error || data.message || 'UUID创建失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isCreating.value = false
  }
}


const showEditUuidModal = async (uuid: UuidItem) => {
  try {
    // 调用API获取UUID详情
    const response = await fetch(`/api/uuids/${uuid.uuid}`)
    const data = await response.json()

    if (data.success && data.data) {
      // 填充编辑表单数据
      editingUuid.value = {
        uuid: data.data.uuid,
        expires_at: data.data.expires_at.replace(' ', 'T').slice(0, 16), // 转换为 datetime-local 格式
        is_enabled: data.data.is_enabled
      }
      showEditModal.value = true
    } else {
      toast.error(data.error || 'UUID信息获取失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUuid.value = {
    uuid: '',
    expires_at: '',
    is_enabled: true
  }
}

const updateUuid = async () => {
  if (!editingUuid.value.uuid || !editingUuid.value.expires_at) {
    toast.error('请填写完整的UUID信息')
    return
  }

  isEditing.value = true

  try {
    const response = await fetch(`/api/uuids/${editingUuid.value.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_enabled: editingUuid.value.is_enabled,
        expires_at: editingUuid.value.expires_at.replace('T', ' ') + ':00'
      })
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || 'UUID更新成功')

      // 重新加载UUID列表
      allUuids.value = [] // 清空缓存
      await loadUuids(pagination.value.page)

      closeEditModal()
    } else {
      toast.error(data.error || data.message || 'UUID更新失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isEditing.value = false
  }
}

const showDeleteUuidModal = (uuid: UuidItem) => {
  deletingUuid.value = uuid
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUuid.value = null
}

const confirmDelete = async () => {
  if (!deletingUuid.value) {
    return
  }

  isDeleting.value = true

  try {
    const response = await fetch(`/api/uuids/${deletingUuid.value.uuid}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || 'UUID删除成功')

      // 重新加载UUID列表
      allUuids.value = [] // 清空缓存
      await loadUuids(pagination.value.page)

      closeDeleteModal()
    } else {
      toast.error(data.error || data.message || 'UUID删除失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isDeleting.value = false
  }
}

// 快速切换UUID启用/禁用状态
const toggleUuidStatus = async (uuid: UuidItem) => {
  isToggling.value = true
  togglingUuid.value = uuid

  try {
    const response = await fetch(`/api/uuids/${uuid.uuid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_enabled: !uuid.is_enabled,
        expires_at: uuid.expires_at
      })
    })

    const data = await response.json()

    if (data.success) {
      // 直接更新本地数据，避免重新加载
      const index = allUuids.value.findIndex(u => u.uuid === uuid.uuid)
      if (index !== -1) {
        allUuids.value[index].is_enabled = !uuid.is_enabled
      }

      // 更新当前页显示
      updatePagination(pagination.value.page)

      toast.success(`UUID已${!uuid.is_enabled ? '启用' : '禁用'}`)
    } else {
      toast.error(data.error || data.message || 'UUID状态切换失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isToggling.value = false
    togglingUuid.value = null
  }
}

// 保留原有方法以兼容
const editUuid = (uuid: UuidItem) => {
  showEditUuidModal(uuid)
}

const deleteUuid = (uuid: UuidItem) => {
  showDeleteUuidModal(uuid)
}
</script>

<style scoped>
/* 危险UUID行样式 */
.table-danger {
  background-color: rgba(220, 53, 69, 0.1) !important;
  border-left: 4px solid #dc3545;
}

.table-danger:hover {
  background-color: rgba(220, 53, 69, 0.15) !important;
}

.table-danger td {
  border-color: rgba(220, 53, 69, 0.2);
}
</style>
