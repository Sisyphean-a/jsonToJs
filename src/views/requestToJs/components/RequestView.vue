<template>
  <div class="request-view">
    <div class="view-header">
      <span>请求详情</span>
      <div class="header-buttons">
        <v-btn
          density="compact"
          variant="text"
          @click="copyToClipboard"
          :disabled="!request || Object.keys(request).length === 0"
          size="small"
        >
          {{ copyButtonText }}
        </v-btn>
      </div>
    </div>
    
    <div class="json-content">
      <pre v-if="formattedRequest" class="json-display">{{ formattedRequest }}</pre>
      <div v-else class="empty-state">
        暂无请求数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  request: {
    type: Object,
    default: () => ({})
  }
})

const copyButtonText = ref('复制')

const formattedRequest = computed(() => {
  if (!props.request || Object.keys(props.request).length === 0) {
    return null
  }
  
  try {
    // 深度克隆对象以避免修改原始数据
    const requestCopy = JSON.parse(JSON.stringify(props.request))
    
    // 格式化请求体中的JSON字符串
    if (requestCopy.body && typeof requestCopy.body === 'string') {
      try {
        // 尝试解析body为JSON
        const parsedBody = JSON.parse(requestCopy.body)
        requestCopy.body = parsedBody
      } catch (e) {
        // 如果不是有效的JSON，保持原样
        // 但是尝试格式化常见的查询字符串
        if (requestCopy.body.includes('=') && requestCopy.body.includes('&')) {
          // 可能是URL编码的表单数据，尝试格式化
          try {
            const params = new URLSearchParams(requestCopy.body)
            const formattedParams = {}
            for (const [key, value] of params) {
              formattedParams[key] = value
            }
            requestCopy.bodyFormatted = {
              type: 'form-data',
              data: formattedParams,
              raw: requestCopy.body
            }
          } catch (formError) {
            // 保持原样
          }
        }
      }
    }
    
    // 格式化requestSent中的body（如果存在）
    if (requestCopy.requestSent && requestCopy.requestSent.body && typeof requestCopy.requestSent.body === 'string') {
      try {
        const parsedBody = JSON.parse(requestCopy.requestSent.body)
        requestCopy.requestSent.body = parsedBody
      } catch (e) {
        // 保持原样
      }
    }
    
    // 格式化requestAttempted中的body（如果存在）
    if (requestCopy.requestAttempted && requestCopy.requestAttempted.body && typeof requestCopy.requestAttempted.body === 'string') {
      try {
        const parsedBody = JSON.parse(requestCopy.requestAttempted.body)
        requestCopy.requestAttempted.body = parsedBody
      } catch (e) {
        // 保持原样
      }
    }
    
    return JSON.stringify(requestCopy, null, 2)
  } catch (e) {
    return `格式化错误: ${e.message}`
  }
})

const copyToClipboard = async () => {
  if (!formattedRequest.value) return
  
  try {
    await navigator.clipboard.writeText(formattedRequest.value)
    copyButtonText.value = '已复制!'
    setTimeout(() => {
      copyButtonText.value = '复制'
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    copyButtonText.value = '复制失败'
    setTimeout(() => {
      copyButtonText.value = '复制'
    }, 2000)
  }
}
</script>

<style lang="scss" scoped>
.request-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  font-weight: bold;
  background-color: var(--bg-tertiary, #f0f0f0);
  border-bottom: 1px solid var(--border-light, #ccc);
  
  .header-buttons {
    display: flex;
    gap: var(--spacing-xs, 4px);
  }
}

.json-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-md);
}

.json-display {
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--spacing-md);
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-style: italic;
}

/* 自定义滚动条样式 */
.json-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-content::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: var(--radius-xs);
}

.json-content::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: var(--radius-xs);
}

.json-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-dark);
}
</style> 