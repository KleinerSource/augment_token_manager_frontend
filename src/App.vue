<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, defineAsyncComponent } from 'vue'
import NavigationBar from './components/NavigationBar.vue'
import ToastNotification from './components/ToastNotification.vue'
import StackedFloatingButtons from './components/StackedFloatingButtons.vue'

// 导入所有组件（权限控制在组件内部处理）
const EmailSubscription = defineAsyncComponent(() => import('./components/EmailSubscription.vue'))
const TempMailService = defineAsyncComponent(() => import('./components/TempMailService.vue'))

const route = useRoute()

// 判断是否为登录页面
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <!-- 登录页面布局 -->
  <div v-if="isLoginPage">
    <RouterView />
  </div>

  <!-- 管理页面布局 -->
  <div v-else class="page">
    <NavigationBar />
    <div class="page-wrapper">
      <div class="page-body">
        <div class="container-xl">
          <RouterView />
        </div>
      </div>
      <!-- 版权信息 -->
      <footer class="footer footer-transparent d-print-none">
        <div class="container-xl">
          <div class="row text-center align-items-center flex-row-reverse">
            <div class="col-12 col-lg-auto mt-3 mt-lg-0">
              <ul class="list-inline list-inline-dots mb-0">
                <li class="list-inline-item">
                  &copy; 2025 KleinerSource. All rights reserved.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <!-- 全局提示组件 -->
  <ToastNotification />

  <!-- 堆叠式悬浮按钮组（在非综合管理页面显示，不包含批量刷新功能） -->
  <StackedFloatingButtons
    v-if="!isLoginPage && route.name !== 'comprehensive-manager'"
    :show-batch-refresh="false"
  />

  <!-- 邮件订阅悬浮窗（仅窗口部分，按钮已整合到堆叠按钮中） -->
  <component
    v-if="!isLoginPage && EmailSubscription"
    :is="EmailSubscription"
  />

  <!-- 临时邮箱悬浮窗（仅窗口部分，按钮已整合到堆叠按钮中） -->
  <component
    v-if="!isLoginPage && TempMailService"
    :is="TempMailService"
  />
</template>

<style scoped>
/* 使用 Tabler 的默认样式，无需额外自定义 */
</style>
