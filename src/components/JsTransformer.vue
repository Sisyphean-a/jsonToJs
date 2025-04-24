<template>
  <div class="js-transformer">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
    </div>

    <div class="code-editor">
      <div ref="editor" class="hljs" v-html="highlightedCode"></div>
      <textarea
        v-model="jsCode"
        class="js-editor"
        @input="updateHighlight"
        @keydown.ctrl.enter.prevent="handleCtrlEnter"
        placeholder="在这里输入转换代码，例如：&#10;return {&#10;  ...json,&#10;  processed: true,&#10;  ids: json.data.map(item => item.id)&#10;}&#10;按下Ctrl+Enter快速执行"
      ></textarea>
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
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import * as prettier from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/parser-babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import CommonCodeDialog from './CommonCodeDialog.vue'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

const jsCode = ref('')
const error = ref('')
const isExecuting = ref(false)
const editor = ref(null)
const showCommonCodeDialog = ref(false)

const highlightedCode = computed(() => {
  return hljs.highlight(jsCode.value, { language: 'javascript' }).value
})

const updateHighlight = () => {
  if (editor.value) {
    editor.value.innerHTML = highlightedCode.value
  }
}

const formatCode = async () => {
  try {
    const formatted = await prettier.format(jsCode.value, {
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
    jsCode.value = formatted
    updateHighlight()
  } catch (err) {
    error.value = '格式化代码时出错：' + err.message
  }
}

const executeTransform = () => {
  isExecuting.value = true
  error.value = ''

  try {
    if (!jsCode.value.trim()) {
      emit('update:transformedJson', props.json)
      return
    }

    // 创建一个新的函数
    const transformFn = new Function(
      'json',
      `
      function transform(json) {
        ${jsCode.value}
      }
      return transform(json)
    `,
    )

    // 执行转换
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
  jsCode.value = code
  updateHighlight()
}

onMounted(() => {
  updateHighlight()
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
    position: relative;
  }

  .hljs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 10px;
    pointer-events: none;
    z-index: 1;
    white-space: pre;
    overflow: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .js-editor {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    background: transparent;
    color: transparent;
    caret-color: black;
    position: relative;
    z-index: 2;
    tab-size: 2;

    &:focus {
      outline: none;
      border-color: #409eff;
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
