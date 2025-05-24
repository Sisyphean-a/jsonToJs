<template>
  <div class="code-editor">
    <div
      ref="editor"
      style="height: 100%"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { createEditorExtensions, formatCode as formatCodeUtil } from '../utils/editorUtils'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'format', 'execute', 'ctrl-enter', 'ctrl-save'])

const editor = ref(null)
const editorView = ref(null)

// 创建编辑器扩展
const extensions = [
  ...createEditorExtensions(),
  // 添加更新监听器
  EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const newCode = update.state.doc.toString()
      emit('update:modelValue', newCode)
    }
  }),
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

    // 触发格式化事件
    emit('format', formatted)
    return formatted
  } catch (err) {
    throw new Error('格式化代码时出错：' + err.message)
  }
}

const handleCtrlEnter = async () => {
  try {
    const formatted = await formatCode()
    emit('ctrl-enter', formatted)
  } catch (err) {
    emit('ctrl-enter', getCode(), err)
  }
}

const handleCtrlSave = async () => {
  try {
    const formatted = await formatCode()
    emit('ctrl-save', formatted)
  } catch (err) {
    emit('ctrl-save', getCode(), err)
  }
}

// 获取编辑器内容
const getCode = () => {
  return editorView.value?.state.doc.toString() || ''
}

// 设置编辑器内容
const setCode = (code) => {
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

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  if (editorView.value && newValue !== getCode()) {
    setCode(newValue)
  }
})

// 暴露方法给父组件
defineExpose({
  getCode,
  setCode,
  formatCode,
})

onMounted(() => {
  // 创建编辑器实例
  editorView.value = new EditorView({
    state: EditorState.create({
      doc: props.modelValue || props.placeholder,
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

/* 响应式设计 */
@media (max-width: 768px) {
  .code-editor {
    min-height: 100px;

    :deep(.cm-editor) {
      font-size: 13px;
    }

    :deep(.cm-scroller) {
      padding: 10px;
    }
  }
}
</style> 