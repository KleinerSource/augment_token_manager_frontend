<template>
  <div v-if="hasPermission" class="token-manager">
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
            您没有访问 Token 管理功能的权限，请联系管理员获取相应权限。
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-if="hasPermission" class="token-manager-content">
    <!-- 页面标题 -->
    <div class="page-header d-print-none">
      <div class="container-xl">
        <!-- 页面标题行 -->
        <div class="row">
          <div class="col">
            <h2 class="page-title">Token 管理</h2>
          </div>
        </div>

        <!-- 操作按钮行 -->
        <div class="row g-2 align-items-center mt-3">
          <div class="col-auto ms-auto d-print-none">
            <div class="btn-list">
              <!-- 排序下拉菜单 -->
              <div class="dropdown" ref="sortDropdownRef">
                <button
                  class="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  @click="toggleSortDropdown"
                  :title="getSortModeTitle()"
                >
                  <i class="bi bi-sort-down me-1"></i>
                  <span class="d-none d-lg-inline">
                    {{ getSortModeText() }}
                  </span>
                </button>
                <ul class="dropdown-menu" :class="{ 'show': isSortDropdownOpen }">
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="setSortMode('default')"
                      :class="{ 'active': sortMode === 'default' }"
                    >
                      <i class="bi bi-list me-2"></i>默认排序
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="setSortMode('credits-desc')"
                      :class="{ 'active': sortMode === 'credits-desc' }"
                    >
                      <i class="bi bi-sort-numeric-down me-2"></i>次数 ↓
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="setSortMode('credits-asc')"
                      :class="{ 'active': sortMode === 'credits-asc' }"
                    >
                      <i class="bi bi-sort-numeric-up me-2"></i>次数 ↑
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="setSortMode('days-desc')"
                      :class="{ 'active': sortMode === 'days-desc' }"
                    >
                      <i class="bi bi-calendar-date me-2"></i>天数 ↓
                    </a>
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      href="#"
                      @click.prevent="setSortMode('days-asc')"
                      :class="{ 'active': sortMode === 'days-asc' }"
                    >
                      <i class="bi bi-calendar-date-fill me-2"></i>天数 ↑
                    </a>
                  </li>
                </ul>
              </div>

              <!-- 批量选择按钮 -->
              <button
                type="button"
                :class="['btn', isBatchSelectMode ? 'btn-danger' : 'btn-outline-secondary']"
                @click="toggleBatchSelectMode"
                :title="isBatchSelectMode ? '退出批量选择' : '开启批量选择'"
              >
                <i :class="['bi', isBatchSelectMode ? 'bi-square' : 'bi-check2-square']"></i>
                <span class="d-none d-lg-inline ms-1">
                  {{ isBatchSelectMode ? '退出选择' : '批量选择' }}
                </span>
              </button>

              <!-- 批量操作按钮 -->
              <div v-if="isBatchSelectMode" class="btn-group" role="group">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="toggleSelectAll"
                  :title="isAllSelected ? '取消全选' : '全选'"
                >
                  <i :class="['bi', isAllSelected ? 'bi-square' : (isPartialSelected ? 'bi-dash-square' : 'bi-check-square')]"></i>
                  <span class="d-none d-lg-inline ms-1">
                    {{ isAllSelected ? '取消全选' : '全选' }}
                  </span>
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  @click="exportSelected"
                  :disabled="selectedCount === 0"
                  :title="`导出选中的 ${selectedCount} 项`"
                >
                  <i class="bi bi-download"></i>
                  <span class="d-none d-lg-inline ms-1">导出 ({{ selectedCount }})</span>
                </button>
              </div>

              <button
                @click="validateAllTokens"
                class="btn btn-warning"
                :disabled="isLoading || isBatchValidating"
                :title="isLoading ? '加载中...' : (isBatchValidating ? '验证中...' : (isBatchSelectMode && selectedCount > 0 ? `验证选中的 ${selectedCount} 个Token` : '验证 Token'))"
              >
                <i class="bi bi-check-circle me-sm-2"></i>
                <span class="d-none d-sm-inline">
                  {{ isLoading ? '加载中...' : (isBatchValidating ? '验证中...' : (isBatchSelectMode && selectedCount > 0 ? `验证 (${selectedCount})` : '验证 Token')) }}
                </span>
              </button>
              <button
                @click="showBatchRefreshConfirm"
                class="btn btn-secondary"
                :disabled="isLoading || isBatchRefreshing"
                :title="isLoading ? '加载中...' : (isBatchRefreshing ? '刷新中...' : (isBatchSelectMode && selectedCount > 0 ? `刷新选中的 ${selectedCount} 个Token` : '全部刷新'))"
              >
                <i
                  :class="['bi', 'me-sm-2',
                    isBatchRefreshing ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
                  :style="isBatchRefreshing ? 'animation: refresh-rotate 1s linear infinite; transform-origin: center center; display: inline-block;' : ''"
                ></i>
                <span class="d-none d-sm-inline">
                  {{ isLoading ? '加载中...' : (isBatchRefreshing ? '刷新中...' : (isBatchSelectMode && selectedCount > 0 ? `刷新 (${selectedCount})` : '全部刷新')) }}
                </span>
              </button>
              <button @click="showGetTokenModal" class="btn btn-success" title="获取 Token">
                <i class="bi bi-link-45deg me-sm-2"></i>
                <span class="d-none d-sm-inline">获取 Token</span>
              </button>
              <button @click="showAddTokenModal" class="btn btn-primary" title="添加 Token">
                <i class="bi bi-plus-circle me-sm-2"></i>
                <span class="d-none d-sm-inline">添加 Token</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-body">
      <div class="container-xl">






        <!-- 表格视图 -->
        <div class="card">
          <div class="table-responsive">
            <table class="table table-vcenter card-table">
              <thead>
                <tr>
                  <th v-if="isBatchSelectMode" class="w-1">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="isAllSelected"
                      :indeterminate="isPartialSelected"
                      @change="toggleSelectAll"
                      title="全选/取消全选"
                    />
                  </th>
                  <th>邮箱备注</th>
                  <th>创建时间</th>
                  <th>过期时间</th>
                  <th>剩余次数</th>
                  <th>状态</th>
                  <th class="w-1">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td :colspan="isBatchSelectMode ? 7 : 6" class="text-center py-4 text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    加载中...
                  </td>
                </tr>
                <tr v-else-if="tokens.length === 0">
                  <td :colspan="isBatchSelectMode ? 7 : 6" class="text-center py-4 text-muted">
                    暂无 Token 数据
                  </td>
                </tr>
                <tr v-else v-for="token in tokens" :key="token.id">
                  <td v-if="isBatchSelectMode" class="w-1">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="selectedItems.has(token.id)"
                      @change="toggleSelectItem(token.id)"
                    />
                  </td>
                  <td class="text-muted">{{ token.email_note || '未设置备注' }}</td>
                  <td class="text-muted">{{ token.created_at }}</td>
                  <td :class="getDaysColorClass(token)">
                    {{ formatRemainingTime(token) }}
                  </td>
                  <td :class="getCreditsColorClass(token)">
                    <span :class="{ 'highlighted-metric': tokensWithChanges.has(token.id) }">
                      {{ getRemainingCredits(token) }}
                    </span>
                  </td>
                  <td>
                    <span
                      :class="['badge', 'cursor-pointer',
                        isValidating && validatingToken?.id === token.id ? 'bg-warning text-white' :
                        getTokenStatusClass(token)]"
                      @click="showValidateModal(token)"
                      title="点击验证Token状态"
                    >
                      <span v-if="isValidating && validatingToken?.id === token.id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      {{ isValidating && validatingToken?.id === token.id ? '验证中' : getTokenStatus(token) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-list flex-nowrap">
                      <button @click="executeToken(token)" class="btn btn-sm btn-primary">
                        <i class="bi bi-play-fill me-1"></i>
                        执行
                      </button>
                      <button
                        @click="refreshToken(token)"
                        class="btn btn-sm btn-success"
                        :disabled="isRefreshing && refreshingToken?.id === token.id"
                      >
                        <i
                          :class="['bi', 'me-1',
                            isRefreshing && refreshingToken?.id === token.id ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
                        ></i>
                        {{ isRefreshing && refreshingToken?.id === token.id ? '刷新' : '刷新' }}
                      </button>
                      <button @click="showEditTokenModal(token)" class="btn btn-sm btn-warning">
                        <i class="bi bi-pencil-fill me-1"></i>
                        编辑
                      </button>
                      <button @click="showDeleteTokenModal(token)" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash-fill me-1"></i>
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
                  @click="loadTokens(pagination.page - 1)"
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
                <button class="page-link" @click="loadTokens(page)">{{ page }}</button>
              </li>
              <li :class="['page-item', !pagination.has_next ? 'disabled' : '']">
                <button
                  class="page-link"
                  @click="loadTokens(pagination.page + 1)"
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

    <!-- 获取 Token 模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showGetModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">获取 Token</h5>
            <button type="button" class="btn-close" @click="closeGetModal"></button>
            <!-- URL倒计时进度条光效 -->
            <div v-if="urlCountdown > 0" class="countdown-glow-bar"
                 :class="{
                   'countdown-green': urlCountdown / 300 > 0.5,
                   'countdown-orange': urlCountdown / 300 <= 0.5 && urlCountdown / 300 > 0.2,
                   'countdown-red': urlCountdown / 300 <= 0.2
                 }"
                 :style="{ width: (urlCountdown / 300 * 100) + '%' }"></div>
          </div>
          <div class="modal-body">
            <!-- 步骤指示器 -->
            <div class="steps-wrapper mb-4">
              <div class="steps">
                <div class="step" :class="{ 'step-active': getTokenStep >= 1, 'step-completed': getTokenStep > 1 }">
                  <div class="step-number">1</div>
                  <div class="step-title">生成授权URL</div>
                </div>
                <div class="step-divider" :class="{ 'divider-active': getTokenStep > 1 }"></div>
                <div class="step" :class="{ 'step-active': getTokenStep >= 2, 'step-completed': getTokenStep > 2 }">
                  <div class="step-number">2</div>
                  <div class="step-title">输入授权响应</div>
                </div>
                <div class="step-divider" :class="{ 'divider-active': getTokenStep > 2 }"></div>
                <div class="step" :class="{ 'step-active': getTokenStep >= 3 }">
                  <div class="step-number">3</div>
                  <div class="step-title">确认并保存</div>
                </div>
              </div>
            </div>
            <!-- 第一步：生成授权URL -->
            <div v-if="getTokenStep === 1">
              <h6 class="mb-3">第一步：生成授权URL</h6>
              <div class="mb-3">
                <label class="form-label">授权URL</label>
                <div class="input-group">
                  <input
                    type="text"
                    v-model="authUrl"
                    class="form-control"
                    placeholder="点击生成授权URL按钮"
                    readonly
                  >
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="copyAuthUrl"
                    :disabled="!authUrl"
                    title="复制URL"
                  >
                    <i class="bi bi-clipboard"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    @click="openAuthUrl"
                    :disabled="!authUrl"
                    title="在浏览器中打开"
                  >
                    <i class="bi bi-box-arrow-up-right"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">邮箱备注（可选）</label>
                <input
                  type="text"
                  v-model="emailNote"
                  class="form-control"
                  placeholder="请输入邮箱或备注信息（可选）"
                >
                <div class="form-hint mt-1">
                  <i class="bi bi-info-circle me-1"></i>
                  用于标识和管理此Token，方便后续查找
                </div>
              </div>

            </div>

            <!-- 第二步：输入授权响应 -->
            <div v-if="getTokenStep === 2">
              <h6 class="mb-3">第二步：输入授权响应</h6>
              <p class="text-muted mb-3">请在浏览器中完成授权，然后将获得的响应信息粘贴到下方：</p>
              <div class="mb-3">
                <label class="form-label">授权响应JSON</label>
                <textarea
                  v-model="authResponse"
                  :class="['form-control', authResponseError ? 'is-invalid' : '']"
                  rows="4"
                  placeholder="{
    &quot;code&quot;: &quot;your_code&quot;,
    &quot;state&quot;: &quot;random_string&quot;,
    &quot;tenant_url&quot;: &quot;https://example.api.augmentcode.com/&quot;
}"
                  @input="validateAuthResponse"
                ></textarea>
                <div v-if="authResponseError" class="invalid-feedback">
                  {{ authResponseError }}
                </div>
                <div class="form-hint mt-2">
                  <strong>格式要求：</strong>必须是JSON格式，包含 code、state、tenant_url 三个字段<br>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Portal URL（可选）</label>
                <input
                  type="text"
                  v-model="portalUrl"
                  class="form-control"
                  placeholder="请输入Portal URL（可选）"
                >
              </div>
            </div>

            <!-- 第三步：确认信息并保存Token -->
            <div v-if="getTokenStep === 3">
              <h6 class="mb-3">第三步：确认信息并保存Token</h6>
              <div v-if="tokenData.tenant_url">
                <div class="alert alert-success">
                  <h6>Token获取成功！</h6>
                  <p class="mb-0">请确认以下信息无误后点击保存</p>
                </div>
                <form @submit.prevent="saveToken">
                  <div class="mb-3">
                    <label class="form-label">Tenant URL</label>
                    <input
                      type="text"
                      :value="tokenData.tenant_url"
                      class="form-control"
                      readonly
                    >
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Access Token</label>
                    <textarea
                      :value="tokenData.access_token"
                      class="form-control"
                      rows="3"
                      readonly
                    ></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Portal URL（可编辑）</label>
                    <input
                      type="text"
                      v-model="tokenData.portal_url"
                      class="form-control"
                      placeholder="请输入 Portal URL（可选）"
                    >
                    <div class="form-hint mt-1">
                      <i class="bi bi-info-circle me-1"></i>
                      可以在此步骤修改或添加 Portal URL
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">邮箱备注</label>
                    <input
                      type="text"
                      :value="emailNote || '未设置备注'"
                      class="form-control"
                      readonly
                    >
                    <div class="form-hint mt-1">
                      <i class="bi bi-info-circle me-1"></i>
                      如需修改备注，请返回第一步重新设置
                    </div>
                  </div>
                </form>
              </div>
              <div v-else>
                <p class="text-muted">请先完成前面的步骤...</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeGetModal">取消</button>

            <!-- 第一步按钮 -->
            <div v-if="getTokenStep === 1" class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-success"
                @click="generateAuthUrl"
                :disabled="isGeneratingUrl || isGenerateOnCooldown"
              >
                <i
                  :class="['bi', 'me-1',
                    isGeneratingUrl ? 'bi-arrow-clockwise refresh-spin' :
                    isGenerateOnCooldown ? 'bi-clock' : 'bi-link-45deg']"
                ></i>
                {{
                  isGeneratingUrl ? '生成中...' :
                  isGenerateOnCooldown ? `等待 ${remainingCooldownTime}s` :
                  '生成授权URL'
                }}
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="nextStep"
                :disabled="!authUrl"
              >
                <i class="bi bi-arrow-right me-1"></i>
                下一步
              </button>
            </div>

            <!-- 第二步按钮 -->
            <div v-if="getTokenStep === 2" class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-secondary"
                @click="prevStep"
              >
                <i class="bi bi-arrow-left me-1"></i>
                上一步
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="validateAndNextStep"
                :disabled="!authResponse || !!authResponseError || isValidatingResponse"
              >
                <i
                  :class="['bi', 'me-1',
                    isValidatingResponse ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-right']"
                ></i>
                {{ isValidatingResponse ? '验证中...' : '下一步' }}
              </button>
            </div>

            <!-- 第三步按钮 -->
            <div v-if="getTokenStep === 3" class="d-flex gap-2">
              <button
                type="button"
                class="btn btn-secondary"
                @click="prevStep"
              >
                <i class="bi bi-arrow-left me-1"></i>
                上一步
              </button>
              <button
                v-if="tokenData.tenant_url"
                type="button"
                class="btn btn-success"
                @click="saveToken"
                :disabled="isSavingToken"
              >
                <i
                  :class="['bi', 'me-1',
                    isSavingToken ? 'bi-arrow-clockwise refresh-spin' : 'bi-floppy']"
                ></i>
                {{ isSavingToken ? '保存中...' : '保存Token' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 编辑 Token 模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showEditModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑 Token</h5>
            <button type="button" class="btn-close" @click="closeEditModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateToken">
              <div class="mb-3">
                <label class="form-label">Tenant URL</label>
                <input
                  type="url"
                  v-model="editingToken.tenant_url"
                  class="form-control"
                  placeholder="请输入 Tenant URL"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Access Token</label>
                <textarea
                  v-model="editingToken.access_token"
                  class="form-control"
                  placeholder="请输入 Access Token"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Portal URL（可选）</label>
                <input
                  type="url"
                  v-model="editingToken.portal_url"
                  class="form-control"
                  placeholder="请输入 Portal URL（可选）"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">邮箱备注（可选）</label>
                <input
                  type="text"
                  v-model="editingToken.email_note"
                  class="form-control"
                  placeholder="请输入邮箱或备注信息（可选）"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">随机切号</label>
                <div class="form-check form-switch">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="allowNormalCardToken"
                    v-model="editingToken.allow_normal_cards"
                  >
                  <label class="form-check-label" for="allowNormalCardToken">
                    开启后允许进入随机切号列表
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
            <button type="button" class="btn btn-primary" @click="updateToken">
              <i class="bi bi-check-lg me-1"></i>
              保存
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
            <p>确定要删除这个 Token 吗？</p>
            <div class="text-muted small">
              <strong>邮箱备注：</strong>{{ deletingToken?.email_note }}<br>
              <strong>创建时间：</strong>{{ deletingToken?.created_at }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeDeleteModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              <i class="bi bi-trash-fill me-1"></i>
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- Token验证确认模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showValidateConfirmModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认验证</h5>
            <button type="button" class="btn-close" @click="closeValidateModal"></button>
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
                  <h4 class="alert-title">验证 Token 状态可能会导致 Token 失效！</h4>
                  <div class="text-muted">请谨慎操作！</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>邮箱备注：</strong>{{ validatingToken?.email_note }}<br>
              <strong>Tenant URL：</strong>{{ validatingToken?.tenant_url }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeValidateModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-warning"
              @click="confirmValidateToken"
            >
              <i class="bi bi-check-circle me-1"></i>
              确认验证
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 批量验证确认模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showBatchValidateModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认批量验证</h5>
            <button type="button" class="btn-close" @click="closeBatchValidateModal"></button>
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
                  <h4 class="alert-title">验证 Token 状态可能会导致 Token 失效！</h4>
                  <div class="text-muted">使用单线程验证所有 Token 请谨慎操作！</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>将要验证：</strong>{{
                isBatchSelectMode && selectedItems.size > 0
                  ? `${tokens.filter(token => selectedItems.has(token.id)).length} 个选中的Token`
                  : `${tokens.length} 个Token`
              }}<br>
              <strong>验证方式：</strong>采用单线程验证方式.
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeBatchValidateModal" :disabled="isBatchValidating">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              type="button"
              class="btn btn-warning"
              @click="confirmBatchValidate"
              :disabled="isBatchValidating"
            >
              <i class="bi bi-check-circle me-1"></i>
              确认验证
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 批量刷新确认模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showBatchRefreshModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">批量刷新</h5>
            <button type="button" class="btn-close" @click="closeBatchRefreshModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info" role="alert">
              <div class="d-flex">
                <div>
                  <i class="bi bi-info-circle alert-icon" style="font-size: 24px;"></i>
                </div>
                <div>
                  <h4 class="alert-title">即将受控并发刷新账户的详细信息！</h4>
                  <div class="text-muted">使用多线程并发请求获取最新余额信息</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>将要刷新：</strong>{{
                isBatchSelectMode && selectedItems.size > 0
                  ? `${tokens.filter(token => selectedItems.has(token.id)).length} 个选中的Token`
                  : `${tokens.length} 个Token`
              }}<br>
              <strong>刷新方式：</strong>采用多线程刷新.
            </div>




          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeBatchRefreshModal" :disabled="isBatchRefreshing">
              <i class="bi bi-x-lg me-1"></i>
              {{ isBatchRefreshing ? '刷新中...' : '取消' }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="confirmBatchRefresh"
              :disabled="isBatchRefreshing"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              确认刷新
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- 添加 Token 模态框 -->
    <Transition name="modal-animate" appear>
    <div v-if="showAddModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">添加 Token</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body">
            <!-- 标签卡导航 -->
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: addTokenTab === 'single' }"
                  @click="addTokenTab = 'single'"
                  type="button"
                >
                  单个添加
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link"
                  :class="{ active: addTokenTab === 'batch' }"
                  @click="addTokenTab = 'batch'"
                  type="button"
                >
                  批量导入
                </button>
              </li>
            </ul>

            <!-- 单个添加标签页 -->
            <div v-if="addTokenTab === 'single'">
              <form @submit.prevent="addSingleToken">
                <div class="mb-3">
                  <label class="form-label">Tenant URL</label>
                  <input
                    type="url"
                    v-model="singleToken.tenant_url"
                    class="form-control"
                    placeholder="请输入 Tenant URL"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Access Token</label>
                  <textarea
                    v-model="singleToken.access_token"
                    class="form-control"
                    placeholder="请输入 Access Token"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Portal URL（可选）</label>
                  <input
                    type="url"
                    v-model="singleToken.portal_url"
                    class="form-control"
                    placeholder="请输入 Portal URL（可选）"
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">邮箱备注（可选）</label>
                  <input
                    type="text"
                    v-model="singleToken.email_note"
                    class="form-control"
                    placeholder="请输入邮箱或备注信息（可选）"
                  >
                </div>
              </form>
            </div>

            <!-- 批量导入标签页 -->
            <div v-if="addTokenTab === 'batch'">
              <!-- 导入方式选择 -->
              <div class="mb-3">
                <label class="form-label">导入方式</label>
                <div class="form-selectgroup">
                  <label class="form-selectgroup-item">
                    <input
                      type="radio"
                      name="importType"
                      value="csv"
                      v-model="batchImport.type"
                      class="form-selectgroup-input"
                    >
                    <span class="form-selectgroup-label">CSV文件导入</span>
                  </label>
                  <label class="form-selectgroup-item">
                    <input
                      type="radio"
                      name="importType"
                      value="json"
                      v-model="batchImport.type"
                      class="form-selectgroup-input"
                    >
                    <span class="form-selectgroup-label">JSON文本导入</span>
                  </label>
                </div>
              </div>

              <!-- CSV文件导入 -->
              <div v-if="batchImport.type === 'csv'">
                <div class="mb-3">
                  <label class="form-label">CSV文件</label>
                  <div
                    class="dropzone"
                    :class="{ 'dropzone-dragover': isDragOver }"
                    @drop="handleFileDrop"
                    @dragover.prevent="isDragOver = true"
                    @dragleave="isDragOver = false"
                    @click="csvFileInput?.click()"
                  >
                    <div class="dropzone-content">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-lg text-muted mb-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"/>
                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/>
                        <path d="M9 9l1 0"/>
                        <path d="M9 13l6 0"/>
                        <path d="M9 17l6 0"/>
                      </svg>
                      <div v-if="!batchImport.csvFile">
                        <p class="mb-1">点击选择文件或拖拽文件到此处</p>
                        <p class="text-muted small">支持 .csv 格式文件</p>
                      </div>
                      <div v-else>
                        <p class="mb-1 text-success">{{ batchImport.csvFile.name }}</p>
                        <p class="text-muted small">{{ formatFileSize(batchImport.csvFile.size) }}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    ref="csvFileInput"
                    type="file"
                    accept=".csv"
                    @change="handleFileSelect"
                    style="display: none;"
                  >
                </div>
              </div>

              <!-- JSON文本导入 -->
              <div v-if="batchImport.type === 'json'">
                <div class="mb-3">
                  <label class="form-label">JSON 数据</label>
                  <textarea
                    v-model="batchImport.jsonData"
                    class="form-control"
                    placeholder="{
    &quot;tenant_url&quot;: &quot;https://example.api.augmentcode.com/&quot;,
    &quot;access_token&quot;: &quot;random_string&quot;,
    &quot;portal_url&quot;: &quot;https://portal.withorb.com/view?token=another_token_here&quot;
    &quot;email_note&quot;: &quot;your_email@example.com&quot;
}"
                    rows="8"
                  ></textarea>
                  <div class="form-hint">
                    <br><strong>必填字段：</strong>tenant_url、access_token
                    <br><strong>可选字段：</strong>portal_url、email_note
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeAddModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button
              v-if="addTokenTab === 'single'"
              type="button"
              class="btn btn-primary"
              @click="addSingleToken"
            >
              <i class="bi bi-plus-lg me-1"></i>
              添加
            </button>
            <button
              v-if="addTokenTab === 'batch'"
              type="button"
              class="btn btn-primary"
              @click="importBatchTokens"
              :disabled="!canImport"
            >
              <i class="bi bi-upload me-1"></i>
              导入
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>

  <!-- 执行Token模态框 -->
  <Transition name="modal-animate" appear>
  <div v-if="showExecuteModal" class="modal modal-blur fade show" style="display: block;" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-play-circle me-2"></i>
            选择应用程序
          </h5>
          <button type="button" class="btn-close" @click="showExecuteModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <div class="text-muted small">
              Token: {{ currentExecuteToken?.email_note || '未命名Token' }}
            </div>
          </div>

          <div class="row g-3">
            <div
              v-for="app in applications"
              :key="app.name"
              class="col-6 col-md-4"
            >
              <div
                class="card card-link cursor-pointer app-card"
                :class="{ 'disabled': isExecuting }"
                @click="executeApplication(app)"
              >
                <div class="card-body text-center p-3">
                  <div class="app-icon mb-2">
                    <div v-if="isExecuting" class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <img
                      v-else
                      :src="getIconUrl(app.icon)"
                      :alt="app.name"
                      class="app-icon-img"
                    >
                  </div>
                  <div class="app-name">{{ app.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showExecuteModal = false">
            <i class="bi bi-x-lg me-1"></i>
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>

  <!-- 导出数据模态框 -->
  <ExportModal
    :show="showExportModal"
    :selected-count="selectedCount"
    :export-data="exportData"
    @close="closeExportModal"
  />

  <!-- 右下角悬浮进度窗口 -->
  <div
    v-if="showFloatingProgress"
    class="floating-progress-window"
    :class="{ 'show': showFloatingProgress }"
  >
    <div class="progress-header">
      <div class="d-flex align-items-center">
        <div class="spinner-border spinner-border-sm me-2" role="status" v-if="isBatchRefreshing || isBatchValidating">
          <span class="visually-hidden">Loading...</span>
        </div>
        <strong>{{ progressTitle }}</strong>
        <button
          type="button"
          class="btn-close ms-auto"
          @click="hideFloatingProgress"
          v-if="!isBatchRefreshing && !isBatchValidating"
        ></button>
      </div>
    </div>

    <div class="progress-body">
      <!-- 进度条 -->
      <div class="progress mb-2">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          :style="{ width: progressPercentage + '%' }"
        >
          {{ progressText }}
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { toast } from '../utils/toast'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import ExportModal from '../components/ExportModal.vue'
import { useBatchSelect } from '../composables/useBatchSelect'
import { PermissionManager } from '../types/permissions'

// 权限检查
const hasPermission = computed(() => PermissionManager.hasTokenManagement())

// 批量选择功能
const {
  isBatchSelectMode,
  selectedItems,
  showExportModal,
  exportData,
  isAllSelected,
  isPartialSelected,
  selectedCount,
  toggleBatchSelectMode,
  toggleSelectItem,
  selectAll,
  deselectAll,
  toggleSelectAll,
  exportSelected,
  closeExportModal
} = useBatchSelect(() => tokens.value)



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

interface PortalInfo {
  is_active: boolean
  expiry_date: string
  credits_balance: number
  tenant_url?: string
  portal_url?: string
}

interface TokenResponse {
  data: Token[]
  pagination: {
    has_next: boolean
    has_prev: boolean
    limit: number
    page: number
    total: number
    total_pages: number
  }
  success: boolean
}

interface NewToken {
  email: string
  token: string
}

interface SingleToken {
  id?: number
  tenant_url: string
  access_token: string
  portal_url: string
  email_note: string
}

interface BatchImport {
  type: 'csv' | 'json'
  csvFile: File | null
  jsonData: string
}

interface TokenSnapshot {
  credits: number | null
}

// 响应式数据
const allTokens = ref<Token[]>([]) // 存储所有Token数据
const tokens = ref<Token[]>([]) // 当前页显示的Token数据
const pagination = ref({
  has_next: false,
  has_prev: false,
  limit: 12,
  page: 1,
  total: 0,
  total_pages: 0
})
const isLoading = ref(false)
const showGetModal = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)

// 排序模式 - 从本地存储读取，默认为'default'（不排序）
const sortMode = ref<'default' | 'credits-desc' | 'credits-asc' | 'days-desc' | 'days-asc'>(
  (localStorage.getItem('token-manager-sort-mode') as 'default' | 'credits-desc' | 'credits-asc' | 'days-desc' | 'days-asc') || 'default'
)

// 排序下拉菜单状态
const isSortDropdownOpen = ref(false)
const sortDropdownRef = ref<HTMLElement>()
const showDeleteModal = ref(false)
const showValidateConfirmModal = ref(false)
const validatingToken = ref<Token | null>(null)
const isValidating = ref(false)
const refreshingToken = ref<Token | null>(null)
const isRefreshing = ref(false)



// 执行模态框状态
const showExecuteModal = ref(false)
const currentExecuteToken = ref<Token | null>(null)
const isExecuting = ref(false)
const showBatchValidateModal = ref(false)
const isBatchValidating = ref(false)
const batchValidateResults = ref({
  valid: 0,
  invalid: 0,
  failed: 0,
  total: 0,
  completed: 0  // 已完成的Token数量
})

// 批量刷新模态框状态
const showBatchRefreshModal = ref(false)
const isBatchRefreshing = ref(false)
const batchRefreshResults = ref({
  success: 0,
  failed: 0,
  total: 0,
  completed: 0  // 已完成的Token数量
})
const isGeneratingUrl = ref(false)
const lastGenerateTime = ref(0)
const generateCooldown = 10000 // 10秒冷却时间
const currentTime = ref(Date.now()) // 当前时间，用于触发响应式更新

// 数据变化检测（用于高亮显示）
const tokensWithChanges = ref<Set<string>>(new Set())
const previousTokenData = ref<Map<string, TokenSnapshot>>(new Map())

// 悬浮进度窗口
const showFloatingProgress = ref(false)



// 悬浮进度窗口计算属性
const progressTitle = computed(() => {
  if (isBatchRefreshing.value) return '批量刷新进行中'
  if (isBatchValidating.value) return '批量验证进行中'
  return '操作完成'
})

// 防抖刷新函数
let refreshDebounceTimer: number | null = null
const debouncedRefresh = (options: { highlightChanges?: boolean } = {}) => {
  if (refreshDebounceTimer) {
    clearTimeout(refreshDebounceTimer)
  }
  refreshDebounceTimer = setTimeout(() => {
    refreshTokens(options)
  }, 1000) // 1秒防抖
}

const progressPercentage = computed(() => {
  if (isBatchRefreshing.value) {
    return batchRefreshResults.value.total > 0
      ? (batchRefreshResults.value.completed / batchRefreshResults.value.total * 100)
      : 0
  }
  if (isBatchValidating.value) {
    return batchValidateResults.value.total > 0
      ? (batchValidateResults.value.completed / batchValidateResults.value.total * 100)
      : 0
  }
  return 100
})

const progressText = computed(() => {
  if (isBatchRefreshing.value) {
    return `${batchRefreshResults.value.completed} / ${batchRefreshResults.value.total}`
  }
  if (isBatchValidating.value) {
    return `${batchValidateResults.value.completed} / ${batchValidateResults.value.total}`
  }
  return '完成'
})



// 隐藏悬浮进度窗口
const hideFloatingProgress = () => {
  showFloatingProgress.value = false
}



// 计算即将到期的Token（时间<=1天且次数>45次）
const getExpiringTokens = () => {
  return tokens.value.filter(token => {
    try {
      // 检查Token状态是否正常
      if (token.ban_status === '"ACTIVE"' || token.ban_status === '"SUSPENDED"') return false

      // 解析portal_info获取到期时间
      const portalInfo = parsePortalInfo(token.portal_info)
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
      return diffHours <= 24 && creditsNum > 45
    } catch (error) {
      return false
    }
  }).map(token => ({
    id: token.id,
    email_note: token.email_note,
    remaining_time: formatRemainingTime(token),
    remaining_credits: getRemainingCredits(token)
  }))
}

// 通过事件总线通知NavigationBar更新到期Token数据
const updateExpiringTokens = () => {
  const expiringTokens = getExpiringTokens()
  const event = new CustomEvent('update-expiring-tokens', {
    detail: expiringTokens
  })
  window.dispatchEvent(event)
}

const createTokenSnapshot = (token: Token): TokenSnapshot => {
  const portalInfo = parsePortalInfo(token.portal_info)
  if (!portalInfo || typeof portalInfo.credits_balance !== 'number') {
    return { credits: null }
  }

  return { credits: portalInfo.credits_balance }
}

// 更新Token数据快照并根据需要标记变化
const updateTokenSnapshots = (newTokens: Token[], highlightChanges: boolean) => {
  const nextSnapshots = new Map<string, TokenSnapshot>()
  const changedTokenIds: string[] = []

  newTokens.forEach(token => {
    const snapshot = createTokenSnapshot(token)
    const previousSnapshot = previousTokenData.value.get(token.id)

    if (highlightChanges && previousSnapshot && previousSnapshot.credits !== snapshot.credits) {
      changedTokenIds.push(token.id)
    }

    nextSnapshots.set(token.id, snapshot)
  })

  previousTokenData.value = nextSnapshots

  if (highlightChanges) {
    tokensWithChanges.value = new Set(changedTokenIds)
  } else if (tokensWithChanges.value.size) {
    tokensWithChanges.value = new Set()
  }
}

// 计算生成按钮是否在冷却中
const isGenerateOnCooldown = computed(() => {
  if (lastGenerateTime.value === 0) return false
  return currentTime.value - lastGenerateTime.value < generateCooldown
})

// 计算剩余冷却时间
const remainingCooldownTime = computed(() => {
  if (!isGenerateOnCooldown.value) return 0
  return Math.ceil((generateCooldown - (currentTime.value - lastGenerateTime.value)) / 1000)
})

// 定时器更新当前时间
let cooldownTimer: number | null = null

const startCooldownTimer = () => {
  if (cooldownTimer) clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    currentTime.value = Date.now()
    // 如果冷却结束，清除定时器
    if (!isGenerateOnCooldown.value) {
      if (cooldownTimer) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }
  }, 1000)
}

const stopCooldownTimer = () => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
  }
}
const authResponseError = ref('')
const isValidatingResponse = ref(false)
const tokenData = ref({
  tenant_url: '',
  access_token: '',
  email: '',
  portal_url: ''
})
const emailNote = ref('')
const isSavingToken = ref(false)
const newToken = ref<NewToken>({
  email: '',
  token: ''
})
const editingToken = ref<{
  id?: string
  tenant_url: string
  access_token: string
  portal_url: string
  email_note: string
  allow_normal_cards: boolean
}>({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: '',
  allow_normal_cards: true
})
const deletingToken = ref<Token | null>(null)





// 获取Token流程相关数据
const getTokenStep = ref(1)
const authUrl = ref('')
const authResponse = ref('')
const portalUrl = ref('')
const obtainedToken = ref('')

// 倒计时相关数据
const urlCountdown = ref(0) // 剩余秒数
const countdownTimer = ref<number | null>(null)

// 倒计时格式化显示
const countdownDisplay = computed(() => {
  if (urlCountdown.value <= 0) return ''

  const minutes = Math.floor(urlCountdown.value / 60)
  const seconds = urlCountdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// 启动倒计时
const startCountdown = () => {
  // 清除现有计时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }

  // 设置5分钟倒计时
  urlCountdown.value = 300 // 5分钟 = 300秒

  countdownTimer.value = setInterval(() => {
    urlCountdown.value--

    if (urlCountdown.value <= 0) {
      clearInterval(countdownTimer.value!)
      countdownTimer.value = null
      toast.warning('授权URL已过期，请重新生成')
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  urlCountdown.value = 0
}
const isGettingToken = ref(false)
const codeChallenge = ref('')
const codeVerifier = ref('')
const state = ref('')

// 添加Token相关数据
const addTokenTab = ref<'single' | 'batch'>('single')
const singleToken = ref({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: ''
})
const batchImport = ref<BatchImport>({
  type: 'csv',
  csvFile: null,
  jsonData: ''
})
const isDragOver = ref(false)
const csvFileInput = ref<HTMLInputElement | null>(null)


// 计算属性
const canImport = computed(() => {
  if (batchImport.value.type === 'csv') {
    return batchImport.value.csvFile !== null
  } else {
    return batchImport.value.jsonData.trim() !== ''
  }
})





// 监听排序模式变化，保存到本地存储
watch(sortMode, (newMode) => {
  localStorage.setItem('token-manager-sort-mode', newMode)
  // 排序模式变化时重新分页
  if (allTokens.value.length > 0) {
    updatePagination(pagination.value.page)
  }
}, { immediate: false })

// 排序下拉菜单控制
const toggleSortDropdown = () => {
  isSortDropdownOpen.value = !isSortDropdownOpen.value
}

const closeSortDropdown = () => {
  isSortDropdownOpen.value = false
}

const setSortMode = (mode: 'default' | 'credits-desc' | 'credits-asc' | 'days-desc' | 'days-asc') => {
  sortMode.value = mode
  closeSortDropdown()
}

// 获取排序模式的显示文本
const getSortModeText = () => {
  switch (sortMode.value) {
    case 'default': return '默认'
    case 'credits-desc': return '次数↓'
    case 'credits-asc': return '次数↑'
    case 'days-desc': return '天数↓'
    case 'days-asc': return '天数↑'
    default: return '默认'
  }
}

// 获取排序模式的标题提示
const getSortModeTitle = () => {
  switch (sortMode.value) {
    case 'default': return '默认排序'
    case 'credits-desc': return '按剩余次数排序 ↓'
    case 'credits-asc': return '按剩余次数排序 ↑'
    case 'days-desc': return '按剩余天数排序 ↓'
    case 'days-asc': return '按剩余天数排序 ↑'
    default: return '默认排序'
  }
}

// 排序后的tokens
const sortedTokens = computed(() => {
  if (sortMode.value === 'default') {
    return allTokens.value
  }

  return [...allTokens.value].sort((a, b) => {
    if (sortMode.value.startsWith('credits')) {
      // 按剩余次数排序
      const creditsA = getRemainingCredits(a)
      const creditsB = getRemainingCredits(b)
      const numA = creditsA === '-' ? -1 : parseInt(creditsA) || 0
      const numB = creditsB === '-' ? -1 : parseInt(creditsB) || 0
      return sortMode.value === 'credits-desc' ? numB - numA : numA - numB
    } else if (sortMode.value.startsWith('days')) {
      // 按剩余天数排序
      const timeInfoA = calculateRemainingTime(a)
      const timeInfoB = calculateRemainingTime(b)
      return sortMode.value === 'days-desc' ? timeInfoB.totalDays - timeInfoA.totalDays : timeInfoA.totalDays - timeInfoB.totalDays
    }
    return 0
  })
})

// 处理点击外部区域关闭下拉菜单
const handleClickOutside = (event: Event) => {
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
    isSortDropdownOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  loadTokens()
  // 添加点击外部关闭下拉菜单的事件监听器
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopCooldownTimer()
  stopCountdown()  // 清理URL倒计时

  // 清理防抖定时器
  if (refreshDebounceTimer) {
    clearTimeout(refreshDebounceTimer)
  }

  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})

// 方法
const loadTokens = async (page: number = 1, options: { highlightChanges?: boolean } = {}) => {
  const highlightChanges = options.highlightChanges === true

  // 如果已经有数据，只需要更新分页显示
  if (allTokens.value.length > 0 && !highlightChanges) {
    updatePagination(page)
    return
  }

  isLoading.value = true
  try {
    // 一次性加载所有数据
    const data = await apiGet<Token[]>(`/api/tokens?limit=10000`)

    if (data.success) {
      const fetchedTokens = data.data || [] // 当data为null时，使用空数组
      allTokens.value = fetchedTokens
      updateTokenSnapshots(fetchedTokens, highlightChanges)
      updatePagination(page)
      // 更新到期Token通知
      updateExpiringTokens()
    } else {
      toast.error(data.error || '获取Token列表失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isLoading.value = false
  }
}

// 更新前端分页显示
const updatePagination = (page: number) => {
  const total = sortedTokens.value.length
  const limit = pagination.value.limit
  const totalPages = Math.ceil(total / limit) || 1

  // 确保页码在有效范围内
  const currentPage = Math.max(1, Math.min(page, totalPages))

  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * limit
  const endIndex = Math.min(startIndex + limit, total)

  // 更新显示的Token数据
  tokens.value = sortedTokens.value.slice(startIndex, endIndex)

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



// 刷新数据（重新从服务器加载）
const refreshTokens = async (options: { highlightChanges?: boolean } = {}) => {
  allTokens.value = [] // 清空缓存
  await loadTokens(1, options) // 重新加载第一页

  // 发送数据更新事件，通知其他组件
  const event = new CustomEvent('tokens-data-updated', {
    detail: {
      tokens: allTokens.value,
      timestamp: new Date(),
      source: 'TokenManagerView'
    }
  })
  window.dispatchEvent(event)
}

// 辅助函数
const parsePortalInfo = (portalInfoStr: string): PortalInfo | null => {
  try {
    return JSON.parse(portalInfoStr)
  } catch {
    return null
  }
}

// 计算剩余天数和小时数
const calculateRemainingTime = (token: Token): { days: number, hours: number, totalDays: number } => {
  const portalInfo = parsePortalInfo(token.portal_info)
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

const calculateDaysUntilExpiry = (expiryDate: string): number => {
  if (!expiryDate) return 0

  const expiry = new Date(expiryDate)
  if (isNaN(expiry.getTime())) return 0

  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const getRemainingDays = (token: Token): string => {
  const portalInfo = parsePortalInfo(token.portal_info)
  if (!portalInfo || !portalInfo.expiry_date) return '-'
  const days = calculateDaysUntilExpiry(portalInfo.expiry_date)
  return isNaN(days) ? '-' : days.toString()
}

const getRemainingCredits = (token: Token): string => {
  const portalInfo = parsePortalInfo(token.portal_info)
  if (!portalInfo || portalInfo.credits_balance === undefined) return '-'
  return portalInfo.credits_balance.toString()
}

const getTokenStatus = (token: Token): '正常' | '失效' | '未验证' | '耗尽' | '暂停' => {
  // 检查是否为空数据（未验证状态）
  if ((!token.portal_info || token.portal_info === '{}') &&
      (!token.ban_status || token.ban_status === '{}')) {
    return '未验证'
  }

  // 检查剩余次数是否为0（耗尽状态）
  const portalInfo = parsePortalInfo(token.portal_info)
  if (portalInfo && portalInfo.credits_balance === 0) {
    return '耗尽'
  }

  // 主要根据ban_status字段判断状态
  if (token.ban_status) {
    // ban_status为"{}"表示正常
    if (token.ban_status === '{}') {
      return '正常'
    }
    // ban_status为"ACTIVE"表示失效
    if (token.ban_status === '"ACTIVE"') {
      return '失效'
    }
    // ban_status为"SUSPENDED"表示暂停
    if (token.ban_status === '"SUSPENDED"') {
      return '暂停'
    }
  }

  // 如果ban_status不明确，则根据portal_info判断
  if (!portalInfo) return '失效'

  const daysLeft = calculateDaysUntilExpiry(portalInfo.expiry_date)
  return portalInfo.is_active && daysLeft > 0 ? '正常' : '失效'
}

// 获取剩余时间的配色类
const getDaysColorClass = (token: Token): string => {
  const timeInfo = calculateRemainingTime(token)
  if (timeInfo.totalDays === 0) return 'text-muted'

  if (timeInfo.totalDays > 5) return 'text-success'
  if (timeInfo.totalDays > 2) return 'text-warning'
  return 'text-danger'
}

// 获取剩余次数的配色类
const getCreditsColorClass = (token: Token): string => {
  const credits = getRemainingCredits(token)
  if (credits === '-') return 'text-muted'

  const creditsNum = parseInt(credits)
  if (isNaN(creditsNum)) return 'text-muted'

  if (creditsNum > 30) return 'text-success'
  if (creditsNum >= 10) return 'text-warning'
  return 'text-danger' // 小于10次
}

const getTokenStatusClass = (token: Token): string => {
  const status = getTokenStatus(token)
  switch (status) {
    case '正常':
      return 'bg-success text-white'
    case '失效':
      return 'bg-danger text-white'
    case '未验证':
      return 'bg-secondary text-white'
    case '耗尽':
      return 'bg-warning text-white'
    case '暂停':
      return 'bg-danger text-white'
    default:
      return 'bg-secondary text-white'
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

// 注意：随机字符串生成已移至后端API

// 验证授权响应并进入下一步
const validateAndNextStep = async () => {
  if (!authResponse.value || authResponseError.value) {
    return
  }

  isValidatingResponse.value = true

  try {
    const authResponseData = JSON.parse(authResponse.value)

    const payload = {
      auth_response: authResponseData,
      oauth_state: {
        auth_url: authUrl.value,
        code_challenge: codeChallenge.value,
        code_verifier: codeVerifier.value,
        creation_time: Date.now(),
        state: state.value
      }
    }

    const data = await apiPost('/api/auth/validate-response', payload)

    if (data.success && data.data?.access_token) {
      // 保存Token数据，使用用户填入的portal_url
      tokenData.value = {
        tenant_url: data.data.tenant_url || '',
        access_token: data.data.access_token || '',
        email: data.data.email || '',
        portal_url: portalUrl.value || data.data.portal_url || ''
      }

      // 进入第三步
      getTokenStep.value = 3
      toast.success(data.message || '授权验证成功')
    } else {
      toast.error(data.error || '授权验证失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isValidatingResponse.value = false
  }
}

// 保存Token
const saveToken = async () => {
  if (!tokenData.value.tenant_url || !tokenData.value.access_token) {
    toast.error('Token数据不完整')
    return
  }

  isSavingToken.value = true

  try {
    const payload = {
      tenant_url: tokenData.value.tenant_url,
      access_token: tokenData.value.access_token,
      email: tokenData.value.email,
      portal_url: tokenData.value.portal_url,
      email_note: emailNote.value
    }

    const data = await apiPost('/api/auth/save-token', payload)

    if (data.success) {
      toast.success(data.message || 'Token保存成功')

      // 关闭模态框并刷新Token列表
      showGetModal.value = false
      await refreshTokens()
    } else {
      toast.error(data.error || 'Token保存失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isSavingToken.value = false
  }
}

// 授权响应校验
const validateAuthResponse = () => {
  authResponseError.value = ''

  if (!authResponse.value.trim()) {
    return
  }

  try {
    const parsed = JSON.parse(authResponse.value)

    // 检查必需的字段
    const requiredFields = ['code', 'state', 'tenant_url']
    const missingFields = requiredFields.filter(field => !parsed[field])

    if (missingFields.length > 0) {
      authResponseError.value = `缺少必需字段: ${missingFields.join(', ')}`
      return
    }

    // 检查tenant_url格式
    if (parsed.tenant_url && !parsed.tenant_url.match(/^https?:\/\/.+/)) {
      authResponseError.value = 'tenant_url 必须是有效的HTTP/HTTPS URL'
      return
    }

    // 校验通过
    authResponseError.value = ''
  } catch (error) {
    authResponseError.value = '无效的JSON格式'
  }
}

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const validateAllTokens = () => {
  // 如果开启了批量选择模式且有选中项，则只验证选中的Token
  const tokensToValidate = isBatchSelectMode.value && selectedItems.value.size > 0
    ? tokens.value.filter(token => selectedItems.value.has(token.id))
    : tokens.value

  if (tokensToValidate.length === 0) {
    const message = isBatchSelectMode.value && selectedItems.value.size === 0
      ? '请选择要验证的Token'
      : '没有Token需要验证'
    toast.error(message)
    return
  }

  // 重置验证结果
  batchValidateResults.value = {
    valid: 0,
    invalid: 0,
    failed: 0,
    total: tokensToValidate.length,
    completed: 0
  }

  showBatchValidateModal.value = true
}

// 显示批量刷新确认模态框
const showBatchRefreshConfirm = () => {
  // 如果开启了批量选择模式且有选中项，则只刷新选中的Token
  const tokensToRefresh = isBatchSelectMode.value && selectedItems.value.size > 0
    ? tokens.value.filter(token => selectedItems.value.has(token.id))
    : tokens.value

  if (tokensToRefresh.length === 0) {
    const message = isBatchSelectMode.value && selectedItems.value.size === 0
      ? '请选择要刷新的Token'
      : '没有Token需要刷新'
    toast.error(message)
    return
  }

  // 重置刷新结果
  batchRefreshResults.value = {
    success: 0,
    failed: 0,
    total: tokensToRefresh.length,
    completed: 0
  }

  showBatchRefreshModal.value = true
}



const showGetTokenModal = () => {
  // 重置获取Token流程数据
  getTokenStep.value = 1
  authUrl.value = ''
  authResponse.value = ''
  portalUrl.value = ''
  obtainedToken.value = ''
  isGettingToken.value = false
  codeChallenge.value = ''
  codeVerifier.value = ''
  state.value = ''
  authResponseError.value = ''
  isValidatingResponse.value = false
  tokenData.value = {
    tenant_url: '',
    access_token: '',
    email: '',
    portal_url: ''
  }
  emailNote.value = ''
  isSavingToken.value = false
  lastGenerateTime.value = 0  // 重置冷却时间
  currentTime.value = Date.now()
  stopCooldownTimer()  // 停止定时器
  stopCountdown()  // 停止URL倒计时
  showGetModal.value = true
}

const closeGetModal = () => {
  stopCountdown()  // 停止URL倒计时

  // 重置所有获取Token相关的状态
  getTokenStep.value = 1
  authUrl.value = ''
  authResponse.value = ''
  authResponseError.value = ''
  portalUrl.value = ''
  emailNote.value = ''
  isValidatingResponse.value = false
  isSavingToken.value = false
  tokenData.value = {
    tenant_url: '',
    access_token: '',
    email: '',
    portal_url: ''
  }

  showGetModal.value = false
}

const generateAuthUrl = async () => {
  // 检查冷却时间
  if (isGenerateOnCooldown.value) {
    toast.error(`请等待 ${remainingCooldownTime.value} 秒后再试`)
    return
  }

  isGeneratingUrl.value = true

  try {
    const data = await apiGet('/api/auth/generate-url')

    if (data.success && data.data) {
      // 提取授权URL到输入框
      authUrl.value = data.data.auth_url

      // 保存其他参数供后续使用
      codeChallenge.value = data.data.code_challenge
      codeVerifier.value = data.data.code_verifier
      state.value = data.data.state

      // 记录生成时间，开始冷却
      lastGenerateTime.value = Date.now()
      currentTime.value = Date.now()
      startCooldownTimer()

      // 启动5分钟倒计时
      startCountdown()

      toast.success(data.message || '授权URL生成成功')
    } else {
      toast.error(data.error || '授权URL生成失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isGeneratingUrl.value = false
  }
}

const copyAuthUrl = async () => {
  try {
    await navigator.clipboard.writeText(authUrl.value)
  } catch (err) {
  }
}

const openAuthUrl = () => {
  if (authUrl.value) {
    window.open(authUrl.value, '_blank')
  }
}

const nextStep = () => {
  if (getTokenStep.value < 3) {
    getTokenStep.value++
  }
}

const prevStep = () => {
  if (getTokenStep.value > 1) {
    getTokenStep.value--
  }
}



const copyToken = async () => {
  try {
    await navigator.clipboard.writeText(obtainedToken.value)
  } catch (err) {
  }
}

const completeGetToken = () => {
  closeGetModal()
}

const showAddTokenModal = () => {
  // 重置添加Token数据
  addTokenTab.value = 'single'
  singleToken.value = {
    tenant_url: '',
    access_token: '',
    portal_url: '',
    email_note: ''
  }
  batchImport.value = {
    type: 'csv',
    csvFile: null,
    jsonData: ''
  }
  isDragOver.value = false
  newToken.value = { email: '', token: '' }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  // 重置表单
  singleToken.value = {
    tenant_url: '',
    access_token: '',
    portal_url: '',
    email_note: ''
  }
  addTokenTab.value = 'single'
}

const addSingleToken = async () => {
  if (!singleToken.value.tenant_url || !singleToken.value.access_token) {
    toast.error('Tenant URL 和 Access Token 不能为空')
    return
  }

  try {
    const response = await fetch('/api/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_url: singleToken.value.tenant_url,
        access_token: singleToken.value.access_token,
        portal_url: singleToken.value.portal_url,
        email_note: singleToken.value.email_note
      })
    })

    const data = await response.json()

    if (data.success) {
      // 添加到本地列表顶部
      tokens.value.unshift(data.data)

      // 重置表单
      singleToken.value = {
        tenant_url: '',
        access_token: '',
        portal_url: '',
        email_note: ''
      }

      toast.success(data.message || 'Token 添加成功')
      closeAddModal()

      // 刷新数据
      await refreshTokens()
    } else {
      toast.error(data.error || data.message || 'Token 添加失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  }
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    batchImport.value.csvFile = target.files[0]
  }
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      batchImport.value.csvFile = file
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 验证URL格式
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 验证Token数据格式
const validateTokenData = (tokenData: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!tokenData.tenant_url) {
    errors.push('tenant_url字段必须存在')
  } else if (!isValidUrl(tokenData.tenant_url)) {
    errors.push('tenant_url必须是有效的URL格式')
  }

  if (!tokenData.access_token) {
    errors.push('access_token字段必须存在')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

const importBatchTokens = async () => {
  if (batchImport.value.type === 'csv' && batchImport.value.csvFile) {
    toast.info('CSV导入功能暂未实现')
    return
  } else if (batchImport.value.type === 'json' && batchImport.value.jsonData) {
    try {
      // 解析JSON数据
      const parsedData = JSON.parse(batchImport.value.jsonData)

      // 兼容单条对象和数组格式
      let jsonTokens: any[]
      if (Array.isArray(parsedData)) {
        jsonTokens = parsedData
      } else if (typeof parsedData === 'object' && parsedData !== null) {
        jsonTokens = [parsedData]
      } else {
        toast.error('JSON数据必须是对象或对象数组格式')
        return
      }

      if (jsonTokens.length === 0) {
        toast.error('数据不能为空')
        return
      }

      // 验证每个Token数据
      const validationErrors: string[] = []
      const validTokens: any[] = []

      jsonTokens.forEach((tokenData, index) => {
        const validation = validateTokenData(tokenData)
        if (validation.valid) {
          validTokens.push({
            tenant_url: tokenData.tenant_url,
            access_token: tokenData.access_token,
            portal_url: tokenData.portal_url || '',
            email_note: tokenData.email_note || ''
          })
        } else {
          validationErrors.push(`第${index + 1}条数据: ${validation.errors.join(', ')}`)
        }
      })

      if (validationErrors.length > 0) {
        toast.error(`数据验证失败:\n${validationErrors.join('\n')}`)
        return
      }

      // 调用批量导入API
      isLoading.value = true

      const response = await fetch('/api/tokens/batch-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokens: validTokens
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`批量导入完成，成功 ${data.successful} 条，失败 ${data.failed} 条`)
        closeAddModal()
        // 重新加载Token列表
        await refreshTokens()
      } else {
        toast.error(data.message || '批量导入失败')
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('JSON格式错误，请检查数据格式')
      } else {
        toast.error('批量导入失败，请稍后重试')
      }
    } finally {
      isLoading.value = false
    }
  }
}

// 保留原有的addToken方法以兼容
const addToken = () => {
  addSingleToken()
}

// 应用配置
const applications = [
  {
    name: 'VS Code',
    icon: 'vscode.svg',
    protocol: 'vscode'
  },
  {
    name: 'VS Codium',
    icon: 'vscodium.svg',
    protocol: 'vscodium'
  },
  {
    name: 'Cursor',
    icon: 'cursor.svg',
    protocol: 'cursor'
  },
  {
    name: 'Qoder',
    icon: 'qoder.svg',
    protocol: 'qoder'
  },
  {
    name: 'Trae',
    icon: 'trae.svg',
    protocol: 'trae'
  },
  {
    name: 'Kiro',
    icon: 'kiro.svg',
    protocol: 'kiro'
  },
  {
    name: 'CodeBuddy',
    icon: 'codebuddy.svg',
    protocol: 'codebuddy'
  }
]

// 获取图标URL
const getIconUrl = (iconName: string): string => {
  return `/icons/${iconName}`
}

const executeToken = (token: Token) => {
  // 检查Token状态
  const status = getTokenStatus(token)

  if (status === '失效') {
    toast.error('Token已失效，无法执行')
    return
  }

  if (status === '暂停') {
    toast.error('Token已暂停，无法执行')
    return
  }

  if (status === '耗尽') {
    toast.warning('Token次数已耗尽，无法执行')
    return
  }

  // 未验证的Token也允许执行，只是给出提示
  if (status === '未验证') {
    toast.info('Token未验证，但仍可尝试执行')
  }

  currentExecuteToken.value = token
  showExecuteModal.value = true
}

// 执行应用
const executeApplication = async (app: any) => {
  if (!currentExecuteToken.value || isExecuting.value) return

  isExecuting.value = true

  try {
    const token = currentExecuteToken.value

    // 直接从token对象获取必要参数
    const accessToken = token.access_token
    const tenantUrl = token.tenant_url
    const portalUrl = token.portal_url

    // 验证必要参数
    if (!accessToken) {
      toast.error('Token访问令牌缺失，无法执行')
      return
    }

    if (!tenantUrl || !portalUrl) {
      toast.error('Token URL信息缺失，无法执行')
      return
    }

    const executeUrl = `${app.protocol}://augment.vscode-augment/autoAuth?token=${encodeURIComponent(accessToken)}&url=${encodeURIComponent(tenantUrl)}&portal=${encodeURIComponent(portalUrl)}`

    console.log('生成的执行URL:', executeUrl)

    window.open(executeUrl, '_blank')
    toast.success(`正在启动 ${app.name}...`)
    showExecuteModal.value = false
  } catch (error) {
    toast.error(`启动 ${app.name} 失败`)
  } finally {
    isExecuting.value = false
  }
}

const refreshToken = async (token: Token) => {
  // 设置刷新状态
  refreshingToken.value = token
  isRefreshing.value = true

  try {
    const data = await apiPost(`/api/tokens/${token.id}/refresh`)

    if (data.success && data.data) {
      // 更新本地Token数据
      const index = tokens.value.findIndex(t => t.id === token.id)
      if (index > -1) {
        tokens.value[index] = data.data
      }

      toast.success(data.message || 'Token 刷新成功')
    } else {
      toast.error(data.error || 'Token 刷新失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    // 清除刷新状态
    isRefreshing.value = false
    refreshingToken.value = null
  }
}

const showEditTokenModal = async (token: Token) => {
  try {
    // 调用API获取Token详情
    const response = await fetch(`/api/tokens/${token.id}`)
    const data = await response.json()

    if (data.success && data.data) {
      // 填充编辑表单数据
      editingToken.value = {
        id: data.data.id,
        tenant_url: data.data.tenant_url,
        access_token: data.data.access_token,
        portal_url: data.data.portal_url,
        email_note: data.data.email_note,
        allow_normal_cards: data.data.allow_normal_cards !== false // 默认为true，除非明确设置为false
      }
      showEditModal.value = true
    } else {
      toast.error(data.error || 'Token信息获取失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingToken.value = {
    tenant_url: '',
    access_token: '',
    portal_url: '',
    email_note: '',
    allow_normal_cards: true
  }
}

const updateToken = async () => {
  if (!editingToken.value.id) {
    toast.error('Token ID 不能为空')
    return
  }

  if (!editingToken.value.tenant_url || !editingToken.value.access_token) {
    toast.error('Tenant URL 和 Access Token 不能为空')
    return
  }

  try {
    const response = await fetch(`/api/tokens/${editingToken.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_url: editingToken.value.tenant_url,
        access_token: editingToken.value.access_token,
        portal_url: editingToken.value.portal_url,
        email_note: editingToken.value.email_note,
        allow_normal_cards: editingToken.value.allow_normal_cards
      })
    })

    const data = await response.json()

    if (data.success) {
      // 更新本地数据
      const index = tokens.value.findIndex(t => t.id === editingToken.value.id)
      if (index > -1) {
        tokens.value[index] = data.data
      }

      toast.success(data.message || 'Token 更新成功')
      closeEditModal()

      // 刷新数据
      await refreshTokens()
    } else {
      toast.error(data.error || data.message || 'Token 更新失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  }
}

const showDeleteTokenModal = (token: Token) => {
  deletingToken.value = token
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingToken.value = null
}

const confirmDelete = async () => {
  if (!deletingToken.value) {
    return
  }

  try {
    const response = await fetch(`/api/tokens/${deletingToken.value.id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (data.success) {
      // 从本地数据中移除
      const index = tokens.value.findIndex(t => t.id === deletingToken.value!.id)
      if (index > -1) {
        tokens.value.splice(index, 1)
      }

      toast.success(data.message || 'Token 删除成功')

      // 刷新数据
      await refreshTokens()
    } else {
      toast.error(data.error || data.message || 'Token 删除失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    closeDeleteModal()
  }
}

// 保留原有方法以兼容
const editToken = (token: Token) => {
  showEditTokenModal(token)
}

const deleteToken = (token: Token) => {
  showDeleteTokenModal(token)
}

// Token验证相关方法
const showValidateModal = (token: Token) => {
  validatingToken.value = token
  showValidateConfirmModal.value = true
}

const closeValidateModal = () => {
  showValidateConfirmModal.value = false
  validatingToken.value = null
  isValidating.value = false
}

const confirmValidateToken = async () => {
  if (!validatingToken.value) {
    return
  }

  const tokenToValidate = validatingToken.value

  // 立即关闭模态框，但保持validatingToken用于显示验证状态
  showValidateConfirmModal.value = false

  // 开始验证
  isValidating.value = true

  try {
    const response = await fetch(`/api/tokens/${tokenToValidate.id}/validate`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      // 更新本地Token数据
      const index = tokens.value.findIndex(t => t.id === tokenToValidate.id)
      if (index > -1) {
        tokens.value[index] = data.data
      }

      toast.success(data.message || 'Token 验证成功')

      // 刷新Token列表以显示最新数据
      await refreshTokens()
    } else {
      toast.error(data.error || data.message || 'Token 验证失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isValidating.value = false
    validatingToken.value = null
  }
}

// 批量验证相关方法
const closeBatchValidateModal = () => {
  if (!isBatchValidating.value) {
    showBatchValidateModal.value = false
    batchValidateResults.value = {
      valid: 0,
      invalid: 0,
      failed: 0,
      total: 0,
      completed: 0
    }
  }
}

const confirmBatchValidate = async () => {
  // 立即关闭模态框
  closeBatchValidateModal()

  // 显示悬浮进度窗口
  showFloatingProgress.value = true

  isBatchValidating.value = true

  // 清除之前的数据变化高亮状态
  tokensWithChanges.value = new Set()

  // 确定要验证的Token列表
  const tokensToValidate = isBatchSelectMode.value && selectedItems.value.size > 0
    ? tokens.value.filter(token => selectedItems.value.has(token.id))
    : tokens.value

  // 重置结果
  batchValidateResults.value = {
    valid: 0,
    invalid: 0,
    failed: 0,
    total: tokensToValidate.length,
    completed: 0
  }

  // 创建验证单个Token的函数
  const validateSingleToken = async (token: Token) => {
    try {
      const response = await fetch(`/api/tokens/${token.id}/validate`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        // 更新本地Token数据
        const index = tokens.value.findIndex(t => t.id === token.id)
        if (index > -1) {
          tokens.value[index] = data.data
        }

        return {
          success: true,
          tokenId: token.id,
          data: data.data,
          valid: data.valid
        }
      } else {
        return {
          success: false,
          tokenId: token.id,
          error: data.error || data.message
        }
      }
    } catch (error) {
      return {
        success: false,
        tokenId: token.id,
        error: error instanceof Error ? error.message : '网络错误'
      }
    }
  }

  // 创建带进度跟踪的验证函数
  const validateSingleTokenWithProgress = async (token: Token) => {
    const result = await validateSingleToken(token)

    // 更新进度
    batchValidateResults.value.completed++

    // 更新统计
    if (result.success) {
      if (result.valid) {
        batchValidateResults.value.valid++
      } else {
        batchValidateResults.value.invalid++
      }
    } else {
      batchValidateResults.value.failed++
    }

    return result
  }

  // 单线程顺序验证，每个Token间隔500ms
  try {
    for (let i = 0; i < tokensToValidate.length; i++) {
      const token = tokensToValidate[i]

      // 如果不是第一个Token，添加500ms延迟
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // 验证单个Token
      await validateSingleTokenWithProgress(token)
    }
  } catch (error) {
    toast.error('批量验证过程中发生错误')
  }

  // 验证完成
  isBatchValidating.value = false

  // 显示结果
  const { valid, invalid, failed, total } = batchValidateResults.value
  toast.success(`批量验证完成！有效: ${valid}, 失效: ${invalid}, 错误: ${failed}, 总计: ${total}`)

  // 刷新Token列表以显示最新数据
  await refreshTokens()

  // 设置数据变化高亮效果，3秒后清除
  setTimeout(() => {
    tokensWithChanges.value = new Set()
  }, 3000)

  // 3秒后自动隐藏悬浮进度窗口
  setTimeout(() => {
    showFloatingProgress.value = false
  }, 3000)
}

// 批量刷新相关方法
const closeBatchRefreshModal = () => {
  if (!isBatchRefreshing.value) {
    showBatchRefreshModal.value = false
    batchRefreshResults.value = {
      success: 0,
      failed: 0,
      total: 0,
      completed: 0
    }
  }
}

const confirmBatchRefresh = async () => {
  // 立即关闭模态框
  closeBatchRefreshModal()

  // 显示悬浮进度窗口
  showFloatingProgress.value = true

  isBatchRefreshing.value = true

  // 清除之前的数据变化高亮状态
  tokensWithChanges.value = new Set()

  // 确定要刷新的Token列表
  const tokensToRefresh = isBatchSelectMode.value && selectedItems.value.size > 0
    ? tokens.value.filter(token => selectedItems.value.has(token.id))
    : tokens.value

  // 重置结果
  batchRefreshResults.value = {
    success: 0,
    failed: 0,
    total: tokensToRefresh.length,
    completed: 0
  }

  // 创建刷新单个Token的函数
  const refreshSingleToken = async (token: Token) => {
    try {
      const response = await fetch(`/api/tokens/${token.id}/refresh`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        // 更新本地Token数据
        const index = tokens.value.findIndex(t => t.id === token.id)
        if (index > -1 && data.data) {
          tokens.value[index] = { ...tokens.value[index], ...data.data }
        }

        return { success: true, tokenId: token.id, data: data.data }
      } else {
        return { success: false, tokenId: token.id, error: data.error || data.message }
      }
    } catch (error) {
      return { success: false, tokenId: token.id, error: error instanceof Error ? error.message : '网络错误' }
    }
  }

  // 创建带进度跟踪的刷新函数
  const refreshSingleTokenWithProgress = async (token: Token) => {
    const result = await refreshSingleToken(token)

    // 更新进度
    batchRefreshResults.value.completed++

    // 更新统计
    if (result.success) {
      batchRefreshResults.value.success++
    } else {
      batchRefreshResults.value.failed++
    }

    return result
  }

  // 控制并发的批量刷新
  const BATCH_SIZE = 2 // 每批处理2个
  const BATCH_DELAY = 500 // 每批间隔500ms
  const MAX_CONCURRENT = 8 // 最大同时工作线程8个

  try {
    // 将tokensToRefresh分批处理
    const tokenBatches = []
    for (let i = 0; i < tokensToRefresh.length; i += BATCH_SIZE) {
      tokenBatches.push(tokensToRefresh.slice(i, i + BATCH_SIZE))
    }

    // 控制最大并发数的处理函数
    const processBatchesWithLimit = async (batches: Token[][], maxConcurrent: number) => {
      const results: any[] = []

      for (let i = 0; i < batches.length; i += maxConcurrent) {
        // 取出最多maxConcurrent个批次
        const currentBatches = batches.slice(i, i + maxConcurrent)

        // 并发处理这些批次
        const batchPromises = currentBatches.map(async (batch, batchIndex) => {
          // 如果不是第一批，添加延迟
          if (i + batchIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
          }

          // 并发处理批次内的所有token
          const batchResults = await Promise.allSettled(
            batch.map(token => refreshSingleTokenWithProgress(token))
          )

          return batchResults
        })

        // 等待当前这组批次完成
        const batchGroupResults = await Promise.allSettled(batchPromises)

        // 收集结果
        batchGroupResults.forEach(batchGroupResult => {
          if (batchGroupResult.status === 'fulfilled') {
            results.push(...batchGroupResult.value)
          }
        })
      }

      return results
    }

    // 执行分批处理
    await processBatchesWithLimit(tokenBatches, MAX_CONCURRENT / BATCH_SIZE)
  } catch (error) {
    toast.error('批量刷新过程中发生错误')
  }

  // 刷新完成
  isBatchRefreshing.value = false

  // 显示结果
  const { success, failed, total } = batchRefreshResults.value
  toast.success(`受控并发批量刷新完成！成功: ${success}, 失败: ${failed}, 总计: ${total}`)

  // 刷新Token列表以显示最新数据
  await refreshTokens({ highlightChanges: true })

  // 设置数据变化高亮效果，3秒后清除
  setTimeout(() => {
    tokensWithChanges.value = new Set()
  }, 3000)

  // 3秒后自动隐藏悬浮进度窗口
  setTimeout(() => {
    showFloatingProgress.value = false
  }, 3000)
}
</script>

<style scoped>
/* 通用样式 */
.cursor-pointer {
  cursor: pointer;
}

/* 拖拽上传样式 */
.dropzone {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.dropzone:hover,
.dropzone-dragover {
  border-color: #0d6efd;
  background-color: #e7f3ff;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 步骤指示器样式 */
.steps-wrapper {
  padding: 0 20px;
}

.steps {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 120px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #dee2e6;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border: 2px solid #dee2e6;
}

.step-title {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  line-height: 1.2;
}

/* 应用卡片样式 */
.app-card {
  transition: all 0.2s ease-in-out;
  border: 1px solid var(--tblr-border-color);
}

.app-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--tblr-primary);
}

.app-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.app-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--tblr-dark);
}

.step-active .step-number {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.step-active .step-title {
  color: #0d6efd;
  font-weight: 600;
}

.step-completed .step-number {
  background-color: #198754;
  color: white;
  border-color: #198754;
}

.step-completed .step-title {
  color: #198754;
  font-weight: 600;
}

.step-divider {
  flex: 1;
  height: 2px;
  background-color: #dee2e6;
  margin: 0 16px;
  margin-bottom: 24px;
  transition: background-color 0.3s ease;
}

.divider-active {
  background-color: #198754;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .step {
    min-width: 80px;
  }

  .step-title {
    font-size: 11px;
  }

  .step-divider {
    margin: 0 8px;
    margin-bottom: 24px;
  }


}



  .card-sm .avatar i {
    font-size: 0.875rem;
  }

/* 小屏幕进一步优化 */
@media (max-width: 575.98px) {
  /* 更紧凑的间隔 */
  .row.mb-4 > [class*="col-"] {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    margin-bottom: 0.5rem;
  }

  /* 更小的卡片内边距 */
  .card-sm .card-body {
    padding: 0.5rem;
  }

  /* 字体大小调整 */
  .card-sm .h1 {
    font-size: 1.25rem;
  }

  .card-sm .font-weight-medium {
    font-size: 0.8rem;
  }
}


.cursor-pointer {
  cursor: pointer;
}
/* 悬浮进度窗口样式 */
.floating-progress-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1060;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.floating-progress-window.show {
  opacity: 1;
  transform: translateY(0);
}

.progress-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.progress-body {
  padding: 16px;
  color: #495057;
}



.floating-progress-window .progress {
  height: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.floating-progress-window .progress-bar {
  background-color: #0d6efd;
  font-size: 11px;
  line-height: 8px;
  border-radius: 4px;
}

.floating-progress-window .btn-close {
  opacity: 0.5;
}

.floating-progress-window .btn-close:hover {
  opacity: 1;
}

/* 数据变化高亮效果样式 */
.table-success {
  background-color: rgba(25, 135, 84, 0.15) !important;
  transition: background-color 0.3s ease;
}

.card {
  transition: all 0.3s ease;
}

.border-success {
  border-color: #198754 !important;
}

.bg-success-subtle {
  background-color: rgba(25, 135, 84, 0.15) !important;
}

.highlighted-metric {
  display: inline-block;
  padding: 0 0.45rem;
  border-radius: 999px;
  background-color: rgba(25, 135, 84, 0.32);
  box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.35);
  font-weight: 600;
  animation: metric-highlight-fade 2.6s ease-out forwards;
}

@keyframes metric-highlight-fade {
  0% {
    background-color: rgba(25, 135, 84, 0.45);
    box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.35);
  }
  60% {
    background-color: rgba(25, 135, 84, 0.18);
    box-shadow: 0 0 0 8px rgba(25, 135, 84, 0);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    font-weight: inherit;
  }
}

/* 刷新动画 */
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
  transform-origin: center center;
  display: inline-block;
}

/* 倒计时进度条光效 */
.countdown-glow-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  transition: width 1s ease-in-out, background 0.5s ease-in-out, box-shadow 0.5s ease-in-out;
}

/* 绿色状态 (>50%) */
.countdown-green {
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
  animation: glow-pulse-green 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse-green {
  0% {
    box-shadow: 0 0 8px rgba(40, 167, 69, 0.6);
  }
  100% {
    box-shadow: 0 0 12px rgba(40, 167, 69, 0.8);
  }
}

/* 橙色状态 (30%-50%) */
.countdown-orange {
  background: linear-gradient(90deg, #ffc107 0%, #fd7e14 100%);
  box-shadow: 0 0 8px rgba(255, 193, 7, 0.6);
  animation: glow-pulse-orange 2s ease-in-out infinite alternate;
}

@keyframes glow-pulse-orange {
  0% {
    box-shadow: 0 0 8px rgba(255, 193, 7, 0.6);
  }
  100% {
    box-shadow: 0 0 12px rgba(255, 193, 7, 0.8);
  }
}

/* 红色状态 (<30%) */
.countdown-red {
  background: linear-gradient(90deg, #dc3545 0%, #e74c3c 100%);
  box-shadow: 0 0 8px rgba(220, 53, 69, 0.6);
  animation: glow-pulse-red 1.5s ease-in-out infinite alternate;
}

@keyframes glow-pulse-red {
  0% {
    box-shadow: 0 0 8px rgba(220, 53, 69, 0.6);
  }
  100% {
    box-shadow: 0 0 15px rgba(220, 53, 69, 0.9);
  }
}
</style>
