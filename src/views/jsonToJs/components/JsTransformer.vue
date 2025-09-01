<template>
  <div class="js-transformer">
    <div class="code-section">
      <!-- 代码编辑器包装器 -->
      <CodeEditorWrapper
        ref="codeEditorWrapper"
        v-model="code"
        :placeholder="defaultCode"
        @ctrl-enter="handleCtrlEnter"
        @ctrl-save="handleCtrlSave"
        @format="handleFormat"
        @change="handleCodeChange"
        @ready="handleEditorReady"
      />

      <!-- 操作按钮 -->
      <ActionButtons
        :is-executing="isExecuting"
        :has-code="hasCode"
        :has-valid-json="hasValidJson"
        :show-extra-actions="true"
        @execute="executeTransform"
        @format="formatCode"
        @show-common-code="showCommonCodeDialog = true"
        @show-ai="showAIDialog = true"
        @clear="handleClearCode"
        @copy="handleCopyCode"
      />

      <!-- 错误显示 -->
      <ErrorDisplay
        :errors="errors"
        :show-details="true"
        :show-stack="false"
        variant="default"
        @clear-all="clearErrors"
      />
    </div>

    <!-- 代码执行器（隐藏组件，只处理逻辑） -->
    <CodeExecutor
      ref="codeExecutor"
      :code="code"
      :json="json"
      @result="handleExecutionResult"
      @error="handleExecutionError"
      @executing="handleExecutionStateChange"
    />

    <!-- 对话框 -->
    <CommonCodeDialog
      v-model="showCommonCodeDialog"
      type="json"
      @select="handleCodeSelect"
    />

    <AIAssistantDialog
      v-model="showAIDialog"
      :json="json"
      @codeGenerated="handleAICodeGenerated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CodeEditorWrapper from './CodeEditorWrapper.vue'
import ActionButtons from './ActionButtons.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import CodeExecutor from './CodeExecutor.vue'
import CommonCodeDialog from '@/components/CommonCodeDialog.vue'
import AIAssistantDialog from '@/components/AIAssistantDialog.vue'
import { useErrorHandler } from '@/composables/useErrorHandler.js'
import { EDITOR_CONFIG } from '@/constants/app-config.js'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

// 组件引用
const codeEditorWrapper = ref(null)
const codeExecutor = ref(null)

// 状态
const code = ref('')
const isExecuting = ref(false)
const showCommonCodeDialog = ref(false)
const showAIDialog = ref(false)

// 使用统一错误处理
const { handleError, clearErrors, hasErrors, latestError, errors } = useErrorHandler({
  context: 'JsTransformer',
  maxErrors: 3,
  autoHideDelay: 0, // 不自动隐藏，由用户手动清除
})

// 默认代码
const defaultCode = EDITOR_CONFIG.defaultCode

// 初始化代码
code.value = defaultCode

// 计算属性
const hasCode = computed(() => code.value && code.value.trim().length > 0)
const hasValidJson = computed(() => {
  try {
    return props.json && typeof props.json === 'object'
  } catch {
    return false
  }
})

// 编辑器事件处理
const handleEditorReady = (editorInfo) => {
  console.log('Editor ready:', editorInfo)
}

const handleCodeChange = (newCode, stats) => {
  code.value = newCode
  clearErrors()
}

// 执行相关事件处理
const executeTransform = async () => {
  if (codeExecutor.value) {
    try {
      await codeExecutor.value.executeTransform()
    } catch (error) {
      // 错误已经在CodeExecutor中处理
    }
  }
}

const handleExecutionResult = (result) => {
  emit('update:transformedJson', result)
}

const handleExecutionError = (error) => {
  // 错误已经在CodeExecutor中处理，这里只需要发送fallback结果
  emit('update:transformedJson', props.json)
}

const handleExecutionStateChange = (executing) => {
  isExecuting.value = executing
}

// 格式化处理
const formatCode = async () => {
  if (codeEditorWrapper.value) {
    try {
      await codeEditorWrapper.value.formatCode()
    } catch (error) {
      // 错误已经在CodeEditorWrapper中处理
    }
  }
}

const handleCtrlEnter = async (formattedCode, formatError) => {
  if (!formatError) {
    executeTransform()
  }
}

const handleCtrlSave = async (formattedCode, formatError) => {
  // 格式化完成，不需要额外操作
}

const handleFormat = (formattedCode, formatError) => {
  // 格式化完成，不需要额外操作
}

// 代码操作
const handleCodeSelect = (selectedCode) => {
  if (codeEditorWrapper.value) {
    codeEditorWrapper.value.setCode(selectedCode)
  }
}

const handleClearCode = () => {
  if (codeEditorWrapper.value) {
    codeEditorWrapper.value.reset()
  }
}

const handleCopyCode = async () => {
  try {
    const currentCode = codeEditorWrapper.value?.getCode() || code.value
    await navigator.clipboard.writeText(currentCode)
    // 可以添加成功提示
  } catch (error) {
    handleError(error, 'Copy Code')
  }
}

// AI代码生成处理
const handleAICodeGenerated = (generatedCode) => {
  if (generatedCode && codeEditorWrapper.value) {
    codeEditorWrapper.value.setCode(generatedCode)
    clearErrors()
  }
}
</script>

<style lang="scss" scoped>
.js-transformer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-tertiary);

  .code-section {
    height: 100%;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    overflow-y: auto;

    .function-header,
    .function-footer {
      font-family: var(--font-family-mono);
      color: var(--text-secondary);
      padding: 0 var(--spacing-md);
      user-select: none;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
    }

    .button-area {
      padding: var(--spacing-md) 0;
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .error-area {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-error-light);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      max-height: 100px;
      overflow-y: auto;
      backdrop-filter: var(--backdrop-blur);
      position: relative;

      .error-title {
        color: var(--color-error);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-base);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .error-content {
        color: var(--color-error);
        font-family: var(--font-family-mono);
        font-size: var(--font-size-sm);
        white-space: pre-wrap;
        line-height: 1.4;
        margin-bottom: var(--spacing-sm);
      }

      .error-clear-btn {
        background: transparent;
        border: 1px solid var(--color-error);
        color: var(--color-error);
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        cursor: pointer;
        transition: all var(--transition-fast);

        &:hover {
          background: var(--color-error);
          color: white;
        }
      }

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-error);
        border-radius: var(--radius-xs);
        opacity: 0.5;
      }

      &::-webkit-scrollbar-thumb:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
