<template>
  <div class="token-manager">
    <!-- 页面标题 -->
    <div class="page-header d-print-none">
      <div class="container-xl">
        <div class="row g-2 align-items-center">
          <div class="col">
            <h2 class="page-title">Token 管理</h2>
          </div>
          <div class="col-auto ms-auto d-print-none">
            <div class="btn-list">
              <!-- 视图切换按钮 -->
              <div class="btn-group" role="group">
                <button
                  type="button"
                  :class="['btn', viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary']"
                  @click="viewMode = 'card'"
                  title="卡片视图"
                >
                  <i class="bi bi-grid-3x3-gap"></i>
                </button>
                <button
                  type="button"
                  :class="['btn', viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary']"
                  @click="viewMode = 'table'"
                  title="表格视图"
                >
                  <i class="bi bi-table"></i>
                </button>
              </div>
              <button @click="validateAllTokens" class="btn btn-warning" title="验证 Token">
                <i class="bi bi-check-circle me-sm-2"></i>
                <span class="d-none d-sm-inline">验证 Token</span>
              </button>
              <button
                @click="showBatchRefreshConfirm"
                class="btn btn-secondary"
                :disabled="isBatchRefreshing"
                :title="isBatchRefreshing ? '刷新中...' : '全部刷新'"
              >
                <i
                  :class="['bi', 'me-sm-2',
                    isBatchRefreshing ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
                  :style="isBatchRefreshing ? 'animation: refresh-rotate 1s linear infinite; transform-origin: center center; display: inline-block;' : ''"
                ></i>
                <span class="d-none d-sm-inline">{{ isBatchRefreshing ? '刷新中...' : '全部刷新' }}</span>
              </button>
              <button @click="showGetTokenModal" class="btn btn-success" title="获取 Token">
                <i class="bi bi-link-45deg me-sm-2"></i>
                <span class="d-none d-sm-inline">获取 Token</span>
              </button>
              <button @click="showAddTokenModal" class="btn btn-info" title="添加 Token">
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
        <!-- 状态统计窗口 -->
        <div class="row mb-4">
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-success': activeFilter === '正常' }"
              @click="toggleFilter('正常')"
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
                      正常
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-success">{{ statusStats.normal }}</div>
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
                    <div class="h1 mb-0 text-danger">{{ statusStats.expired }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-warning': activeFilter === '耗尽' }"
              @click="toggleFilter('耗尽')"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-warning text-white avatar">
                      <i class="bi bi-exclamation-triangle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      耗尽
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-warning">{{ statusStats.depleted }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div
              class="card card-sm cursor-pointer"
              :class="{ 'border-secondary': activeFilter === '未验证' }"
              @click="toggleFilter('未验证')"
            >
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-auto">
                    <span class="bg-secondary text-white avatar">
                      <i class="bi bi-question-circle"></i>
                    </span>
                  </div>
                  <div class="col">
                    <div class="font-weight-medium">
                      未验证
                    </div>
                  </div>
                  <div class="col-auto">
                    <div class="h1 mb-0 text-secondary">{{ statusStats.unverified }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="row row-cards">
          <div v-for="token in tokens" :key="token.id" class="col-sm-6 col-lg-4">
            <div class="card">
              <div class="card-body">
                <!-- 卡片头部 -->
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-fill">
                    <div class="font-weight-medium">{{ token.email_note || '未设置备注' }}</div>
                    <div class="text-muted small">{{ token.created_at }}</div>
                  </div>
                  <div class="ms-auto">
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
                  </div>
                </div>

                <!-- 统计信息 -->
                <div class="row mb-3">
                  <div class="col-6">
                    <div class="text-muted small">剩余时长</div>
                    <div :class="['h4', 'mb-0', getDaysColorClass(token)]">
                      {{ formatRemainingTime(token) }}
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-muted small">剩余次数</div>
                    <div :class="['h4', 'mb-0', getCreditsColorClass(token)]">
                      {{ getRemainingCredits(token) }}
                    </div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="btn-list w-100">
                  <button @click="executeToken(token)" class="btn btn-primary flex-fill">
                    <i class="bi bi-play-fill me-1"></i>
                    执行
                  </button>
                  <button
                    @click="refreshToken(token)"
                    class="btn btn-success"
                    :disabled="isRefreshing && refreshingToken?.id === token.id"
                  >
                    <i
                      :class="['bi',
                        isRefreshing && refreshingToken?.id === token.id ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"
                    ></i>
                  </button>
                  <button @click="showEditTokenModal(token)" class="btn btn-warning">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button @click="showDeleteTokenModal(token)" class="btn btn-danger">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="card">
          <div class="table-responsive">
            <table class="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>邮箱备注</th>
                  <th>创建时间</th>
                  <th>过期时间</th>
                  <th>剩余次数</th>
                  <th>状态</th>
                  <th class="w-1">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in tokens" :key="token.id">
                  <td class="text-muted">{{ token.email_note || '未设置备注' }}</td>
                  <td class="text-muted">{{ token.created_at }}</td>
                  <td :class="getDaysColorClass(token)">
                    {{ formatRemainingTime(token) }}
                  </td>
                  <td :class="getCreditsColorClass(token)">
                    {{ getRemainingCredits(token) }}
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
                        {{ isRefreshing && refreshingToken?.id === token.id ? '刷新中...' : '刷新' }}
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
        </div>

        <!-- 分页 -->
        <div class="d-flex align-items-center justify-content-between mt-4">
          <div class="text-muted">
            显示 {{ (pagination.page - 1) * pagination.limit + 1 }} 到
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 条，
            共 {{ pagination.total }} 条记录
          </div>
          <div class="d-flex align-items-center">
            <ul class="pagination m-0 ms-auto">
              <li class="page-item" :class="{ disabled: !pagination.has_prev }">
                <button
                  class="page-link"
                  @click="loadTokens(pagination.page - 1)"
                  :disabled="!pagination.has_prev"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <polyline points="15,6 9,12 15,18"/>
                  </svg>
                  上一页
                </button>
              </li>
              <li
                v-for="page in getPageNumbers()"
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.page }"
              >
                <button class="page-link" @click="loadTokens(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: !pagination.has_next }">
                <button
                  class="page-link"
                  @click="loadTokens(pagination.page + 1)"
                  :disabled="!pagination.has_next"
                >
                  下一页
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <polyline points="9,6 15,12 9,18"/>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 获取 Token 模态框 -->
    <div v-if="showGetModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">获取 Token</h5>
            <button type="button" class="btn-close" @click="closeGetModal"></button>
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
                  <div class="step-title">获取Token</div>
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

            <!-- 第三步：保存Token -->
            <div v-if="getTokenStep === 3">
              <h6 class="mb-3">第三步：保存Token</h6>
              <div v-if="tokenData.tenant_url">
                <div class="alert alert-success">
                  <h6>Token获取成功！</h6>
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
                    <label class="form-label">邮箱备注（可选）</label>
                    <input
                      type="text"
                      v-model="emailNote"
                      class="form-control"
                      placeholder="请输入邮箱或备注信息（可选）"
                    >
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

    <!-- 编辑 Token 模态框 -->
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

    <!-- 删除确认模态框 -->
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

    <!-- Token验证确认模态框 -->
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

    <!-- 批量验证确认模态框 -->
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
                  <div class="text-muted">请谨慎操作！</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>将要验证：</strong>{{ tokens.length }} 个Token
              <template v-if="activeFilter">
                <span class="badge text-bg-primary ms-2">{{ activeFilter }}</span>
              </template>
              <template v-else>
                <span class="badge text-bg-light ms-2">全部状态</span>
              </template><br>
              <strong>验证方式：</strong>逐个验证，避免服务器压力
            </div>
            <div v-if="isBatchValidating" class="mt-3">
              <div class="progress">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  :style="{ width: ((batchValidateResults.valid + batchValidateResults.invalid + batchValidateResults.failed) / batchValidateResults.total * 100) + '%' }"
                >
                  {{ batchValidateResults.valid + batchValidateResults.invalid + batchValidateResults.failed }} / {{ batchValidateResults.total }}
                </div>
              </div>
              <div class="text-center mt-2 small">
                有效: {{ batchValidateResults.valid }} | 失效: {{ batchValidateResults.invalid }} | 错误: {{ batchValidateResults.failed }}
              </div>
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

    <!-- 批量刷新确认模态框 -->
    <div v-if="showBatchRefreshModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认批量刷新</h5>
            <button type="button" class="btn-close" @click="closeBatchRefreshModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info" role="alert">
              <div class="d-flex">
                <div>
                  <i class="bi bi-info-circle alert-icon" style="font-size: 24px;"></i>
                </div>
                <div>
                  <h4 class="alert-title">即将刷新账户的详细信息！</h4>
                  <div class="text-muted">此操作将获取最新的余额信息</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>将要刷新：</strong>{{ tokens.length }} 个Token
              <template v-if="activeFilter">
                <span class="badge text-bg-primary ms-2">{{ activeFilter }}</span>
              </template>
              <template v-else>
                <span class="badge text-bg-light ms-2">全部状态</span>
              </template><br>
              <strong>刷新方式：</strong>批量刷新，获取最新状态信息
            </div>

            <!-- 刷新进度 -->
            <div v-if="isBatchRefreshing" class="mt-3">
              <div class="progress">
                <div
                  class="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  :style="{ width: ((batchRefreshResults.success + batchRefreshResults.failed) / batchRefreshResults.total * 100) + '%' }"
                >
                  {{ batchRefreshResults.success + batchRefreshResults.failed }} / {{ batchRefreshResults.total }}
                </div>
              </div>
              <div class="text-center mt-2 small">
                成功: {{ batchRefreshResults.success }} | 失败: {{ batchRefreshResults.failed }}
              </div>
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

    <!-- 添加 Token 模态框 -->
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
  </div>

  <!-- 执行Token模态框 -->
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
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { toast } from '../utils/toast'



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
const showDeleteModal = ref(false)
const showValidateConfirmModal = ref(false)
const validatingToken = ref<Token | null>(null)
const isValidating = ref(false)
const refreshingToken = ref<Token | null>(null)
const isRefreshing = ref(false)

// 视图模式 - 从本地存储读取，默认为卡片视图
const viewMode = ref<'card' | 'table'>(
  (localStorage.getItem('token-manager-view-mode') as 'card' | 'table') || 'card'
)

// 监听视图模式变化，保存到本地存储
watch(viewMode, (newMode) => {
  localStorage.setItem('token-manager-view-mode', newMode)
}, { immediate: false })

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
  total: 0
})

// 批量刷新模态框状态
const showBatchRefreshModal = ref(false)
const isBatchRefreshing = ref(false)
const batchRefreshResults = ref({
  success: 0,
  failed: 0,
  total: 0
})
const isGeneratingUrl = ref(false)
const lastGenerateTime = ref(0)
const generateCooldown = 10000 // 10秒冷却时间
const currentTime = ref(Date.now()) // 当前时间，用于触发响应式更新

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
}>({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: ''
})
const deletingToken = ref<Token | null>(null)

// 筛选相关
const activeFilter = ref<string | null>(null) // 当前激活的筛选器

// 状态统计计算属性
const statusStats = computed(() => {
  const stats = {
    normal: 0,
    expired: 0,
    depleted: 0,
    unverified: 0
  }

  allTokens.value.forEach(token => {
    const status = getTokenStatus(token)
    switch (status) {
      case '正常':
        stats.normal++
        break
      case '失效':
        stats.expired++
        break
      case '耗尽':
        stats.depleted++
        break
      case '未验证':
        stats.unverified++
        break
    }
  })

  return stats
})

// 获取Token流程相关数据
const getTokenStep = ref(1)
const authUrl = ref('')
const authResponse = ref('')
const portalUrl = ref('')
const obtainedToken = ref('')
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

// 生命周期
onMounted(() => {
  loadTokens()
})

onUnmounted(() => {
  stopCooldownTimer()
})

// 方法
const loadTokens = async (page: number = 1) => {
  // 如果已经有数据，只需要更新分页显示
  if (allTokens.value.length > 0) {
    updatePagination(page)
    return
  }

  isLoading.value = true
  try {
    // 一次性加载所有数据
    const response = await fetch(`/api/tokens?limit=10000`)
    const data: TokenResponse = await response.json()

    if (data.success) {
      allTokens.value = data.data
      updatePagination(page)
    } else {
      toast.error('获取Token列表失败')
    }
  } catch (error) {
    console.error('获取Token列表失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    isLoading.value = false
  }
}

// 获取筛选后的Token数据
const getFilteredTokens = () => {
  if (!activeFilter.value) {
    return allTokens.value
  }

  return allTokens.value.filter(token => {
    const status = getTokenStatus(token)
    return status === activeFilter.value
  })
}

// 更新前端分页显示
const updatePagination = (page: number) => {
  const filteredTokens = getFilteredTokens()
  const total = filteredTokens.length
  const limit = pagination.value.limit
  const totalPages = Math.ceil(total / limit) || 1

  // 确保页码在有效范围内
  const currentPage = Math.max(1, Math.min(page, totalPages))

  // 计算当前页的数据范围
  const startIndex = (currentPage - 1) * limit
  const endIndex = Math.min(startIndex + limit, total)

  // 更新显示的Token数据
  tokens.value = filteredTokens.slice(startIndex, endIndex)

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

// 切换筛选器
const toggleFilter = (status: string) => {
  if (activeFilter.value === status) {
    // 如果点击的是当前激活的筛选器，则取消筛选
    activeFilter.value = null
  } else {
    // 否则设置新的筛选器
    activeFilter.value = status
  }

  // 重新计算分页，回到第一页
  updatePagination(1)
}

// 刷新数据（重新从服务器加载）
const refreshTokens = async () => {
  allTokens.value = [] // 清空缓存
  activeFilter.value = null // 清空筛选
  await loadTokens(1) // 重新加载第一页
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

const getTokenStatus = (token: Token): '正常' | '失效' | '未验证' | '耗尽' => {
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
      return 'bg-warning text-dark'
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

    const response = await fetch('/api/auth/validate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

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
      toast.error(data.error || data.message || '授权验证失败')
    }
  } catch (error) {
    console.error('授权验证失败:', error)
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

    const response = await fetch('/api/auth/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.success) {
      toast.success(data.message || 'Token保存成功')

      // 关闭模态框并刷新Token列表
      showGetModal.value = false
      refreshTokens()
    } else {
      toast.error(data.error || data.message || 'Token保存失败')
    }
  } catch (error) {
    console.error('Token保存失败:', error)
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
  if (tokens.value.length === 0) {
    toast.error('没有Token需要验证')
    return
  }

  // 重置验证结果
  batchValidateResults.value = {
    valid: 0,
    invalid: 0,
    failed: 0,
    total: tokens.value.length
  }

  showBatchValidateModal.value = true
}

// 显示批量刷新确认模态框
const showBatchRefreshConfirm = () => {
  if (tokens.value.length === 0) {
    toast.error('没有Token需要刷新')
    return
  }

  // 重置刷新结果
  batchRefreshResults.value = {
    success: 0,
    failed: 0,
    total: 0
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
  showGetModal.value = true
}

const closeGetModal = () => {
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
    const response = await fetch('/api/auth/generate-url', {
      method: 'GET'
    })

    const data = await response.json()

    if (data.success) {
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

      toast.success(data.message || '授权URL生成成功')
    } else {
      toast.error(data.error || data.message || '授权URL生成失败')
    }
  } catch (error) {
    console.error('生成授权URL失败:', error)
    toast.error('网络错误，请重试')
  } finally {
    isGeneratingUrl.value = false
  }
}

const copyAuthUrl = async () => {
  try {
    await navigator.clipboard.writeText(authUrl.value)
  } catch (err) {
    console.error('复制失败:', err)
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
    console.error('复制失败:', err)
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
    } else {
      toast.error(data.error || data.message || 'Token 添加失败')
    }
  } catch (error) {
    console.error('添加Token失败:', error)
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
        console.error('批量导入失败:', error)
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
    console.error('启动应用失败:', error)
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
    const response = await fetch(`/api/tokens/${token.id}/refresh`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      // 更新本地Token数据
      const index = tokens.value.findIndex(t => t.id === token.id)
      if (index > -1) {
        tokens.value[index] = data.data
      }

      toast.success(data.message || 'Token 刷新成功')
    } else {
      toast.error(data.error || data.message || 'Token 刷新失败')
    }
  } catch (error) {
    console.error('Token刷新失败:', error)
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
        email_note: data.data.email_note
      }
      showEditModal.value = true
    } else {
      toast.error(data.error || 'Token信息获取失败')
    }
  } catch (error) {
    console.error('获取Token详情失败:', error)
    toast.error('网络错误，请重试')
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingToken.value = {
    tenant_url: '',
    access_token: '',
    portal_url: '',
    email_note: ''
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
        email_note: editingToken.value.email_note
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
    } else {
      toast.error(data.error || data.message || 'Token 更新失败')
    }
  } catch (error) {
    console.error('更新Token失败:', error)
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
    } else {
      toast.error(data.error || data.message || 'Token 删除失败')
    }
  } catch (error) {
    console.error('删除Token失败:', error)
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
    } else {
      toast.error(data.error || data.message || 'Token 验证失败')
    }
  } catch (error) {
    console.error('Token验证失败:', error)
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
      total: 0
    }
  }
}

const confirmBatchValidate = async () => {
  isBatchValidating.value = true

  // 重置结果
  batchValidateResults.value = {
    valid: 0,
    invalid: 0,
    failed: 0,
    total: tokens.value.length
  }

  // 逐个验证Token，添加延迟
  for (let i = 0; i < tokens.value.length; i++) {
    const token = tokens.value[i]

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

        // 根据valid字段判断Token状态
        if (data.valid) {
          batchValidateResults.value.valid++
        } else {
          batchValidateResults.value.invalid++
        }
      } else {
        batchValidateResults.value.failed++
      }
    } catch (error) {
      console.error(`Token ${token.id} 验证失败:`, error)
      batchValidateResults.value.failed++
    }

    // 添加延迟，避免服务器压力（每个请求间隔500ms）
    if (i < tokens.value.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 验证完成
  isBatchValidating.value = false

  // 显示结果
  const { valid, invalid, failed, total } = batchValidateResults.value
  toast.success(`批量验证完成！有效: ${valid}, 失效: ${invalid}, 错误: ${failed}, 总计: ${total}`)

  // 延迟关闭模态框
  setTimeout(() => {
    closeBatchValidateModal()
  }, 2000)
}

// 批量刷新相关方法
const closeBatchRefreshModal = () => {
  if (!isBatchRefreshing.value) {
    showBatchRefreshModal.value = false
    batchRefreshResults.value = {
      success: 0,
      failed: 0,
      total: 0
    }
  }
}

const confirmBatchRefresh = async () => {
  isBatchRefreshing.value = true

  // 重置结果
  batchRefreshResults.value = {
    success: 0,
    failed: 0,
    total: tokens.value.length
  }

  // 逐个刷新Token，添加延迟
  for (let i = 0; i < tokens.value.length; i++) {
    const token = tokens.value[i]

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

        batchRefreshResults.value.success++
      } else {
        batchRefreshResults.value.failed++
        console.error(`Token ${token.id} 刷新失败:`, data.error || data.message)
      }
    } catch (error) {
      batchRefreshResults.value.failed++
      console.error(`Token ${token.id} 刷新错误:`, error)
    }

    // 添加延迟，避免服务器压力
    if (i < tokens.value.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 刷新完成
  isBatchRefreshing.value = false

  // 显示结果
  const { success, failed, total } = batchRefreshResults.value
  toast.success(`批量刷新完成！成功: ${success}, 失败: ${failed}, 总计: ${total}`)

  // 延迟关闭模态框
  setTimeout(() => {
    closeBatchRefreshModal()
  }, 2000)
}
</script>

<style scoped>
/* 通用样式 */
.cursor-pointer {
  cursor: pointer;
}

/* 刷新按钮旋转动画 */
.refresh-spin {
  animation: refresh-rotate 1s linear infinite !important;
  transform-origin: center center !important;
  display: inline-block !important;
}

i.refresh-spin {
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

/* 浏览器兼容性 */
@-webkit-keyframes refresh-rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
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

/* 筛选卡片样式 */
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
</style>
