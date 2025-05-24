<template>
  <div class="js-transformer">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
    </div>

    <div class="code-editor">
      <div
        ref="editor"
        style="height: 100%"
      ></div>
    </div>

    <div class="function-footer">}</div>

    <div class="button-area">
      <button
        class="transform-btn transform-btn--primary"
        @click="executeTransform"
        :disabled="isExecuting"
      >
        <span v-if="isExecuting" class="btn-loading">⟳</span>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { createEditorExtensions, formatCode as formatCodeUtil } from '../utils/editorUtils'
import CommonCodeDialog from './CommonCodeDialog.vue'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

const editor = ref(null)
const editorView = ref(null)
const error = ref('')
const isExecuting = ref(false)
const showCommonCodeDialog = ref(false)

// 创建编辑器扩展
const extensions = [
  ...createEditorExtensions(),
  keymap.of([
    {
      key: 'Enter',
      run: (view) => {
        // 默认的换行行为
        view.dispatch({
          changes: { from: view.state.selection.main.head, insert: '\n' },
          selection: { anchor: view.state.selection.main.head + 1 },
        })
        return true
      },
    },
    {
      key: 'Ctrl-Enter',
      run: () => {
        handleCtrlEnter()
        return true
      },
    },
    {
      key: 'Ctrl-s',
      run: () => {
        handleCtrlSave()
        return true
      },
    },
    {
      key: 'Ctrl-/',
      run: (view) => {
        toggleLineComment(view)
        return true
      },
    },
  ]),
]

const toggleLineComment = (view) => {
  const { state } = view
  const { doc } = state
  const { head } = state.selection.main

  // 获取当前行的行号
  const line = doc.lineAt(head)
  const lineText = line.text

  // 检查当前行是否已经被注释
  const trimmedText = lineText.trimStart()
  const leadingSpaces = lineText.length - trimmedText.length
  const isCommented = trimmedText.startsWith('//')

  // 创建变更
  if (isCommented) {
    // 移除注释
    const commentStart = line.from + leadingSpaces
    view.dispatch({
      changes: {
        from: commentStart,
        to: commentStart + 2,
        insert: '',
      },
    })
  } else {
    // 添加注释
    const commentStart = line.from + leadingSpaces
    view.dispatch({
      changes: {
        from: commentStart,
        to: commentStart,
        insert: '//',
      },
    })
  }
}

const formatCode = async () => {
  try {
    const code = editorView.value.state.doc.toString()
    const formatted = await formatCodeUtil(code)

    // 更新编辑器内容
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: formatted,
      },
    })
  } catch (err) {
    error.value = '格式化代码时出错：' + err.message
  }
}

const executeTransform = () => {
  isExecuting.value = true
  error.value = ''

  try {
    const code = editorView.value.state.doc.toString()
    if (!code.trim()) {
      emit('update:transformedJson', props.json)
      return
    }

    const transformFn = new Function(
      'json',
      `
      function transform(json) {
        ${code}
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

const handleCtrlEnter = async () => {
  await formatCode()
  executeTransform()
}

const handleCtrlSave = async () => {
  await formatCode()
}

const handleCodeSelect = (code) => {
  if (editorView.value) {
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: code,
      },
    })
  }
}

onMounted(() => {
  // 创建编辑器实例
  editorView.value = new EditorView({
    state: EditorState.create({
      doc: '// Ctrl + Enter：格式化+执行\n// Ctrl + S：格式化\n// Ctrl + /：注释/取消注释\nreturn json.address',
      extensions,
    }),
    parent: editor.value,
  })
})

onBeforeUnmount(() => {
  if (editorView.value) {
    editorView.value.destroy()
    editorView.value = null
  }
})
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

  .code-editor {
    flex: 1;
    min-height: 120px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:focus-within {
      border-color: rgba(30, 41, 59, 0.4);
      box-shadow: 
        0 0 0 1px rgba(30, 41, 59, 0.2),
        0 4px 12px rgba(30, 41, 59, 0.1);
    }

    :deep(.cm-editor) {
      height: 100%;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
      font-size: 14px;
      line-height: 1.6;
    }

    :deep(.cm-editor.cm-focused) {
      outline: none;
    }

    :deep(.cm-scroller) {
      padding: 12px;
    }
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
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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

    .code-editor {
      min-height: 100px;

      :deep(.cm-editor) {
        font-size: 13px;
      }

      :deep(.cm-scroller) {
        padding: 10px;
      }
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
