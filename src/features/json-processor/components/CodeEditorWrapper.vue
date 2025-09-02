<template>
  <div class="code-editor-wrapper">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
    </div>

    <CodeEditor
      ref="codeEditor"
      v-model="localCode"
      :placeholder="placeholder"
      @ctrl-enter="handleCtrlEnter"
      @ctrl-save="handleCtrlSave"
      @format="handleFormat"
      @change="handleCodeChange"
    />

    <div class="function-footer">}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import CodeEditor from './CodeEditor.vue'
import { useErrorHandler } from '@/shared/composables/useErrorHandler.js'
import { EDITOR_CONFIG } from '@/shared/constants/app-config.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: EDITOR_CONFIG.defaultCode,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  autoFormat: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'ctrl-enter',
  'ctrl-save',
  'format',
  'change',
  'ready',
])

// 使用统一错误处理
const { handleError, clearErrors } = useErrorHandler({
  context: 'CodeEditorWrapper',
  maxErrors: 1,
  autoHideDelay: 5000,
})

// 组件引用和状态
const codeEditor = ref(null)
const localCode = ref(props.modelValue || props.placeholder)
const isReady = ref(false)
const lastFormattedCode = ref('')

// 计算属性
const hasCode = computed(() => localCode.value && localCode.value.trim().length > 0)
const isCodeChanged = computed(() => localCode.value !== lastFormattedCode.value)
const codeStats = computed(() => {
  const code = localCode.value || ''
  return {
    lines: code.split('\n').length,
    characters: code.length,
    words: code.split(/\s+/).filter((word) => word.length > 0).length,
  }
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localCode.value) {
      localCode.value = newValue || props.placeholder
    }
  },
  { immediate: true },
)

// 监听本地值变化，同步到外部
watch(localCode, (newValue) => {
  emit('update:modelValue', newValue)
})

/**
 * 处理代码变化
 * @param {string} newCode 新的代码
 */
const handleCodeChange = (newCode) => {
  localCode.value = newCode
  clearErrors()
  emit('change', newCode, codeStats.value)
}

/**
 * 格式化代码
 * @returns {Promise<string>} 格式化后的代码
 */
const formatCode = async () => {
  try {
    if (!codeEditor.value) {
      throw new Error('编辑器未准备就绪')
    }

    const formattedCode = await codeEditor.value.formatCode()
    lastFormattedCode.value = formattedCode
    clearErrors()
    emit('format', formattedCode)
    return formattedCode
  } catch (error) {
    handleError(error, 'Code Formatting')
    emit('format', localCode.value, error)
    throw error
  }
}

/**
 * 处理 Ctrl+Enter 事件
 * @param {string} formattedCode 格式化后的代码
 * @param {Error} formatError 格式化错误
 */
const handleCtrlEnter = async (formattedCode, formatError) => {
  if (formatError) {
    handleError(formatError, 'Code Formatting (Ctrl+Enter)')
  } else {
    clearErrors()
    lastFormattedCode.value = formattedCode
  }

  emit('ctrl-enter', formattedCode, formatError)
}

/**
 * 处理 Ctrl+S 事件
 * @param {string} formattedCode 格式化后的代码
 * @param {Error} formatError 格式化错误
 */
const handleCtrlSave = async (formattedCode, formatError) => {
  if (formatError) {
    handleError(formatError, 'Code Formatting (Ctrl+S)')
  } else {
    clearErrors()
    lastFormattedCode.value = formattedCode
  }

  emit('ctrl-save', formattedCode, formatError)
}

/**
 * 处理格式化事件
 * @param {string} formattedCode 格式化后的代码
 */
const handleFormat = (formattedCode) => {
  clearErrors()
  lastFormattedCode.value = formattedCode
  emit('format', formattedCode)
}

/**
 * 设置代码内容
 * @param {string} code 要设置的代码
 */
const setCode = (code) => {
  if (codeEditor.value) {
    codeEditor.value.setCode(code)
  } else {
    localCode.value = code
  }
}

/**
 * 获取当前代码
 * @returns {string} 当前代码
 */
const getCode = () => {
  return codeEditor.value ? codeEditor.value.getCode() : localCode.value
}

/**
 * 插入代码片段
 * @param {string} snippet 要插入的代码片段
 * @param {boolean} replace 是否替换当前选中内容
 */
const insertSnippet = (snippet, replace = false) => {
  if (codeEditor.value && codeEditor.value.insertSnippet) {
    codeEditor.value.insertSnippet(snippet, replace)
  } else {
    // 简单的文本插入作为fallback
    if (replace) {
      localCode.value = snippet
    } else {
      localCode.value += snippet
    }
  }
}

/**
 * 聚焦编辑器
 */
const focus = () => {
  if (codeEditor.value && codeEditor.value.focus) {
    codeEditor.value.focus()
  }
}

/**
 * 重置编辑器内容
 */
const reset = () => {
  setCode(props.placeholder)
  clearErrors()
  lastFormattedCode.value = ''
}

/**
 * 获取编辑器统计信息
 * @returns {Object} 统计信息
 */
const getStats = () => {
  return {
    ...codeStats.value,
    hasCode: hasCode.value,
    isChanged: isCodeChanged.value,
    isReady: isReady.value,
  }
}

// 组件挂载后的初始化
const initialize = async () => {
  await nextTick()
  isReady.value = true
  emit('ready', {
    editor: codeEditor.value,
    stats: getStats(),
  })
}

// 在组件挂载后初始化
watch(
  codeEditor,
  (editor) => {
    if (editor) {
      initialize()
    }
  },
  { immediate: true },
)

// 暴露方法给父组件
defineExpose({
  // 编辑器操作
  setCode,
  getCode,
  formatCode,
  insertSnippet,
  focus,
  reset,

  // 状态信息
  getStats,
  hasCode,
  isReady,

  // 编辑器实例
  editor: computed(() => codeEditor.value),
})
</script>

<style lang="scss" scoped>
.code-editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-sm, 8px);
}

.function-header,
.function-footer {
  font-family: var(--font-family-mono, monospace);
  color: var(--text-secondary, #6b7280);
  padding: 0 var(--spacing-md, 12px);
  user-select: none;
  font-size: var(--font-size-md, 16px);
  font-weight: var(--font-weight-medium, 500);
  line-height: 1.5;
}

.function-header {
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  padding-bottom: var(--spacing-sm, 8px);
}

.function-footer {
  border-top: 1px solid var(--border-light, #e5e7eb);
  padding-top: var(--spacing-sm, 8px);
}
</style>
