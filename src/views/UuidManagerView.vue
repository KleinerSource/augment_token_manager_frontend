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
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">UUID 管理</h2>
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
                <tr v-else v-for="uuid in uuids" :key="uuid.uuid">
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
import { ref, onMounted, computed } from 'vue'
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
const uuids = ref<UuidItem[]>([])
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
const pagination = ref<Pagination>({
  current_page: 1,
  has_next: false,
  has_prev: false,
  page_size: 10,
  total_pages: 1,
  total_records: 0
})
const isLoading = ref(false)
const isCreating = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)



// 生命周期
onMounted(() => {
  loadUuids()
})

// 方法
const loadUuids = async (page: number = 1) => {
  isLoading.value = true

  try {
    const response = await fetch(`/api/uuids?page=${page}&limit=${pagination.value.page_size}`)
    const data = await response.json()

    if (data.success) {
      uuids.value = data.data || []
      pagination.value = data.pagination || pagination.value
    } else {
      uuids.value = []
    }
  } catch (error) {
    uuids.value = []
  } finally {
    isLoading.value = false
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
      await loadUuids(pagination.value.current_page)

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
      await loadUuids(pagination.value.current_page)

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
      await loadUuids(pagination.value.current_page)

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

// 保留原有方法以兼容
const editUuid = (uuid: UuidItem) => {
  showEditUuidModal(uuid)
}

const deleteUuid = (uuid: UuidItem) => {
  showDeleteUuidModal(uuid)
}
</script>

<style scoped>
/* 使用 Tabler 的默认样式，无需额外自定义 */
</style>
