<template>
  <div class="js-transformer">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
    </div>

    <CodeEditor
      ref="codeEditor"
      v-model="code"
      :placeholder="defaultCode"
      @ctrl-enter="handleCtrlEnter"
      @ctrl-save="handleCtrlSave"
      @format="handleFormat"
    />

    <div class="function-footer">}</div>

    <div class="button-area">
      <button
        class="btn btn--primary"
        :class="{ loading: isExecuting }"
        @click="executeTransform"
        :disabled="isExecuting"
      >
        <span>{{ isExecuting ? '执行中...' : '执行转换' }}</span>
      </button>
      <button
        class="btn btn--secondary"
        @click="formatCode"
      >
        <span>格式化代码</span>
      </button>
      <button
        class="btn btn--tertiary"
        @click="showCommonCodeDialog = true"
      >
        <span>常用代码</span>
      </button>
    </div>

    <CommonCodeDialog
      v-model="showCommonCodeDialog"
      type="json"
      @select="handleCodeSelect"
    />

    <div
      v-if="error"
      class="error-area"
    >
      <div class="error-title">错误信息：</div>
      <div class="error-content">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CommonCodeDialog from '@/components/CommonCodeDialog.vue'
import jsonpath from 'jsonpath'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

const codeEditor = ref(null)
const code = ref('')
const error = ref('')
const isExecuting = ref(false)
const showCommonCodeDialog = ref(false)

// 默认代码
const defaultCode =
  '// Ctrl + Enter：格式化+执行\n// Ctrl + S：格式化\n// Ctrl + /：注释/取消注释\nreturn json.address'

// 初始化代码
code.value = defaultCode

const formatCode = async () => {
  try {
    await codeEditor.value?.formatCode()
  } catch (err) {
    error.value = err.message
  }
}

const executeTransform = () => {
  isExecuting.value = true
  error.value = ''

  try {
    const currentCode = codeEditor.value?.getCode() || code.value
    if (!currentCode.trim()) {
      emit('update:transformedJson', props.json)
      return
    }

    const transformFn = new Function(
      'json',
      'jsonpath',
      `
      function transform(json) {
        ${currentCode}
      }
      return transform(json)
    `,
    )

    const transformedJson = transformFn(props.json, jsonpath)
    emit('update:transformedJson', transformedJson)
  } catch (err) {
    error.value = err.message
    emit('update:transformedJson', props.json)
  } finally {
    isExecuting.value = false
  }
}

const handleCtrlEnter = async (formattedCode, formatError) => {
  if (formatError) {
    error.value = formatError.message
  } else {
    error.value = ''
  }
  executeTransform()
}

const handleCtrlSave = async (formattedCode, formatError) => {
  if (formatError) {
    error.value = formatError.message
  } else {
    error.value = ''
  }
}

const handleFormat = (formattedCode) => {
  error.value = ''
}

const handleCodeSelect = (selectedCode) => {
  codeEditor.value?.setCode(selectedCode)
}
</script>

<style lang="scss" scoped>
.js-transformer {
  height: 100%;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: var(--bg-tertiary);

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

    .error-title {
      color: var(--color-error);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-base);
    }

    .error-content {
      color: var(--color-error);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      white-space: pre-wrap;
      line-height: 1.4;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .js-transformer {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);

    .function-header,
    .function-footer {
      font-size: var(--font-size-base);
      padding: 0 var(--spacing-sm);
    }

    .button-area {
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .btn {
      width: 200px;
      height: var(--button-height-lg);
    }
  }
}

@media (max-width: 480px) {
  .js-transformer {
    padding: var(--spacing-sm);

    .btn {
      width: 100%;
      max-width: 280px;
    }
  }
}
</style>
