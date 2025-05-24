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
        class="transform-btn transform-btn--primary"
        @click="executeTransform"
        :disabled="isExecuting"
      >
        <span
          v-if="isExecuting"
          class="btn-loading"
          >⟳</span
        >
        <span>{{ isExecuting ? '执行中...' : '执行转换' }}</span>
      </button>
      <button
        class="transform-btn transform-btn--secondary"
        @click="formatCode"
      >
        <span>格式化代码</span>
      </button>
      <button
        class="transform-btn transform-btn--tertiary"
        @click="showCommonCodeDialog = true"
      >
        <span>常用代码</span>
      </button>
    </div>

    <CommonCodeDialog
      v-model="showCommonCodeDialog"
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
import CodeEditor from './CodeEditor.vue'
import CommonCodeDialog from './CommonCodeDialog.vue'

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
      `
      function transform(json) {
        ${currentCode}
      }
      return transform(json)
    `,
    )

    const transformedJson = transformFn(props.json)
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;

  .function-header,
  .function-footer {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    color: #64748b;
    padding: 0 12px;
    user-select: none;
    font-size: 14px;
    font-weight: 500;
  }

  .button-area {
    padding: 12px 0;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .transform-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    min-width: 100px;
    justify-content: center;
    position: relative;
    overflow: hidden;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--primary {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
        box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }
    }

    &--secondary {
      background: white;
      color: #334155;
      border: 1px solid rgba(148, 163, 184, 0.3);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      &:hover {
        background: rgba(248, 250, 252, 0.8);
        border-color: rgba(148, 163, 184, 0.5);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(148, 163, 184, 0.2);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &--tertiary {
      background: rgba(30, 41, 59, 0.06);
      color: #334155;
      border: 1px solid rgba(30, 41, 59, 0.12);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      &:hover {
        background: rgba(30, 41, 59, 0.1);
        border-color: rgba(30, 41, 59, 0.18);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(30, 41, 59, 0.15);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .btn-loading {
    animation: spin 1s linear infinite;
    font-size: 14px;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .error-area {
    padding: 12px 16px;
    background: rgba(254, 242, 242, 0.8);
    border: 1px solid rgba(248, 113, 113, 0.3);
    border-radius: 8px;
    max-height: 100px;
    overflow-y: auto;
    backdrop-filter: blur(8px);

    .error-title {
      color: #dc2626;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .error-content {
      color: #dc2626;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 12px;
      white-space: pre-wrap;
      line-height: 1.4;
    }

    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(220, 38, 38, 0.3);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(220, 38, 38, 0.5);
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .js-transformer {
    padding: 12px;
    gap: 10px;

    .function-header,
    .function-footer {
      font-size: 13px;
      padding: 0 8px;
    }

    .button-area {
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .transform-btn {
      width: 200px;
      padding: 12px 16px;
    }
  }
}

@media (max-width: 480px) {
  .js-transformer {
    padding: 8px;

    .transform-btn {
      width: 100%;
      max-width: 280px;
    }
  }
}
</style>
