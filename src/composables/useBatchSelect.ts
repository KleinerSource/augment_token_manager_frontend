import { ref, computed } from 'vue'
import { toast } from '../utils/toast'

export interface BatchSelectItem {
  id: string
  tenant_url?: string
  access_token?: string
  portal_url?: string
  email_note?: string
}

export function useBatchSelect<T extends BatchSelectItem>(items: () => T[]) {
  // 批量选择相关数据
  const isBatchSelectMode = ref(false)
  const selectedItems = ref<Set<string>>(new Set())
  const showExportModal = ref(false)
  const exportData = ref('')

  // 批量选择计算属性
  const isAllSelected = computed(() => {
    const currentItems = items()
    return currentItems.length > 0 && currentItems.every(item => selectedItems.value.has(item.id))
  })

  const isPartialSelected = computed(() => {
    const currentItems = items()
    const selectedCount = currentItems.filter(item => selectedItems.value.has(item.id)).length
    return selectedCount > 0 && selectedCount < currentItems.length
  })

  const selectedCount = computed(() => selectedItems.value.size)

  // 批量选择相关方法
  const toggleBatchSelectMode = () => {
    isBatchSelectMode.value = !isBatchSelectMode.value
    if (!isBatchSelectMode.value) {
      selectedItems.value.clear()
    }
  }

  const toggleSelectItem = (itemId: string) => {
    if (selectedItems.value.has(itemId)) {
      selectedItems.value.delete(itemId)
    } else {
      selectedItems.value.add(itemId)
    }
  }

  const selectAll = () => {
    const currentItems = items()
    currentItems.forEach(item => {
      selectedItems.value.add(item.id)
    })
  }

  const deselectAll = () => {
    selectedItems.value.clear()
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const exportSelected = () => {
    const currentItems = items()
    const selectedItemsData = currentItems.filter(item => 
      selectedItems.value.has(item.id)
    )
    
    if (selectedItemsData.length === 0) {
      toast.warning('请选择至少一个项目')
      return
    }
    
    const exportItems = selectedItemsData.map(item => ({
      tenant_url: item.tenant_url || '',
      access_token: item.access_token || '',
      portal_url: item.portal_url || '',
      email_note: item.email_note || ''
    }))
    
    if (exportItems.length === 1) {
      exportData.value = JSON.stringify(exportItems[0], null, 2)
    } else {
      exportData.value = JSON.stringify(exportItems, null, 2)
    }
    
    showExportModal.value = true
  }

  const closeExportModal = () => {
    showExportModal.value = false
    exportData.value = ''
  }

  return {
    // 状态
    isBatchSelectMode,
    selectedItems,
    showExportModal,
    exportData,
    
    // 计算属性
    isAllSelected,
    isPartialSelected,
    selectedCount,
    
    // 方法
    toggleBatchSelectMode,
    toggleSelectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    exportSelected,
    closeExportModal
  }
}
