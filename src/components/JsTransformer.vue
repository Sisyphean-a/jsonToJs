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
      <v-btn
        color="primary"
        @click="executeTransform"
        :loading="isExecuting"
      >
        执行转换
      </v-btn>
      <v-btn
        color="secondary"
        @click="formatCode"
        class="ml-2"
      >
        格式化代码
      </v-btn>
      <v-btn
        color="info"
        @click="showCommonCodeDialog = true"
        class="ml-2"
      >
        常用代码
      </v-btn>
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .function-header,
  .function-footer {
    font-family: monospace;
    color: #666;
    padding: 0 10px;
    user-select: none;
  }

  .code-editor {
    flex: 1;
    min-height: 100px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;

    &:focus-within {
      border-color: #409eff;
    }

    :deep(.cm-editor) {
      height: 100%;
      font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
      font-size: 16px;
      line-height: 1.5;
    }
  }

  .button-area {
    padding: 10px;
    display: flex;
    justify-content: center;
  }

  .error-area {
    padding: 10px;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 4px;
    max-height: 80px;
    overflow-y: auto;

    .error-title {
      color: #ff4d4f;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .error-content {
      color: #ff4d4f;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
  }
}
</style>
