<template>
  <div class="js-transformer">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
    </div>

    <div class="code-editor">
      <div ref="editor"></div>
    </div>

    <div class="function-footer">}</div>

    <div class="button-area">
      <v-btn color="primary" @click="executeTransform" :loading="isExecuting"> 执行转换 </v-btn>
      <v-btn color="secondary" @click="formatCode" class="ml-2"> 格式化代码 </v-btn>
      <v-btn color="info" @click="showCommonCodeDialog = true" class="ml-2"> 常用代码 </v-btn>
    </div>

    <CommonCodeDialog v-model="showCommonCodeDialog" @select="handleCodeSelect" />

    <div v-if="error" class="error-area">
      <div class="error-title">错误信息：</div>
      <div class="error-content">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import * as prettier from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/parser-babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import CommonCodeDialog from './CommonCodeDialog.vue'

// 自定义浅色主题
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#fafafa',
    color: '#333333',
  },
  '.cm-content': {
    caretColor: '#333333',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#333333',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#e6f3ff',
  },
  '.cm-line': {
    '&::selection, & > span::selection, & > span > span::selection': {
      backgroundColor: '#e6f3ff',
    },
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#999999',
    borderRight: '1px solid #e0e0e0',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f0f0',
    color: '#333333',
  },
  '.cm-activeLine': {
    backgroundColor: '#f5f5f5',
  },
  // JavaScript 语法高亮
  '.cm-keyword': { color: '#7f0055', fontWeight: 'bold' },
  '.cm-atom': { color: '#219' },
  '.cm-number': { color: '#164' },
  '.cm-def': { color: '#00f' },
  '.cm-variable': { color: '#333' },
  '.cm-variable-2': { color: '#05a' },
  '.cm-variable-3': { color: '#085' },
  '.cm-property': { color: '#333' },
  '.cm-operator': { color: '#333' },
  '.cm-comment': { color: '#a50' },
  '.cm-string': { color: '#a11' },
  '.cm-string-2': { color: '#f50' },
  '.cm-meta': { color: '#555' },
  '.cm-qualifier': { color: '#555' },
  '.cm-builtin': { color: '#30a' },
  '.cm-bracket': { color: '#997' },
  '.cm-tag': { color: '#170' },
  '.cm-attribute': { color: '#00c' },
  '.cm-hr': { color: '#999' },
  '.cm-link': { color: '#00c' },
  '.cm-error': { color: '#f00' },
})

// 定义语法高亮样式
const jsHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#7f0055', fontWeight: 'bold' },
  { tag: tags.atom, color: '#219' }, // null, boolean, undefined
  { tag: tags.number, color: '#164' },
  { tag: tags.definition(tags.variableName), color: '#00f' }, // let/const/var name
  { tag: tags.variableName, color: '#333' }, // Other variable names
  { tag: tags.propertyName, color: '#333' }, // Object properties
  { tag: tags.operator, color: '#333' },
  { tag: tags.comment, color: '#a50', fontStyle: 'italic' },
  { tag: tags.string, color: '#a11' },
  { tag: tags.meta, color: '#555' }, // e.g., 'use strict'
  { tag: tags.function(tags.variableName), color: '#7f0055' }, // Function definition names
  { tag: tags.function(tags.propertyName), color: '#7f0055' }, // Method names
  { tag: tags.punctuation, color: '#997' }, // Brackets, commas etc.
  { tag: tags.className, color: '#085' },
  { tag: tags.modifier, color: '#085' }, // Like async
  { tag: tags.bool, color: '#219' },
  { tag: tags.regexp, color: '#f50' },
  { tag: tags.null, color: '#219' },
  { tag: tags.invalid, color: '#f00' },
])

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
  javascript(),
  lightTheme,
  syntaxHighlighting(jsHighlightStyle),
  keymap.of([
    {
      key: 'Ctrl-Enter',
      run: () => {
        handleCtrlEnter()
        return true
      },
    },
  ]),
]

const formatCode = async () => {
  try {
    const code = editorView.value.state.doc.toString()
    const formatted = await prettier.format(code, {
      parser: 'babel',
      plugins: [prettierPluginBabel, prettierPluginEstree],
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      printWidth: 80,
      trailingComma: 'none',
      bracketSpacing: true,
      arrowParens: 'avoid',
    })

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
      doc: '',
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
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
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
