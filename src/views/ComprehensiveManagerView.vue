<template>
  <div v-if="hasPermission">
    <!-- 权限检查通过，显示内容 -->
    <div class="page-header d-print-none">
    <div class="container-xl">
      <div class="row g-2 align-items-center">
        <div class="col">
          <h2 class="page-title">
            综合管理
          </h2>
          <div class="text-muted mt-1">管理您的 Token</div>
        </div>
        <div class="col-auto ms-auto d-print-none">
          <!-- 大屏按钮 -->
          <div class="btn-list d-none d-md-flex">
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

            <!-- 隐私显示切换按钮 -->
            <button
              @click="togglePrivacyMode"
              :class="['btn', privacyMode ? 'btn-outline-secondary' : 'btn-secondary']"
              :title="privacyMode ? '显示完整信息' : '隐藏敏感信息'"
            >
              <i :class="['bi', privacyMode ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>

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
                :title="isAllSelected ? '取消全选' : '全选当前页'"
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

            <button @click="showGetTokenModal" class="btn btn-success" title="获取 Token">
              <i class="bi bi-link-45deg me-2"></i>
              获取 Token
            </button>
            <button @click="showAddTokenModal" class="btn btn-primary" title="添加 Token">
              <i class="bi bi-plus-circle me-2"></i>
              添加 Token
            </button>
          </div>

          <!-- 小屏按钮 -->
          <div class="btn-list d-md-none">
            <!-- 视图切换按钮 -->
            <div class="btn-group" role="group">
              <button
                type="button"
                :class="['btn', 'btn-sm', viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary']"
                @click="viewMode = 'card'"
                title="卡片视图"
              >
                <i class="bi bi-grid-3x3-gap"></i>
              </button>
              <button
                type="button"
                :class="['btn', 'btn-sm', viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary']"
                @click="viewMode = 'table'"
                title="表格视图"
              >
                <i class="bi bi-table"></i>
              </button>
            </div>

            <!-- 隐私显示切换按钮 -->
            <button
              @click="togglePrivacyMode"
              :class="['btn', 'btn-sm', privacyMode ? 'btn-outline-secondary' : 'btn-secondary']"
              :title="privacyMode ? '显示完整信息' : '隐藏敏感信息'"
            >
              <i :class="['bi', privacyMode ? 'bi-eye-slash' : 'bi-eye']"></i>
            </button>

            <!-- 批量选择按钮 -->
            <button
              type="button"
              :class="['btn', 'btn-sm', isBatchSelectMode ? 'btn-danger' : 'btn-outline-secondary']"
              @click="toggleBatchSelectMode"
              :title="isBatchSelectMode ? '退出批量选择' : '开启批量选择'"
            >
              <i :class="['bi', isBatchSelectMode ? 'bi-square' : 'bi-check2-square']"></i>
            </button>

            <!-- 批量操作按钮 -->
            <div v-if="isBatchSelectMode" class="btn-group" role="group">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="toggleSelectAll"
                :title="isAllSelected ? '取消全选' : '全选当前页'"
              >
                <i :class="['bi', isAllSelected ? 'bi-square' : (isPartialSelected ? 'bi-dash-square' : 'bi-check-square')]"></i>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-primary"
                @click="exportSelected"
                :disabled="selectedCount === 0"
                :title="`导出选中的 ${selectedCount} 项`"
              >
                <i class="bi bi-download"></i>
                <span class="badge bg-white text-primary ms-1">{{ selectedCount }}</span>
              </button>
            </div>

            <button @click="showGetTokenModal" class="btn btn-success btn-sm" title="获取 Token">
              <i class="bi bi-link-45deg"></i>
            </button>
            <button @click="showAddTokenModal" class="btn btn-primary btn-sm" title="添加 Token">
              <i class="bi bi-plus-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="page-body">
    <div class="container-xl">
      <!-- 统计面板 -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">
                <i class="bi bi-bar-chart me-2"></i>
                综合统计
              </h3>
            </div>
            <div class="card-body">
              <div class="row">
                <!-- Token总数 -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter(null)" :class="{ 'border-primary': activeFilter === null }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-primary text-white avatar">
                            <i class="bi bi-collection"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">总数</div>
                          <div class="text-muted">{{ comprehensiveStats.totalTokens }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 有效Token -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter('有效')" :class="{ 'border-success': activeFilter === '有效' }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-success text-white avatar">
                            <i class="bi bi-check-circle"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">有效</div>
                          <div class="text-muted">{{ comprehensiveStats.validTokens }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 即将到期(2天内) -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter('即将到期')" :class="{ 'border-warning': activeFilter === '即将到期' }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-warning text-white avatar">
                            <i class="bi bi-clock"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">即将到期</div>
                          <div class="text-muted">{{ comprehensiveStats.expiringTokens }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 已失效 -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter('已失效')" :class="{ 'border-danger': activeFilter === '已失效' }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-danger text-white avatar">
                            <i class="bi bi-x-circle"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">已失效</div>
                          <div class="text-muted">{{ comprehensiveStats.invalidTokens }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 绑定总数(激活码) -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter('绑定')" :class="{ 'border-info': activeFilter === '绑定' }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-info text-white avatar">
                            <i class="bi bi-credit-card"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">已绑定</div>
                          <div class="text-muted">{{ comprehensiveStats.boundActivations }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 未使用总数 -->
                <div class="col-md-2 col-6">
                  <div class="card card-sm cursor-pointer" @click="setFilter('未使用')" :class="{ 'border-secondary': activeFilter === '未使用' }">
                    <div class="card-body">
                      <div class="row align-items-center">
                        <div class="col-auto">
                          <span class="bg-secondary text-white avatar">
                            <i class="bi bi-circle"></i>
                          </span>
                        </div>
                        <div class="col">
                          <div class="font-weight-medium">空闲</div>
                          <div class="text-muted">{{ comprehensiveStats.unusedActivations }} 个</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="row row-cards">
        <div v-for="item in comprehensiveItems" :key="item.id" class="col-sm-4 col-lg-3">
          <div :class="[
            'card',
            'position-relative',
            {
              'bound-card': item.type === 'activation' || (item.type === 'token' && item.activation_code && item.activation_code !== '未绑定激活码' && getTokenStatus(item.bound_token) === '正常'),
              'unbound-card': item.type === 'token' && (!item.activation_code || item.activation_code === '未绑定激活码'),
              'suspended-card': item.bound_token && getTokenStatus(item.bound_token) === '暂停',
              'invalid-card': item.bound_token && (getTokenStatus(item.bound_token) === '失效' || getTokenStatus(item.bound_token) === '耗尽')
            }
          ]">
            <!-- 批量选择蒙版 -->
            <div v-if="isBatchSelectMode"
                 class="card-select-overlay"
                 :class="{ 'selected': selectedItems.has(item.id) }"
                 @click="toggleSelectItem(item.id)">
              <div class="select-indicator">
                <i v-if="selectedItems.has(item.id)" class="bi bi-check-circle-fill"></i>
                <i v-else class="bi bi-circle"></i>
              </div>
            </div>

            <!-- Public角标 -->
            <div v-if="item.bound_token && item.bound_token.public === 'yes'"
                 :class="[
                   'public-badge',
                   {
                     'public-bound': item.type === 'activation' || (item.type === 'token' && item.activation_code && item.activation_code !== '未绑定激活码' && getTokenStatus(item.bound_token) === '正常'),
                     'public-unbound': item.type === 'token' && (!item.activation_code || item.activation_code === '未绑定激活码'),
                     'public-suspended': item.bound_token && getTokenStatus(item.bound_token) === '暂停',
                     'public-invalid': item.bound_token && (getTokenStatus(item.bound_token) === '失效' || getTokenStatus(item.bound_token) === '耗尽')
                   }
                 ]">
              <div class="public-triangle"></div>
            </div>
            <div class="card-body">
              <!-- 卡片头部 -->
              <div class="d-flex align-items-start mb-2">
                <div class="flex-fill me-2" style="min-width: 0;">
                  <div class="font-weight-medium text-truncate" :title="formatEmailNote(item.email_note)">
                    {{ formatEmailNote(item.email_note) }}
                  </div>
                  <div class="text-muted small">{{ item.bound_token ? formatDate(item.bound_token.created_at) : '无Token' }}</div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-shrink-0">
                  <!-- 激活码状态badge -->
                  <span
                    v-if="item.type === 'activation'"
                    :class="['badge', 'badge-sm',
                      item.bound_token_id ? 'cursor-pointer' : '',
                      getActivationStatusClass(item)]"
                    @click="item.bound_token_id ? showDeleteCardModal(item) : null"
                    :title="item.bound_token_id ? '点击删除激活码' : ''"
                  >
                    {{ getActivationStatusText(item) }}
                  </span>
                  <!-- Token状态badge -->
                  <span
                    v-if="item.bound_token"
                    :class="['badge', 'badge-sm', 'cursor-pointer',
                      validatingTokenId === item.bound_token.id ? 'bg-warning text-white' :
                      getTokenStatusClass(item.bound_token)]"
                    @click="showValidateTokenModal(item.bound_token)"
                    :title="validatingTokenId === item.bound_token.id ? '验证中' : '点击验证Token状态'"
                  >
                    <span v-if="validatingTokenId === item.bound_token.id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    {{ validatingTokenId === item.bound_token.id ? '验证中' : getTokenStatusText(item.bound_token) }}
                  </span>
                  <span v-else class="badge badge-sm bg-secondary">
                    无Token
                  </span>
                </div>
              </div>

              <!-- Token信息 -->
              <div v-if="item.bound_token" class="mb-2">
                <div class="row">
                  <div class="col-6">
                    <div class="text-muted small">剩余时间</div>
                    <div class="small" :class="getDaysColorClass(item.bound_token)">{{ formatRemainingTime(item.bound_token) }}</div>
                  </div>
                  <div class="col-6">
                    <div class="text-muted small">剩余次数</div>
                    <div class="small" :class="getCreditsColorClass(getRemainingCredits(item.bound_token))">
                      {{ getRemainingCredits(item.bound_token) === '-' ? '-' : getRemainingCredits(item.bound_token) + '次' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 激活码信息 -->
              <div class="mb-2">
                <div class="text-muted small">激活码</div>
                <div
                  v-if="item.activation_code && item.activation_code !== '未绑定激活码'"
                  class="small cursor-pointer"
                  :title="item.activation_code + ' (点击复制完整激活码)'"
                  @click="copyActivationCode(item)"
                >
                  <i class="bi bi-credit-card me-1"></i>
                  {{ formatActivationCode(item.activation_code) }}
                </div>
                <div
                  v-else-if="item.type === 'token'"
                  class="small cursor-pointer text-primary"
                  :title="generatingCodeFor === item.id ? '生成中...' : '点击生成激活码'"
                  @click="generateActivationCode(item)"
                  :style="generatingCodeFor === item.id ? 'pointer-events: none;' : ''"
                >
                  <i v-if="generatingCodeFor === item.id" class="bi bi-arrow-clockwise refresh-spin me-1"></i>
                  <i v-else class="bi bi-plus-circle me-1"></i>
                  {{ generatingCodeFor === item.id ? '生成中...' : '未绑定激活码 (点击生成)' }}
                </div>
                <div v-else class="small text-muted">
                  <i class="bi bi-credit-card me-1"></i>
                  未绑定激活码
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="btn-list w-100">
                <button
                  v-if="item.bound_token"
                  @click="executeToken(item.bound_token)"
                  class="btn btn-primary flex-fill"
                >
                  <i class="bi bi-play-fill me-1"></i>
                  执行
                </button>
                <button
                  v-if="item.bound_token"
                  @click="refreshBoundToken(item)"
                  class="btn btn-success"
                  :disabled="refreshingBoundTokenId === item.bound_token.id"
                >
                  <i :class="['bi', refreshingBoundTokenId === item.bound_token.id ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"></i>
                </button>
                <button
                  v-if="item.bound_token"
                  @click="editBoundToken(item)"
                  class="btn btn-warning"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  v-if="item.bound_token"
                  @click="deleteBoundToken(item)"
                  class="btn btn-danger"
                >
                  <i class="bi bi-trash"></i>
                </button>

              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="displayedCardsCount < allComprehensiveItems.length" class="col-12 text-center mt-4">
          <button
            @click="loadMoreCards"
            class="btn btn-outline-primary btn-lg"
            :disabled="isLoadingMore"
          >
            <i v-if="isLoadingMore" class="bi bi-arrow-clockwise refresh-spin me-2"></i>
            <i v-else class="bi bi-plus-lg me-2"></i>
            {{ isLoadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="row">
        <div class="col-12">
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
                      <th>邮箱备注/激活码</th>
                      <th>Token状态</th>
                      <th>激活码状态</th>
                      <th>时间</th>
                      <th class="w-1">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="comprehensiveItems.length === 0">
                      <td :colspan="isBatchSelectMode ? 6 : 5" class="text-center py-4 text-muted">
                        暂无 Token 数据
                      </td>
                    </tr>
                    <tr v-else v-for="item in comprehensiveItems" :key="item.id">
                      <td v-if="isBatchSelectMode" class="w-1">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :checked="selectedItems.has(item.id)"
                          @change="toggleSelectItem(item.id)"
                        />
                      </td>
                      <td :class="{
                        'public-cell-bound': item.bound_token && item.bound_token.public === 'yes' && (item.type === 'activation' || (item.type === 'token' && item.activation_code && item.activation_code !== '未绑定激活码' && getTokenStatus(item.bound_token) === '正常')),
                        'public-cell-unbound': item.bound_token && item.bound_token.public === 'yes' && item.type === 'token' && (!item.activation_code || item.activation_code === '未绑定激活码'),
                        'public-cell-suspended': item.bound_token && item.bound_token.public === 'yes' && getTokenStatus(item.bound_token) === '暂停',
                        'public-cell-invalid': item.bound_token && item.bound_token.public === 'yes' && (getTokenStatus(item.bound_token) === '失效' || getTokenStatus(item.bound_token) === '耗尽')
                      }">
                        <div class="d-flex flex-column">
                          <div class="fw-bold">
                            {{ formatEmailNote(item.email_note) }}
                          </div>
                          <div
                            class="text-muted small cursor-pointer"
                            :title="item.activation_code + ' (点击复制完整激活码)'"
                            @click="copyActivationCode(item)"
                          >
                            <i class="bi bi-credit-card me-1"></i>
                            {{ formatActivationCode(item.activation_code) }}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div v-if="item.bound_token" class="small">
                          <div>
                            <span
                              :class="['badge', 'badge-sm', 'cursor-pointer',
                                refreshingTokenId === item.bound_token.id ? 'bg-warning text-dark' : getTokenStatusClass(item.bound_token)]"
                              :title="refreshingTokenId === item.bound_token.id ? '刷新中' : '点击刷新Token状态'"
                              @click="showRefreshTokenModal(item.bound_token.id)"
                            >
                              <i
                                v-if="refreshingTokenId === item.bound_token.id"
                                class="bi bi-arrow-clockwise refresh-spin me-1"
                              ></i>
                              {{ refreshingTokenId === item.bound_token.id ? '刷新中' : getTokenStatusText(item.bound_token) }}
                            </span>
                          </div>
                          <div class="mt-1">
                            <span :class="getDaysColorClass(item.bound_token)">
                              {{ formatRemainingTime(item.bound_token) }}
                            </span>
                            <span class="text-muted">/</span>
                            <span :class="getCreditsColorClass(getRemainingCredits(item.bound_token))">
                              {{ getRemainingCredits(item.bound_token) === '-' ? '-' : getRemainingCredits(item.bound_token) + '次' }}
                            </span>
                          </div>
                        </div>
                        <div v-else class="text-muted">未绑定Token</div>
                      </td>
                      <td>
                        <span
                          v-if="item.type === 'activation'"
                          :class="getActivationStatusClass(item)"
                          @click="item.bound_token_id ? showDeleteCardModal(item) : null"
                          :style="item.bound_token_id ? 'cursor: pointer;' : ''"
                          :title="item.bound_token_id ? '点击删除激活码' : ''"
                        >
                          {{ getActivationStatusText(item) }}
                        </span>
                        <span
                          v-else-if="item.type === 'token'"
                          class="badge bg-primary text-white cursor-pointer"
                          @click="generateActivationCode(item)"
                          :style="generatingCodeFor === item.id ? 'pointer-events: none;' : ''"
                          :title="'点击生成激活码'"
                        >
                          <i v-if="generatingCodeFor === item.id" class="bi bi-arrow-clockwise refresh-spin me-1"></i>
                          {{ generatingCodeFor === item.id ? '生成中...' : '生成激活码' }}
                        </span>
                      </td>
                      <td>
                        <div class="small">
                          <div v-if="item.bound_token" class="text-muted">
                            创建: {{ formatDate(item.bound_token.created_at) }}
                          </div>
                          <div v-if="item.type === 'activation' && item.used_at" class="text-primary">
                            使用: {{ formatDate(item.used_at) }}
                          </div>
                          <div v-if="item.type === 'activation' && item.is_used && item.used_by" class="text-muted">
                            <span :title="item.used_by" style="cursor: help;">
                              用户: {{ formatUUID(item.used_by) }}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            v-if="item.bound_token"
                            class="btn btn-primary"
                            @click="executeToken(item.bound_token)"
                            title="执行Token"
                          >
                            <i class="bi bi-play-fill me-sm-1"></i>
                            <span class="d-none d-sm-inline">执行</span>
                          </button>
                          <button
                            v-if="item.bound_token"
                            class="btn btn-outline-primary"
                            @click="refreshBoundToken(item)"
                            :disabled="refreshingBoundTokenId === item.bound_token.id"
                            title="刷新Token次数"
                          >
                            <i :class="['bi', 'me-sm-1', refreshingBoundTokenId === item.bound_token.id ? 'bi-arrow-clockwise refresh-spin' : 'bi-arrow-clockwise']"></i>
                            <span class="d-none d-sm-inline">刷新</span>
                          </button>
                          <button
                            v-if="item.bound_token"
                            class="btn btn-outline-warning"
                            @click="editBoundToken(item)"
                            title="编辑Token"
                          >
                            <i class="bi bi-pencil me-sm-1"></i>
                            <span class="d-none d-sm-inline">编辑</span>
                          </button>
                          <button
                            v-if="item.bound_token"
                            class="btn btn-outline-danger"
                            @click="deleteBoundToken(item)"
                            title="删除Token"
                          >
                            <i class="bi bi-trash me-sm-1"></i>
                            <span class="d-none d-sm-inline">删除</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
            <!-- 分页器 -->
            <div class="card-footer d-flex align-items-center" v-if="totalPages > 1">
              <p class="m-0 text-muted">
                显示第 {{ (currentPage - 1) * itemsPerPage + 1 }} 到
                {{ Math.min(currentPage * itemsPerPage, totalItems) }} 条，
                共 {{ totalItems }} 条记录
              </p>
              <ul class="pagination m-0 ms-auto">
                <li :class="['page-item', currentPage === 1 ? 'disabled' : '']">
                  <button
                    class="page-link"
                    @click="currentPage = 1"
                    :disabled="currentPage === 1"
                  >
                    <i class="bi bi-chevron-left"></i>
                    上一页
                  </button>
                </li>
                <li
                  v-for="page in getVisiblePages()"
                  :key="page"
                  :class="['page-item', page === currentPage ? 'active' : '']"
                >
                  <button class="page-link" @click="currentPage = page">
                    {{ page }}
                  </button>
                </li>
                <li :class="['page-item', currentPage === totalPages ? 'disabled' : '']">
                  <button
                    class="page-link"
                    @click="currentPage++"
                    :disabled="currentPage === totalPages"
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
    </div>
  </div>

  <!-- 确认刷新Token模态框 -->
  <Transition name="modal-animate" appear>
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
  </Transition>

  <!-- 确认删除激活码模态框 -->
  <Transition name="modal-animate" appear>
    <div v-if="showDeleteModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-danger" role="alert">
              <div class="d-flex">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 9v2m0 4v.01"/>
                    <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/>
                  </svg>
                </div>
                <div>
                  <h4 class="alert-title">确定要删除这个激活码吗？</h4>
                  <div class="text-muted">此操作不可撤销！</div>
                </div>
              </div>
            </div>
            <div v-if="deletingCard" class="text-muted small">
              <strong>激活码：</strong>{{ formatActivationCode(deletingCard.id) }}<br>
              <strong>状态：</strong>{{ getActivationStatusText(deletingCard) }}<br>
              <strong>邮箱备注：</strong>{{ deletingCard.bound_token?.email_note || '无备注' }}
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
              <i
                :class="['bi', 'me-1',
                  isDeleting ? 'bi-arrow-clockwise refresh-spin' : 'bi-trash']"
              ></i>
              {{ isDeleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 编辑Token模态框 -->
  <Transition name="modal-animate" appear>
    <div v-if="showEditTokenModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑 Token</h5>
            <button type="button" class="btn-close" @click="closeEditTokenModal"></button>
          </div>
          <div class="modal-body">
            <form id="edit-token-form" @submit.prevent="updateToken">
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
            <button type="button" class="btn me-auto" @click="closeEditTokenModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button type="submit" class="btn btn-primary" form="edit-token-form">
              <i class="bi bi-check-lg me-1"></i>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 删除Token确认模态框 -->
  <Transition name="modal-animate" appear>
    <div v-if="showDeleteTokenModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button type="button" class="btn-close" @click="closeDeleteTokenModal"></button>
          </div>
          <div class="modal-body">
            <p>确定要删除这个 Token 吗？</p>
            <div class="text-muted small">
              <strong>邮箱备注：</strong>{{ deletingToken?.email_note }}<br>
              <strong>创建时间：</strong>{{ deletingToken?.created_at }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeDeleteTokenModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="confirmDeleteToken">
              <i class="bi bi-trash-fill me-1"></i>
              删除
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
              <strong>将要验证：</strong>{{ tokens.length }} 个Token<br>
              <strong>验证方式：</strong>采用单线程验证方式，每个Token间隔500ms
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
              <i :class="['bi', 'me-1', isBatchValidating ? 'bi-arrow-clockwise refresh-spin' : 'bi-check-circle']"></i>
              {{ isBatchValidating ? '验证中...' : '确认验证' }}
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
            <button type="button" class="btn-close" @click="closeValidateTokenModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning" role="alert">
              <div class="d-flex">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="m12 9v4"/>
                    <path d="m10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"/>
                    <path d="m12 16h.01"/>
                  </svg>
                </div>
                <div>
                  <h4 class="alert-title">验证 Token 状态可能会导致 Token 失效！</h4>
                  <div class="text-muted">请谨慎操作！</div>
                </div>
              </div>
            </div>
            <div class="text-muted small">
              <strong>将要验证的Token：</strong>{{ validatingToken?.email_note || '未设置备注' }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeValidateTokenModal">
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

  <!-- 批量刷新确认模态框 -->
  <Transition name="modal-animate" appear>
    <div v-if="showBatchRefreshConfirmModal" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认批量刷新</h5>
            <button type="button" class="btn-close" @click="closeBatchRefreshConfirmModal"></button>
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
              <strong>将要刷新：</strong>{{ tokens.length }} 个Token<br>
              <strong>刷新方式：</strong>采用多线程刷新.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn me-auto" @click="closeBatchRefreshConfirmModal">
              <i class="bi bi-x-lg me-1"></i>
              取消
            </button>
            <button type="button" class="btn btn-secondary" @click="confirmBatchRefresh">
              <i class="bi bi-arrow-clockwise me-1"></i>
              确认刷新
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>

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

      <!-- 统计信息 -->
      <div class="progress-stats">
        <small class="text-muted">
          {{ progressStats }}
        </small>
      </div>
    </div>
  </div>

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
          <div class="modern-steps-wrapper mb-4">
            <div class="modern-steps">
              <div class="modern-step" :class="{ 'step-active': getTokenStep >= 1, 'step-completed': getTokenStep > 1 }">
                <div class="step-circle">
                  <i v-if="getTokenStep > 1" class="bi bi-check-lg step-icon"></i>
                  <span v-else class="step-number">1</span>
                </div>
                <div class="step-content">
                  <div class="step-title">生成授权URL</div>
                  <div class="step-desc">获取OAuth授权链接</div>
                </div>
              </div>

              <div class="step-connector" :class="{ 'connector-active': getTokenStep > 1 }">
                <div class="connector-line"></div>
              </div>

              <div class="modern-step" :class="{ 'step-active': getTokenStep >= 2, 'step-completed': getTokenStep > 2 }">
                <div class="step-circle">
                  <i v-if="getTokenStep > 2" class="bi bi-check-lg step-icon"></i>
                  <span v-else class="step-number">2</span>
                </div>
                <div class="step-content">
                  <div class="step-title">输入授权响应</div>
                  <div class="step-desc">填写授权返回信息</div>
                </div>
              </div>

              <div class="step-connector" :class="{ 'connector-active': getTokenStep > 2 }">
                <div class="connector-line"></div>
              </div>

              <div class="modern-step" :class="{ 'step-active': getTokenStep >= 3 }">
                <div class="step-circle">
                  <span class="step-number">3</span>
                </div>
                <div class="step-content">
                  <div class="step-title">确认并保存</div>
                  <div class="step-desc">验证信息并保存Token</div>
                </div>
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
                >
                  <i class="bi bi-clipboard me-1"></i>
                  复制
                </button>
              </div>
              <div class="form-hint mt-1">
                <i class="bi bi-info-circle me-1"></i>
                点击生成按钮获取授权URL，然后复制到浏览器中完成授权
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
                placeholder="https://example.portal.augmentcode.com/"
              >
            </div>
          </div>

          <!-- 第三步：确认信息并保存Token -->
          <div v-if="getTokenStep === 3">
            <h6 class="mb-3">第三步：确认信息并保存Token</h6>
            <div v-if="tokenData.tenant_url">
              <div class="alert alert-success">
                <p class="mb-0">Token获取成功！</p>
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
                  <label class="form-label">Portal URL（可选）</label>
                  <input
                    type="text"
                    v-model="tokenData.portal_url"
                    class="form-control"
                    placeholder="请输入 Portal URL（可选）"
                  >
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

  <!-- 导出数据模态框 -->
  <ExportModal
    :show="showExportModal"
    :selected-count="selectedCount"
    :export-data="exportData"
    @close="closeExportModal"
  />

  <!-- 堆叠式悬浮按钮组（包含批量刷新和批量验证功能） -->
  <StackedFloatingButtons
    :show-batch-refresh="true"
    :is-batch-refreshing="isBatchRefreshing"
    :show-batch-validate="true"
    :is-batch-validating="isBatchValidating"
    @batch-refresh="showBatchRefreshConfirm"
    @batch-validate="validateAllTokens"
  />
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
            您没有访问综合管理功能的权限，请联系管理员获取相应权限。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api'
import { toast } from '../utils/toast'
import StackedFloatingButtons from '../components/StackedFloatingButtons.vue'
import ExportModal from '../components/ExportModal.vue'
import { useBatchSelect } from '../composables/useBatchSelect'
import { PermissionManager } from '../types/permissions'

const router = useRouter()

// 权限检查
const hasPermission = computed(() => PermissionManager.hasComprehensiveManagement())



// 监听权限变化，无权限时跳转到 Token 管理
watch(hasPermission, (newValue) => {
  if (!newValue && PermissionManager.hasTokenManagement()) {
    router.replace('/tokens')
  }
}, { immediate: true })

// 数据
const activationCards = ref<any[]>([])
const tokens = ref<any[]>([])
const generatingCodeFor = ref<string | null>(null)
const deactivatingCardId = ref<string | null>(null)
const showRefreshModal = ref(false)
const refreshingToken = ref<any>(null)
const refreshingTokenId = ref<string | null>(null)
const showDeleteModal = ref(false)
const deletingCard = ref<any>(null)
const isDeleting = ref(false)
const refreshingBoundTokenId = ref<string | null>(null)
const showEditTokenModal = ref(false)
const showDeleteTokenModal = ref(false)
const editingToken = ref<any>({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: ''
})
const deletingToken = ref<any>(null)
const isBatchRefreshing = ref(false)
const showAddModal = ref(false)
const showBatchRefreshConfirmModal = ref(false)
const newToken = ref({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: ''
})
const showBatchValidateModal = ref(false)
const isBatchValidating = ref(false)
const batchValidateResults = ref({
  valid: 0,
  invalid: 0,
  failed: 0,
  total: 0,
  completed: 0
})
// 单个Token验证相关
const showValidateConfirmModal = ref(false)
const validatingToken = ref<any>(null)
const validatingTokenId = ref<string | null>(null)
const showFloatingProgress = ref(false)
const batchRefreshResults = ref({
  success: 0,
  failed: 0,
  total: 0,
  completed: 0
})
const addTokenTab = ref<'single' | 'batch'>('single')
const singleToken = ref({
  tenant_url: '',
  access_token: '',
  portal_url: '',
  email_note: ''
})
const batchImport = ref({
  type: 'csv' as 'csv' | 'json',
  csvFile: null as File | null,
  jsonData: ''
})
const isDragOver = ref(false)
const csvFileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)

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
  exportSelected: baseExportSelected,
  closeExportModal
} = useBatchSelect(() => allComprehensiveItems.value.filter(item => item.bound_token))





// 悬浮进度窗口计算属性
const progressTitle = computed(() => {
  if (isBatchRefreshing.value) return '批量刷新进行中'
  if (isBatchValidating.value) return '批量验证进行中'
  return '操作完成'
})

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

const progressStats = computed(() => {
  if (isBatchRefreshing.value) {
    return `成功: ${batchRefreshResults.value.success} | 失败: ${batchRefreshResults.value.failed}`
  }
  if (isBatchValidating.value) {
    return `有效: ${batchValidateResults.value.valid} | 失效: ${batchValidateResults.value.invalid} | 错误: ${batchValidateResults.value.failed}`
  }
  return '所有操作已完成'
})

// 隐藏悬浮进度窗口
const hideFloatingProgress = () => {
  showFloatingProgress.value = false
}

// 自定义导出方法（覆盖基础导出方法以处理综合管理的特殊逻辑）

const exportSelected = () => {
  const selectedItemsData = allComprehensiveItems.value.filter(item =>
    selectedItems.value.has(item.id) && item.bound_token
  )

  if (selectedItemsData.length === 0) {
    toast.warning('请选择至少一个有效的Token项目')
    return
  }

  const exportItems = selectedItemsData.map(item => ({
    tenant_url: item.bound_token.tenant_url || '',
    access_token: item.bound_token.access_token || '',
    portal_url: item.bound_token.portal_url || '',
    email_note: item.email_note || ''
  }))

  if (exportItems.length === 1) {
    exportData.value = JSON.stringify(exportItems[0], null, 2)
  } else {
    exportData.value = JSON.stringify(exportItems, null, 2)
  }

  showExportModal.value = true
}



// 获取Token流程相关数据
const showGetModal = ref(false)
const getTokenStep = ref(1)
const authUrl = ref('')
const authResponse = ref('')
const portalUrl = ref('')

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
const obtainedToken = ref('')
const isGettingToken = ref(false)
const codeChallenge = ref('')
const codeVerifier = ref('')
const state = ref('')
const isGeneratingUrl = ref(false)
const lastGenerateTime = ref(0)
const generateCooldown = 10000 // 10秒冷却时间
const currentTime = ref(Date.now()) // 当前时间，用于触发响应式更新
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

// 筛选状态
const activeFilter = ref<string | null>(null)

// 分页状态
const currentPage = ref(1)
const itemsPerPage = 12
const isLoadingMore = ref(false)

// 卡片模式显示数量控制
const displayedCardsCount = ref(12) // 初始显示12张卡片
const cardsPerLoad = 12 // 每次加载12张新卡片

// 视图模式 - 从本地存储读取，默认为表格视图
const viewMode = ref<'card' | 'table'>(
  (localStorage.getItem('comprehensive-manager-view-mode') as 'card' | 'table') || 'table'
)

// 监听视图模式变化，保存到本地存储
watch(viewMode, (newMode) => {
  localStorage.setItem('comprehensive-manager-view-mode', newMode)
  // 切换到卡片模式时重置显示数量
  if (newMode === 'card') {
    displayedCardsCount.value = 12
  }
}, { immediate: false })

// 隐私模式 - 从本地存储读取，默认为false（显示完整信息）
const privacyMode = ref<boolean>(
  localStorage.getItem('comprehensive-manager-privacy-mode') === 'true'
)

// 监听隐私模式变化，保存到本地存储
watch(privacyMode, (newMode) => {
  localStorage.setItem('comprehensive-manager-privacy-mode', newMode.toString())
}, { immediate: false })

// 执行模态框状态
const showExecuteModal = ref(false)
const currentExecuteToken = ref<any>(null)
const isExecuting = ref(false)

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

// 计算属性
const canImport = computed(() => {
  if (batchImport.value.type === 'csv') {
    return batchImport.value.csvFile !== null
  } else {
    return batchImport.value.jsonData.trim() !== ''
  }
})

// 加载Token数据
const loadTokens = async () => {
  try {
    const response = await apiGet('/api/tokens?limit=10000')
    if (response.success) {
      // 直接使用API返回的数据，当data为null时使用空数组
      tokens.value = response.data || []
    } else {
      toast.error(response.error || '加载Token失败')
    }
  } catch (error) {
    toast.error('加载Token失败')
  }
}

// 加载激活码数据
const loadActivationCards = async () => {
  try {
    const response = await apiGet('/api/recharge-cards?limit=1000')
    if (response.success) {
      // 直接使用API返回的数据，当data为null时使用空数组
      activationCards.value = response.data || []
    } else {
      toast.error(response.error || '加载激活码失败')
    }
  } catch (error) {
    toast.error('加载激活码失败')
  }
}



// 综合统计
const comprehensiveStats = computed(() => {
  // Token总数
  const totalTokens = tokens.value.length

  // 有效Token
  const validTokens = tokens.value.filter(t => getTokenStatus(t) === '正常').length

  // 即将到期(2天内)
  const expiringTokens = tokens.value.filter(t => {
    const timeInfo = calculateRemainingTime(t)
    return getTokenStatus(t) === '正常' && timeInfo.totalDays <= 2
  }).length

  // 已失效
  const invalidTokens = tokens.value.filter(t => ['失效', '暂停', '耗尽'].includes(getTokenStatus(t))).length

  // 绑定总数(激活码) - 只计算已绑定并且已激活的
  const boundActivations = activationCards.value.filter(c => c.bound_token_id && c.is_used).length

  // 空闲总数：未使用的激活码 + 未生成激活码的正常Token
  const unusedActivationCards = activationCards.value.filter(c => !c.is_used && getTokenStatus(tokens.value.find(t => t.id === c.bound_token_id)) === '正常').length
  const unboundNormalTokens = tokens.value.filter(t => {
    const hasActivationCard = activationCards.value.some(c => c.bound_token_id === t.id)
    return !hasActivationCard && getTokenStatus(t) === '正常'
  }).length
  const unusedActivations = unusedActivationCards + unboundNormalTokens

  // 有效次数总数 - 计算所有有效Token的剩余次数总和
  const totalValidCredits = tokens.value
    .filter(t => getTokenStatus(t) === '正常')
    .reduce((total, token) => {
      const credits = getRemainingCredits(token)
      const creditsNum = credits === '-' ? 0 : parseInt(credits) || 0
      return total + creditsNum
    }, 0)

  return {
    totalTokens,
    validTokens,
    expiringTokens,
    invalidTokens,
    boundActivations,
    unusedActivations,
    totalValidCredits
  }
})

// 综合数据项 - 按Token顺序显示，保持与Token管理页面一致
const allComprehensiveItems = computed(() => {
  const items: any[] = []

  // 按Token的原始顺序遍历，保持与Token管理页面一致
  tokens.value.forEach(token => {
    // 查找绑定的激活码
    const boundCard = activationCards.value.find(card => card.bound_token_id === token.id)

    if (boundCard) {
      // 如果有绑定的激活码，显示激活码项目
      items.push({
        ...boundCard,
        type: 'activation',
        bound_token: token,
        activation_code: boundCard.id,
        email_note: token.email_note || '未设置'
      })
    } else {
      // 如果没有绑定激活码，显示Token项目
      items.push({
        id: `token-${token.id}`,
        type: 'token',
        bound_token: token,
        activation_code: '未绑定激活码',
        email_note: token.email_note || '未设置',
        is_used: false
      })
    }
  })

  // 应用筛选
  if (!activeFilter.value) {
    return items
  }

  return items.filter(item => {
    const token = item.bound_token
    if (!token) return false

    const tokenStatus = getTokenStatus(token)
    const timeInfo = calculateRemainingTime(token)

    switch (activeFilter.value) {
      case '有效':
        return tokenStatus === '正常'
      case '即将到期':
        return tokenStatus === '正常' && timeInfo.totalDays <= 2
      case '已失效':
        return ['失效', '暂停', '耗尽'].includes(tokenStatus)
      case '绑定':
        return item.type === 'activation' && item.bound_token_id && item.is_used
      case '未使用':
        // 空闲筛选：待使用的激活码 + 未生成激活码的Token + 状态为正常的
        if (item.type === 'activation') {
          // 激活码：未使用且状态正常
          return !item.is_used && tokenStatus === '正常'
        } else {
          // Token：未生成激活码且状态正常
          return item.type === 'token' && tokenStatus === '正常'
        }
      default:
        return true
    }
  })
})

// 分页相关计算属性
const totalItems = computed(() => allComprehensiveItems.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// 当前页的数据
const comprehensiveItems = computed(() => {
  if (viewMode.value === 'card') {
    // 卡片模式：显示前 displayedCardsCount 张卡片
    return allComprehensiveItems.value.slice(0, displayedCardsCount.value)
  } else {
    // 表格模式：使用分页
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return allComprehensiveItems.value.slice(start, end)
  }
})



// Token状态判断和信息获取
const getTokenStatus = (token: any): '正常' | '失效' | '未验证' | '耗尽' | '暂停' => {
  if (!token) return '失效'

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
    if (token.ban_status === '"SUSPENDED"') {
      return '暂停'
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

// 计算剩余时间
const calculateRemainingTime = (token: any) => {
  if (!token || !token.portal_info) {
    return { totalDays: 0, days: 0, hours: 0, minutes: 0 }
  }

  try {
    const portalInfo = JSON.parse(token.portal_info)
    const expiryDate = portalInfo.expiry_date

    if (!expiryDate) {
      return { totalDays: 0, days: 0, hours: 0, minutes: 0 }
    }

    const now = new Date()
    const expiration = new Date(expiryDate)
    const diffMs = expiration.getTime() - now.getTime()

    if (diffMs <= 0) {
      return { totalDays: 0, days: 0, hours: 0, minutes: 0 }
    }

    const totalDays = diffMs / (1000 * 60 * 60 * 24)
    const days = Math.floor(totalDays)
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    return { totalDays, days, hours, minutes }
  } catch (error) {
    return { totalDays: 0, days: 0, hours: 0, minutes: 0 }
  }
}

// 格式化剩余时间显示
const formatRemainingTime = (token: any): string => {
  const timeInfo = calculateRemainingTime(token)

  if (timeInfo.totalDays <= 0) {
    return '已过期'
  }

  if (timeInfo.days > 0) {
    return `${timeInfo.days}天${timeInfo.hours}小时`
  } else if (timeInfo.hours > 0) {
    return `${timeInfo.hours}小时${timeInfo.minutes}分钟`
  } else {
    return `${timeInfo.minutes}分钟`
  }
}

// 获取剩余次数
const getRemainingCredits = (token: any): string => {
  if (!token || !token.portal_info) {
    return '-'
  }

  try {
    const portalInfo = JSON.parse(token.portal_info)
    const creditsBalance = portalInfo.credits_balance

    if (typeof creditsBalance === 'number') {
      return creditsBalance.toString()
    }

    return '-'
  } catch (error) {
    return '-'
  }
}

const getTokenStatusText = (token: any): string => {
  return getTokenStatus(token)
}

const getTokenStatusClass = (token: any): string => {
  const status = getTokenStatus(token)
  switch (status) {
    case '正常': return 'bg-success text-white'
    case '失效': return 'bg-danger text-white'
    case '暂停': return 'bg-danger text-white'
    case '耗尽': return 'bg-warning text-white'
    case '未验证': return 'bg-secondary text-white'
    default: return 'bg-secondary text-white'
  }
}

// 激活码状态样式
const getCardStatusClass = (isUsed: boolean): string => {
  return isUsed ? 'badge bg-secondary' : 'badge bg-success'
}

// 激活码绑定状态
const getActivationStatusText = (item: any): string => {
  if (item.bound_token_id) {
    return item.is_used ? '已绑定' : '待使用'
  }
  return '未绑定'
}

const getActivationStatusClass = (item: any): string => {
  if (item.bound_token_id) {
    return item.is_used ? 'badge bg-success text-white' : 'badge bg-warning text-dark'
  }
  return 'badge bg-light text-muted'
}

// 根据剩余时间获取颜色类
const getDaysColorClass = (token: any): string => {
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

// 格式化激活码显示
const formatActivationCode = (code: string): string => {
  if (!code) return ''

  if (!privacyMode.value) {
    // 非隐私模式：显示前4位和后4位，中间用*代替
    if (code.length > 8) {
      return `${code.substring(0, 4)}****${code.substring(code.length - 4)}`
    }
    return code
  } else {
    // 隐私模式：只显示前4个字符和后4个字符，中间用*代替
    if (code.length <= 8) {
      return code.substring(0, 2) + '*'.repeat(Math.max(4, code.length - 4)) + code.substring(Math.max(2, code.length - 2))
    }
    return code.substring(0, 4) + '*'.repeat(code.length - 8) + code.substring(code.length - 4)
  }
}

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 格式化UUID（显示开头8位和末尾4位）
const formatUUID = (uuid: string): string => {
  if (!uuid || uuid.length < 12) return uuid
  const start = uuid.substring(0, 8)
  const end = uuid.substring(uuid.length - 4)
  return `${start}-**-${end}`
}

// 复制激活码到剪贴板
const copyActivationCode = async (item: any) => {
  if (!item.activation_code || item.activation_code === '未绑定激活码') return

  // 获取天数和次数信息
  let daysText = '0天'
  if (item.bound_token) {
    const timeInfo = calculateRemainingTime(item.bound_token)
    const credits = getRemainingCredits(item.bound_token)

    // 计算包含小时的时间文本
    let timeText = ''
    if (timeInfo.totalDays > 0) {
      if (timeInfo.days > 0 && timeInfo.hours > 0) {
        timeText = `${timeInfo.days}天${timeInfo.hours}小时`
      } else if (timeInfo.days > 0) {
        timeText = `${timeInfo.days}天`
      } else if (timeInfo.hours > 0) {
        timeText = `${timeInfo.hours}小时`
      } else {
        timeText = '不足1小时'
      }
    }

    if (timeText && credits !== '-') {
      daysText = `${timeText} ${credits}次`
    } else if (timeText) {
      daysText = timeText
    } else if (credits !== '-') {
      daysText = `${credits}次`
    }
  }

  try {
    const copyText = `激活码: ${item.activation_code}
--- ${daysText} ---
先到先得, 用法自己研究.`

    await navigator.clipboard.writeText(copyText)
    toast.success('激活码已复制到剪贴板')
  } catch (error) {

    // 降级方案：使用传统的复制方法
    try {
      const copyText = `激活码: ${item.activation_code}
--- ${daysText} ---
先到先得, 用法自己研究.`

      const textArea = document.createElement('textarea')
      textArea.value = copyText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      toast.success('激活码已复制到剪贴板')
    } catch (fallbackError) {
      toast.error('复制失败，请手动复制')
    }
  }
}

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
    const response = await apiPost(`/api/tokens/${tokenId}/validate`)

    if (response.success) {
      // 根据 valid 字段判断Token状态
      const responseWithValid = response as any
      if (responseWithValid.valid === true) {
        toast.success('Token状态刷新成功 - 状态有效')
      } else if (responseWithValid.valid === false) {
        toast.warning('Token状态刷新成功 - 状态失效')
      } else {
        toast.error('Token状态刷新异常')
      }

      // 重新加载Token数据
      await loadTokens()
      closeRefreshModal()
    } else {
      toast.error(response.error || 'Token状态刷新失败')
    }
  } catch (error) {
    toast.error('Token状态刷新失败')
  } finally {
    refreshingTokenId.value = null
  }
}

// 刷新Token次数（操作按钮）
const refreshBoundToken = async (item: any) => {
  if (!item.bound_token) return

  const tokenId = item.bound_token.id
  refreshingBoundTokenId.value = tokenId

  try {
    const response = await apiPost(`/api/tokens/${tokenId}/refresh`)

    if (response.success) {
      toast.success('Token次数刷新成功')
      // 重新加载Token数据
      await loadTokens()
    } else {
      toast.error(response.error || 'Token次数刷新失败')
    }
  } catch (error) {
    toast.error('Token次数刷新失败')
  } finally {
    refreshingBoundTokenId.value = null
  }
}

// 编辑Token
const editBoundToken = async (item: any) => {
  if (!item.bound_token) return

  try {
    const response = await apiGet(`/api/tokens/${item.bound_token.id}`)

    if (response.success) {
      editingToken.value = {
        id: response.data.id,
        tenant_url: response.data.tenant_url,
        access_token: response.data.access_token,
        portal_url: response.data.portal_url,
        email_note: response.data.email_note
      }
      showEditTokenModal.value = true
    } else {
      toast.error(response.error || 'Token信息获取失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  }
}

// 关闭编辑模态框
const closeEditTokenModal = () => {
  showEditTokenModal.value = false
  editingToken.value = {
    tenant_url: '',
    access_token: '',
    portal_url: '',
    email_note: ''
  }
}

// 更新Token
const updateToken = async () => {
  if (!editingToken.value.id) {
    toast.error('Token ID缺失')
    return
  }

  try {
    const requestData = {
      tenant_url: editingToken.value.tenant_url,
      access_token: editingToken.value.access_token,
      portal_url: editingToken.value.portal_url,
      email_note: editingToken.value.email_note
    }

    const response = await apiPut(`/api/tokens/${editingToken.value.id}`, requestData)

    if (response.success) {
      toast.success('Token更新成功')
      await loadTokens()
      closeEditTokenModal()
    } else {
      toast.error(response.error || 'Token更新失败')
    }
  } catch (error) {
    toast.error(`Token更新失败: ${(error as any)?.message || '网络错误'}`)
  }
}

// 删除Token
const deleteBoundToken = (item: any) => {
  if (!item.bound_token) return
  deletingToken.value = item.bound_token
  showDeleteTokenModal.value = true
}

// 关闭删除Token模态框
const closeDeleteTokenModal = () => {
  showDeleteTokenModal.value = false
  deletingToken.value = null
}

// 确认删除Token
const confirmDeleteToken = async () => {
  if (!deletingToken.value) return

  try {
    const response = await apiDelete(`/api/tokens/${deletingToken.value.id}`)

    if (response.success) {
      toast.success('Token删除成功')
      await loadTokens()
      closeDeleteTokenModal()
    } else {
      toast.error(response.error || 'Token删除失败')
    }
  } catch (error) {
    toast.error('Token删除失败')
  }
}

// 验证所有Token
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
    total: tokens.value.length,
    completed: 0
  }

  showBatchValidateModal.value = true
}

// 关闭批量验证模态框
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

// 确认批量验证
const confirmBatchValidate = async () => {
  if (isBatchValidating.value) return

  // 立即关闭模态框
  closeBatchValidateModal()

  // 显示悬浮进度窗口
  showFloatingProgress.value = true

  isBatchValidating.value = true

  // 重置结果
  batchValidateResults.value = {
    valid: 0,
    invalid: 0,
    failed: 0,
    total: tokens.value.length,
    completed: 0
  }

  // 创建验证单个Token的函数
  const validateSingleToken = async (token: any) => {
    try {
      const response = await apiPost(`/api/tokens/${token.id}/validate`)

      if (response.success) {
        // 根据响应的 valid 字段判断Token是否有效
        // valid 字段在响应根级别，不在 data 中
        const responseWithValid = response as any
        let isValid = false
        if (responseWithValid.valid === true) {
          isValid = true
        } else if (responseWithValid.valid === false) {
          isValid = false
        } else {
          // 其他状态表示错误
          return {
            success: false,
            valid: false,
            token: token,
            error: '验证状态异常'
          }
        }

        return {
          success: true,
          valid: isValid,
          token: token,
          data: response.data
        }
      } else {
        return {
          success: false,
          valid: false,
          token: token,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        valid: false,
        token: token,
        error: (error as any)?.message
      }
    }
  }

  // 处理单个Token验证结果
  const processSingleResult = async (token: any) => {
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
    for (let i = 0; i < tokens.value.length; i++) {
      const token = tokens.value[i]

      await processSingleResult(token)

      // 间隔500ms
      if (i < tokens.value.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  } catch (error) {
    toast.error('批量验证过程中出错')
  }

  isBatchValidating.value = false

  // 显示结果
  const { valid, invalid, failed, total } = batchValidateResults.value
  toast.success(`批量验证完成！有效: ${valid}, 失效: ${invalid}, 错误: ${failed}, 总计: ${total}`)

  // 重新加载Token数据
  await loadTokens()

  // 3秒后自动隐藏悬浮进度窗口
  setTimeout(() => {
    showFloatingProgress.value = false
  }, 3000)
}

// 单个Token验证相关函数
const showValidateTokenModal = (token: any) => {
  validatingToken.value = token
  showValidateConfirmModal.value = true
}

const closeValidateTokenModal = () => {
  showValidateConfirmModal.value = false
  validatingToken.value = null
  validatingTokenId.value = null
}

const confirmValidateToken = async () => {
  if (!validatingToken.value) {
    return
  }

  const tokenToValidate = validatingToken.value

  // 立即关闭模态框，但保持validatingTokenId用于显示验证状态
  showValidateConfirmModal.value = false

  // 开始验证
  validatingTokenId.value = tokenToValidate.id

  try {
    const response = await fetch(`/api/tokens/${tokenToValidate.id}/validate`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      // 根据 valid 字段判断Token状态
      if (data.valid === true) {
        toast.success(data.message || 'Token 验证成功 - 状态有效')
      } else if (data.valid === false) {
        toast.warning(data.message || 'Token 验证完成 - 状态失效')
      } else {
        toast.error('Token 验证状态异常')
      }

      // 重新加载Token数据
      await loadTokens()
    } else {
      toast.error(data.error || data.message || 'Token 验证失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    validatingTokenId.value = null
    validatingToken.value = null
  }
}

// 显示批量刷新确认
const showBatchRefreshConfirm = () => {
  if (tokens.value.length === 0) {
    toast.error('没有Token需要刷新')
    return
  }

  showBatchRefreshConfirmModal.value = true
}

// 关闭批量刷新确认模态框
const closeBatchRefreshConfirmModal = () => {
  if (!isBatchRefreshing.value) {
    showBatchRefreshConfirmModal.value = false
    batchRefreshResults.value = {
      success: 0,
      failed: 0,
      total: 0,
      completed: 0
    }
  }
}

// 确认批量刷新
const confirmBatchRefresh = async () => {
  // 立即关闭模态框
  closeBatchRefreshConfirmModal()

  // 显示悬浮进度窗口
  showFloatingProgress.value = true

  isBatchRefreshing.value = true

  // 重置结果
  batchRefreshResults.value = {
    success: 0,
    failed: 0,
    total: tokens.value.length,
    completed: 0
  }

  // 创建刷新单个Token的函数
  const refreshSingleToken = async (token: any) => {
    try {
      const response = await apiPost(`/api/tokens/${token.id}/refresh`)

      if (response.success) {
        return { success: true, tokenId: token.id, data: response.data }
      } else {
        return { success: false, tokenId: token.id, error: response.error }
      }
    } catch (error) {
      return { success: false, tokenId: token.id, error: (error as any)?.message || '网络错误' }
    }
  }

  // 创建带进度跟踪的刷新函数
  const refreshSingleTokenWithProgress = async (token: any) => {
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
    // 将tokens分批处理
    const tokenBatches = []
    for (let i = 0; i < tokens.value.length; i += BATCH_SIZE) {
      tokenBatches.push(tokens.value.slice(i, i + BATCH_SIZE))
    }

    // 控制最大并发数的处理函数
    const processBatchesWithLimit = async (batches: any[][], maxConcurrent: number) => {
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
            batch.map((token: any) => refreshSingleTokenWithProgress(token))
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

  // 重新加载Token数据
  await loadTokens()

  // 3秒后自动隐藏悬浮进度窗口
  setTimeout(() => {
    showFloatingProgress.value = false
  }, 3000)
}

// 添加Token相关方法
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
    const response = await apiPost('/api/tokens', {
      tenant_url: singleToken.value.tenant_url,
      access_token: singleToken.value.access_token,
      portal_url: singleToken.value.portal_url,
      email_note: singleToken.value.email_note
    })

    if (response.success) {
      // 重置表单
      singleToken.value = {
        tenant_url: '',
        access_token: '',
        portal_url: '',
        email_note: ''
      }

      toast.success(response.message || 'Token 添加成功')
      closeAddModal()

      // 刷新数据以更新统计信息
      await loadTokens()
      window.dispatchEvent(new CustomEvent('tokenDataChanged'))
    } else {
      toast.error(response.error || 'Token 添加失败')
    }
  } catch (error) {
    toast.error('添加Token失败')
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

      const response = await apiPost('/api/tokens/batch-import', {
        tokens: validTokens
      })

      if (response.success) {
        toast.success(`批量导入完成，成功 ${response.data?.successful || validTokens.length} 条，失败 ${response.data?.failed || 0} 条`)
        closeAddModal()

        // 刷新数据
        await loadTokens()
        window.dispatchEvent(new CustomEvent('tokenDataChanged'))
      } else {
        toast.error(response.error || '批量导入失败')
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













// 生成激活码
const generateActivationCode = async (tokenItem: any) => {
  if (!tokenItem.bound_token) return

  generatingCodeFor.value = tokenItem.id

  try {
    const response = await apiPost('/api/recharge-cards', {
      card_type: 'token_binding',
      bound_token_id: tokenItem.bound_token.id,
      days: 0
    })

    if (response.success && response.data) {
      toast.success('激活码生成成功')
      // 重新加载数据以更新列表
      await loadActivationCards()
    } else {
      toast.error(response.error || '激活码生成失败')
    }
  } catch (error) {
    toast.error('激活码生成失败')
  } finally {
    generatingCodeFor.value = null
  }
}

// 显示删除激活码确认模态框
const showDeleteCardModal = (cardItem: any) => {
  deletingCard.value = cardItem
  showDeleteModal.value = true
}

// 关闭删除确认模态框
const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingCard.value = null
}

// 确认删除激活码
const confirmDelete = async () => {
  if (!deletingCard.value || isDeleting.value) return

  isDeleting.value = true

  try {
    const response = await apiDelete(`/api/recharge-cards/${deletingCard.value.id}`)

    if (response.success) {
      toast.success('激活码删除成功')
      // 重新加载数据以更新列表
      await loadActivationCards()
      closeDeleteModal()
    } else {
      toast.error(response.error || '激活码删除失败')
    }
  } catch (error) {
    toast.error('激活码删除失败')
  } finally {
    isDeleting.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadTokens()
  loadActivationCards()
})

// 获取Token相关方法
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
    toast.success('授权URL已复制到剪贴板')
  } catch (err) {
    toast.error('复制失败，请手动复制')
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
      await loadTokens()
      await loadActivationCards()
    } else {
      toast.error(data.error || 'Token保存失败')
    }
  } catch (error) {
    toast.error('网络错误，请重试')
  } finally {
    isSavingToken.value = false
  }
}

// 筛选方法
const setFilter = (filterType: string | null) => {
  if (activeFilter.value === filterType) {
    // 如果点击的是当前激活的筛选，则取消筛选
    activeFilter.value = null
  } else {
    // 否则设置新的筛选
    activeFilter.value = filterType
  }
  // 筛选后重置到第一页
  currentPage.value = 1
}

// 切换隐私模式
const togglePrivacyMode = () => {
  privacyMode.value = !privacyMode.value
}

// 格式化邮箱备注显示
const formatEmailNote = (emailNote: string) => {
  // 如果邮箱备注为空或者是默认的"未设置"，不管什么模式都显示相同内容
  if (!emailNote || emailNote === '未设置') {
    return '未设置备注'
  }

  // 非隐私模式，显示完整内容
  if (!privacyMode.value) {
    return emailNote
  }

  // 隐私模式下，不管多长，显示前3位和结尾5位，中间只用5个*号表示
  if (emailNote.length <= 8) {
    // 如果总长度不超过8位，显示前3位 + 5个*
    return emailNote.substring(0, Math.min(3, emailNote.length)) + '**@**'
  }

  // 总长度超过8位，显示前3位 + 5个* + 结尾5位
  return emailNote.substring(0, 3) + '**@**' + emailNote.substring(emailNote.length - 5)
}



// 分页方法
const getVisiblePages = () => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // 如果总页数不超过7页，显示所有页码
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 如果总页数超过7页，显示省略号
    if (current <= 4) {
      // 当前页在前4页
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // 省略号
      pages.push(total)
    } else if (current >= total - 3) {
      // 当前页在后4页
      pages.push(1)
      pages.push(-1) // 省略号
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 当前页在中间
      pages.push(1)
      pages.push(-1) // 省略号
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // 省略号
      pages.push(total)
    }
  }

  return pages.filter(page => page !== -1) // 暂时移除省略号，简化显示
}

// 加载更多卡片
const loadMoreCards = async () => {
  if (isLoadingMore.value || displayedCardsCount.value >= allComprehensiveItems.value.length) {
    return
  }

  isLoadingMore.value = true

  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 增加显示的卡片数量，最多增加9张
    const remainingCards = allComprehensiveItems.value.length - displayedCardsCount.value
    const cardsToAdd = Math.min(cardsPerLoad, remainingCards)
    displayedCardsCount.value += cardsToAdd
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    isLoadingMore.value = false
  }
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

// 执行Token
const executeToken = (token: any) => {
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

onUnmounted(() => {
  stopCooldownTimer()
  stopCountdown()  // 清理URL倒计时
})
</script>

<style scoped>
.card-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.card-sm:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.avatar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
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

.progress-stats {
  font-size: 12px;
  color: #6c757d;
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

/* 文件拖拽区域样式 */
.dropzone {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
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
  justify-content: center;
}

/* 现代化步骤指示器样式 */
.modern-steps-wrapper {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.modern-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modern-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 140px;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-number {
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
}

.step-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  line-height: 1;
}

.step-content {
  text-align: center;
}

.step-title {
  font-size: 14px;
  color: #495057;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: #6c757d;
  font-weight: 400;
  line-height: 1.2;
}

/* 激活状态 */
.step-active .step-circle {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(13, 110, 253, 0.3);
}

.step-active .step-title {
  color: #0d6efd;
  font-weight: 700;
}

.step-active .step-desc {
  color: #0d6efd;
  font-weight: 500;
}

/* 完成状态 */
.step-completed .step-circle {
  background: #198754;
  color: white;
  border-color: #198754;
  box-shadow: 0 4px 16px rgba(25, 135, 84, 0.3);
}

.step-completed .step-title {
  color: #198754;
  font-weight: 700;
}

.step-completed .step-desc {
  color: #198754;
  font-weight: 500;
}

/* 连接器样式 */
.step-connector {
  flex: 1;
  height: 4px;
  margin: 0 20px;
  margin-bottom: 60px;
  position: relative;
  z-index: 1;
}

.connector-line {
  width: 100%;
  height: 100%;
  background: #e9ecef;
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.connector-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background: #198754;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.connector-active .connector-line::before {
  width: 100%;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .modern-steps-wrapper {
    padding: 16px;
  }

  .modern-step {
    min-width: 100px;
  }

  .step-circle {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  .step-number {
    font-size: 16px;
  }

  .step-icon {
    font-size: 16px;
  }

  .step-title {
    font-size: 13px;
  }

  .step-desc {
    font-size: 11px;
  }

  .step-connector {
    margin: 0 12px;
    margin-bottom: 52px;
  }
}

@media (max-width: 576px) {
  .modern-steps-wrapper {
    padding: 12px;
  }

  .modern-step {
    min-width: 80px;
  }

  .step-circle {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .step-number {
    font-size: 14px;
  }

  .step-icon {
    font-size: 14px;
  }

  .step-title {
    font-size: 12px;
  }

  .step-desc {
    font-size: 10px;
  }

  .step-connector {
    margin: 0 8px;
    margin-bottom: 48px;
    height: 3px;
  }
}

/* 鼠标指针样式 */
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}

/* 应用卡片样式 */
.app-card {
  transition: all 0.2s ease-in-out;
  border: 1px solid var(--tblr-border-color);
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--tblr-primary);
}

.app-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.app-card.disabled:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--tblr-border-color);
}

.app-icon {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.app-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--tblr-dark);
}



/* 卡片视图专用样式 */
.row-cards .card {
  transition: all 0.2s ease-in-out;
  border: 1px solid var(--tblr-border-color);
  height: 100%;
}

.row-cards .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--tblr-primary);
}

/* 卡片中的badge优化 */
.row-cards .badge {
  font-size: 0.7rem; /* 减少badge字体大小 */
  padding: 0.2rem 0.4rem; /* 减少badge内边距 */
  border-radius: 0.25rem; /* 减少圆角 */
  font-weight: 500;
}

.row-cards .badge-sm {
  font-size: 0.65rem; /* 减少小badge字体大小 */
  padding: 0.15rem 0.3rem; /* 减少小badge内边距 */
}

/* 卡片中的按钮组优化 */
.row-cards .btn-list {
  gap: 0.25rem; /* 减少按钮间距 */
  margin-top: auto;
}

.row-cards .btn-list .btn {
  border-radius: 0.375rem;
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.row-cards .btn-list .btn i {
  font-size: 0.875rem;
}

/* 卡片中的文本优化 */
.row-cards .font-weight-medium {
  font-weight: 600;
  color: var(--tblr-dark);
  font-size: 0.875rem; /* 减少主标题字体大小 */
}

.row-cards .text-muted.small {
  font-size: 0.75rem; /* 减少小字体大小 */
  color: var(--tblr-muted);
}

/* 卡片头部文本截断优化 */
.row-cards .text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* 确保badge容器不会被压缩 */
.row-cards .flex-shrink-0 {
  flex-shrink: 0;
}

/* 卡片头部间距优化 */
.row-cards .d-flex.align-items-start .me-2 {
  margin-right: 0.5rem !important;
}

/* 卡片内容布局优化 */
.row-cards .card-body {
  display: flex;
  flex-direction: column;
  padding: 0.875rem; /* 减少内边距 */
}

.row-cards .card-body > div:not(:last-child) {
  margin-bottom: 0.5rem; /* 减少间距 */
}

/* 激活码显示优化 */
.row-cards .cursor-pointer {
  transition: color 0.2s ease;
}

.row-cards .cursor-pointer:hover {
  color: var(--tblr-primary);
}

/* 已绑定卡片的视觉效果 */
.bound-card {
  border: 2px solid #28a745 !important;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
  position: relative;
  transition: all 0.3s ease;
}

.bound-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #e8f5e8, #e3f2fd, #f3e5f5, #fff3e0);
  background-size: 400% 400%;
  border-radius: 8px;
  z-index: -1;
  animation: gradientShift 3s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.bound-card:hover::before {
  opacity: 0.3;
}

.bound-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.2);
  border-color: #20c997 !important;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 已绑定卡片内的特殊样式 */
.bound-card .text-primary {
  font-weight: 600;
  text-decoration: none;
}

.bound-card .text-primary:hover {
  color: #0056b3 !important;
  text-decoration: underline;
}

/* 未绑定卡片的视觉效果 */
.unbound-card {
  border: 2px dashed #ffc107 !important;
  background: linear-gradient(135deg, #fffbf0 0%, #ffffff 100%);
  position: relative;
  transition: all 0.3s ease;
}

.unbound-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #fff3e0, #fce4ec, #e8f5e8, #e3f2fd);
  background-size: 400% 400%;
  border-radius: 8px;
  z-index: -1;
  animation: gradientShift 3s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.unbound-card:hover::before {
  opacity: 0.4;
}

.unbound-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  border-color: #fd7e14 !important;
}

/* 未绑定卡片内的特殊样式 */
.unbound-card .text-primary {
  font-weight: 600;
  text-decoration: none;
  color: #fd7e14 !important;
}

.unbound-card .text-primary:hover {
  color: #e55a00 !important;
  text-decoration: underline;
}

/* 暂停卡片的视觉效果 */
.suspended-card {
  border: 2px solid #6c757d !important;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  position: relative;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.suspended-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #e9ecef, #dee2e6, #ced4da, #adb5bd);
  background-size: 400% 400%;
  border-radius: 8px;
  z-index: -1;
  animation: gradientShift 4s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.suspended-card:hover::before {
  opacity: 0.2;
}

.suspended-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(108, 117, 125, 0.2);
  border-color: #495057 !important;
  opacity: 1;
}

/* 失效卡片的视觉效果 */
.invalid-card {
  border: 2px solid #dc3545 !important;
  background: linear-gradient(135deg, #fdf2f2 0%, #ffffff 100%);
  position: relative;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.invalid-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #f8d7da, #f5c6cb, #f1b0b7, #ec5569);
  background-size: 400% 400%;
  border-radius: 8px;
  z-index: -1;
  animation: gradientShift 2s ease-in-out infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.invalid-card:hover::before {
  opacity: 0.3;
}

.invalid-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.3);
  border-color: #c82333 !important;
  opacity: 0.9;
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

/* Public角标样式 */
.public-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  overflow: hidden;
}

.public-triangle {
  width: 0;
  height: 0;
  border-left: 24px solid #28a745;
  border-bottom: 24px solid transparent;
  position: relative;
  border-top-left-radius: 6px;
}

.public-triangle::after {
  content: 'P';
  position: absolute;
  top: 2px;
  left: -18px;
  color: white;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
}

/* 不同状态的角标颜色 */
.public-bound .public-triangle {
  border-left-color: #28a745; /* 绿色 - 正常状态 */
}

.public-unbound .public-triangle {
  border-left-color: #ffc107; /* 黄色 - 未绑定状态 */
}

.public-suspended .public-triangle {
  border-left-color: #6c757d; /* 灰色 - 暂停状态 */
}

.public-invalid .public-triangle {
  border-left-color: #dc3545; /* 红色 - 失效状态 */
}

/* 卡片选择蒙版样式 */
.card-select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.card-select-overlay:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.2);
}

.card-select-overlay.selected {
  opacity: 1;
  background: rgba(13, 110, 253, 0.15);
  border: 2px solid #0d6efd;
}

.card-select-overlay.selected:hover {
  background: rgba(13, 110, 253, 0.25);
}

.select-indicator {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #0d6efd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.card-select-overlay.selected .select-indicator {
  background: #0d6efd;
  color: white;
}

.card-select-overlay:hover .select-indicator {
  transform: scale(1.1);
}

/* 列表模式的Public竖条标记 */
.public-cell-bound {
  border-left: 2px solid #28a745 !important; /* 绿色 - 正常状态 */
}

.public-cell-unbound {
  border-left: 2px solid #ffc107 !important; /* 黄色 - 未绑定状态 */
}

.public-cell-suspended {
  border-left: 2px solid #6c757d !important; /* 灰色 - 暂停状态 */
}

.public-cell-invalid {
  border-left: 2px solid #dc3545 !important; /* 红色 - 失效状态 */
}
</style>
