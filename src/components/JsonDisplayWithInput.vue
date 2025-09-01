<template>
  <div class="json-display-with-input">
    <!-- JSON展示区域 -->
    <div class="json-display-area">
      <json-view :json="json" />
    </div>

    <!-- 分割线 -->
    <div
      class="resize-handle-horizontal"
      @mousedown="startResize"
    ></div>

    <!-- 输入区域 -->
    <div
      class="input-area"
      :style="{ height: `${inputHeight}px` }"
    >
      <div class="input-container">
        <v-text-field
          v-model="localJsonInput"
          label="输入JSON数据"
          variant="outlined"
          density="compact"
          hide-details
          @input="handleInput"
          :error="hasError"
          :error-messages="hasError ? '解析错误' : ''"
          class="json-input-field"
        />
        <v-btn
          size="small"
          variant="outlined"
          color="primary"
          class="clipboard-btn"
          @click="readFromClipboard"
          :loading="isReadingClipboard"
          :disabled="isReadingClipboard"
          title="读取剪切板"
        >
          读取剪切板
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import JsonView from '@/views/jsonToJs/components/JsonView.vue'

const props = defineProps({
  initialJson: {
    type: String,
    required: true,
  },
  json: {
    type: [Object, Array],
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:json', 'update:jsonInput'])

const localJsonInput = ref(props.initialJson)
const hasError = ref(false)
const inputHeight = ref(60) // 默认输入区域高度
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)
const isReadingClipboard = ref(false)

// 监听外部JSON变化
watch(
  () => props.initialJson,
  (newVal) => {
    if (newVal !== localJsonInput.value) {
      localJsonInput.value = newVal
      hasError.value = false
    }
  },
)

// 将JS对象格式转换为标准JSON格式
const convertJsObjectToJson = (input) => {
  try {
    let processed = input.trim()

    if (!processed.startsWith('{') || !processed.endsWith('}')) {
      return input
    }

    // 为未加引号的键名添加双引号
    processed = processed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    processed = processed.replace(/^(\s*\{\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

    return processed
  } catch (e) {
    return input
  }
}

// 处理输入变化
const handleInput = () => {
  emit('update:jsonInput', localJsonInput.value)

  try {
    const parsedJson = JSON.parse(localJsonInput.value)
    emit('update:json', parsedJson)
    hasError.value = false
  } catch (e) {
    try {
      const convertedJson = convertJsObjectToJson(localJsonInput.value)
      const parsedJson = JSON.parse(convertedJson)
      emit('update:json', parsedJson)
      hasError.value = false
    } catch (convertError) {
      const errorJson = {
        data: localJsonInput.value,
        error: convertError.message,
      }
      emit('update:json', errorJson)
      hasError.value = true
    }
  }
}

// 读取剪切板内容
const readFromClipboard = async () => {
  if (!navigator.clipboard) {
    console.warn('剪切板API不可用')
    return
  }

  try {
    isReadingClipboard.value = true
    const text = await navigator.clipboard.readText()

    if (text.trim()) {
      localJsonInput.value = text.trim()
      handleInput()
    }
  } catch (error) {
    console.error('读取剪切板失败:', error)
    // 可以在这里添加用户提示
  } finally {
    isReadingClipboard.value = false
  }
}

// 开始调整大小
const startResize = (event) => {
  isResizing.value = true
  startY.value = event.clientY
  startHeight.value = inputHeight.value

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

// 处理鼠标移动
const handleMouseMove = (event) => {
  if (!isResizing.value) return

  const deltaY = event.clientY - startY.value
  const newHeight = Math.max(40, Math.min(200, startHeight.value + deltaY))
  inputHeight.value = newHeight
}

// 停止调整大小
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style lang="scss" scoped>
.json-display-with-input {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.json-display-area {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.resize-handle-horizontal {
  height: 4px;
  background: var(--border-light);
  cursor: row-resize;
  transition: background-color var(--transition-normal);

  &:hover {
    background: var(--color-primary);
  }

  &:active {
    background: var(--color-primary-dark);
  }
}

.input-area {
  flex-shrink: 0;
  padding: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  background: var(--bg-secondary);
  min-height: 40px;
  max-height: 200px;
}

.input-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: 100%;
}

.json-input-field {
  flex: 1;
  height: 100%;

  :deep(.v-field) {
    height: 100%;
  }

  :deep(.v-field__input) {
    min-height: auto;
    padding-top: 8px;
    padding-bottom: 8px;
  }
}

.clipboard-btn {
  flex-shrink: 0;
  height: 40px;
  white-space: nowrap;

  &:hover {
    background-color: rgba(var(--color-primary), 0.08);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-area {
    padding: var(--spacing-xs);
  }

  .resize-handle-horizontal {
    height: 6px;
  }

  .input-container {
    gap: var(--spacing-xs);
  }

  .clipboard-btn {
    height: 36px;
    font-size: 12px;
    padding: 0 8px;
  }
}
</style>
