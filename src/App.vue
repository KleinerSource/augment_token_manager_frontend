<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, defineAsyncComponent } from 'vue'
import NavigationBar from './components/NavigationBar.vue'
import ToastNotification from './components/ToastNotification.vue'
import { isEmailSubscriptionEnabled } from './types/feature-flags'

// 条件导入EmailSubscription组件
const EmailSubscription = isEmailSubscriptionEnabled()
  ? defineAsyncComponent(() => import('./components/EmailSubscription.vue'))
  : null

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

  <!-- 邮件订阅悬浮窗 -->
  <component
    v-if="!isLoginPage && isEmailSubscriptionEnabled() && EmailSubscription"
    :is="EmailSubscription"
  />
</template>

<style scoped>
/* 使用 Tabler 的默认样式，无需额外自定义 */
</style>
