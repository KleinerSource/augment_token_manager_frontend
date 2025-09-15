<template>
  <div class="page page-center">
    <div class="container container-tight py-4">
      <div class="text-center mb-4">
        <h1 class="h2 text-muted">Augment Token Manager</h1>
        <p class="text-muted">请登录以访问管理系统</p>
      </div>
      <div class="card card-md">
        <div class="card-body">
          <h2 class="h2 text-center mb-4">登录到您的账户</h2>
          <form @submit.prevent="handleLogin" autocomplete="off" novalidate>
            <div class="mb-3">
              <label class="form-label">用户名</label>
              <input 
                type="text" 
                v-model="loginForm.username"
                class="form-control" 
                :class="{ 'is-invalid': errors.username }"
                placeholder="请输入用户名"
                autocomplete="username"
                :disabled="isLoading"
                required
              >
              <div v-if="errors.username" class="invalid-feedback">
                {{ errors.username }}
              </div>
            </div>
            <div class="mb-2">
              <label class="form-label">
                密码
              </label>
              <div class="input-group input-group-flat">
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  v-model="loginForm.password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  :disabled="isLoading"
                  required
                >
                <span class="input-group-text">
                  <button 
                    type="button"
                    class="btn btn-link p-0 border-0"
                    @click="togglePasswordVisibility"
                    :disabled="isLoading"
                  >
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <circle cx="12" cy="12" r="2"/>
                      <path d="m22 12c-2.667 4.667 -6 7 -10 7s-7.333 -2.333 -10 -7c2.667 -4.667 6 -7 10 -7s7.333 2.333 10 7"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <line x1="3" y1="3" x2="21" y2="21"/>
                      <path d="m10.584 10.587a2 2 0 0 0 2.828 2.83"/>
                      <path d="m9.363 5.365a9.466 9.466 0 0 1 2.637 -.365c4 0 7.333 2.333 10 7c-.778 1.361 -1.612 2.524 -2.503 3.488m-2.14 1.861c-1.631 1.1 -3.415 1.651 -5.357 1.651c-4 0 -7.333 -2.333 -10 -7c1.369 -2.395 2.913 -4.175 4.632 -5.341"/>
                    </svg>
                  </button>
                </span>
              </div>
              <div v-if="errors.password" class="invalid-feedback d-block">
                {{ errors.password }}
              </div>
            </div>
            <div class="mb-2">
              <label class="form-check">
                <input 
                  type="checkbox" 
                  v-model="loginForm.remember_me"
                  class="form-check-input"
                  :disabled="isLoading"
                >
                <span class="form-check-label">记住我</span>
              </label>
            </div>

            <div class="form-footer">
              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="isLoading || !isFormValid"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '../utils/toast'

interface LoginForm {
  username: string
  password: string
  remember_me: boolean
}

interface LoginResponse {
  data?: {
    username: string
  }
  message?: string
  success: boolean
  error?: string
}

interface FormErrors {
  username?: string
  password?: string
}

const router = useRouter()

// 响应式数据
const loginForm = ref<LoginForm>({
  username: '',
  password: '',
  remember_me: false
})

const errors = ref<FormErrors>({})
const isLoading = ref<boolean>(false)
const showPassword = ref<boolean>(false)

// 计算属性
const isFormValid = computed(() => {
  return loginForm.value.username.trim() !== '' && 
         loginForm.value.password.trim() !== '' &&
         Object.keys(errors.value).length === 0
})

// 生命周期
onMounted(() => {
  // 检查是否已经登录
  const token = localStorage.getItem('auth_token')
  if (token) {
    router.push('/')
    return
  }

  // 加载记住的登录信息
  loadRememberedCredentials()
})

// 加载记住的登录信息
const loadRememberedCredentials = () => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  const rememberedPassword = localStorage.getItem('remembered_password')
  const rememberMe = localStorage.getItem('remember_me') === 'true'

  if (rememberMe && rememberedUsername && rememberedPassword) {
    loginForm.value.username = rememberedUsername
    loginForm.value.password = rememberedPassword
    loginForm.value.remember_me = true
  }
}

// 保存或清除记住的登录信息
const saveRememberedCredentials = () => {
  if (loginForm.value.remember_me) {
    localStorage.setItem('remembered_username', loginForm.value.username)
    localStorage.setItem('remembered_password', loginForm.value.password)
    localStorage.setItem('remember_me', 'true')
  } else {
    localStorage.removeItem('remembered_username')
    localStorage.removeItem('remembered_password')
    localStorage.removeItem('remember_me')
  }
}

// 方法
const validateForm = (): boolean => {
  errors.value = {}
  
  if (!loginForm.value.username.trim()) {
    errors.value.username = '请输入用户名'
  }
  
  if (!loginForm.value.password.trim()) {
    errors.value.password = '请输入密码'
  }
  
  return Object.keys(errors.value).length === 0
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginForm.value)
    })
    
    const data: LoginResponse = await response.json()
    
    if (data.success && data.data) {
      // 登录成功
      localStorage.setItem('auth_token', 'logged_in')
      localStorage.setItem('username', data.data.username)

      // 保存或清除记住的登录信息
      saveRememberedCredentials()

      toast.success(data.message || '登录成功')

      // 跳转到Token管理页面
      router.push('/')
    } else {
      // 登录失败
      const errorMsg = data.error || '登录失败，请重试'
      toast.error(errorMsg)
    }
  } catch (error) {
    console.error('登录请求失败:', error)
    const errorMsg = '网络错误，请检查网络连接后重试'
    toast.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.page-center {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.container-tight {
  max-width: 400px;
}

.card-md {
  max-width: 400px;
  margin: 0 auto;
}

.btn-link {
  color: var(--tblr-muted);
  text-decoration: none;
}

.btn-link:hover {
  color: var(--tblr-primary);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
