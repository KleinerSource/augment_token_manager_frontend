<template>
  <Transition name="modal-animate" appear>
    <div v-if="show" class="modal modal-blur fade show" style="display: block;">
      <div class="modal-dialog modal-lg modal-dialog-centered" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-download me-2"></i>
              导出数据 ({{ selectedCount }} 项)
            </h5>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">导出格式 (JSON)</label>
              <textarea
                :value="exportData"
                class="form-control"
                rows="15"
                readonly
                style="font-family: 'Courier New', monospace; font-size: 12px;"
                placeholder="导出的数据将显示在这里..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">
              关闭
            </button>
            <button type="button" class="btn btn-primary" @click="copyToClipboard">
              <i class="bi bi-clipboard me-1"></i>
              复制到剪贴板
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { toast } from '../utils/toast'

interface Props {
  show: boolean
  selectedCount: number
  exportData: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.exportData)
    toast.success('导出数据已复制到剪贴板')
  } catch (error) {
    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = props.exportData
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      toast.success('导出数据已复制到剪贴板')
    } catch (fallbackError) {
      toast.error('复制失败，请手动复制')
    }
  }
}
</script>
