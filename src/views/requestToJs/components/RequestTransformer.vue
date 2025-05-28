<template>
  <div class="request-transformer">
    <div class="function-header">
      <span style="color: #2196f3">function </span>
      <span style="color: #4caf50">processRequest</span>(<span style="color: #ff9800">request</span
      >) {
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
        @click="executeRequest"
        :disabled="isExecuting || !canSendRequest"
      >
        <span>{{ isExecuting ? '发送中...' : '发送请求' }}</span>
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
      type="request"
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
import { ref, computed } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CommonCodeDialog from '@/components/CommonCodeDialog.vue'
import { getCodesByType } from '@/utils/commonCodes.js'

const props = defineProps({
  request: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedRequest'])

const codeEditor = ref(null)
const code = ref('')
const error = ref('')
const isExecuting = ref(false)
const showCommonCodeDialog = ref(false)

// 默认代码
const defaultCode = `// Ctrl + Enter：格式化+执行
// Ctrl + S：格式化
// Ctrl + /：注释/取消注释

// 你可以在这里修改请求参数
// request.url = 'https://api.example.com/data'
// request.headers['Authorization'] = 'Bearer your-token'
// request.body = JSON.stringify({key: 'value'})

return request`

// 初始化代码
code.value = defaultCode

// 检查是否可以发送请求
const canSendRequest = computed(() => {
  return props.request && props.request.url && !props.request.error
})

const formatCode = async () => {
  try {
    await codeEditor.value?.formatCode()
  } catch (err) {
    error.value = err.message
  }
}

const executeRequest = async () => {
  isExecuting.value = true
  error.value = ''

  try {
    // 首先执行用户的代码来处理请求
    let processedRequest = { ...props.request }

    const currentCode = codeEditor.value?.getCode() || code.value
    if (currentCode.trim() && !currentCode.includes('return request')) {
      // 如果用户有自定义代码但没有return语句，添加return
      const transformFn = new Function(
        'request',
        `
        function processRequest(request) {
          ${currentCode}
          return request
        }
        return processRequest(request)
      `,
      )
      processedRequest = transformFn(props.request)
    } else if (currentCode.trim()) {
      // 如果有return语句，直接执行
      const transformFn = new Function(
        'request',
        `
        function processRequest(request) {
          ${currentCode}
        }
        return processRequest(request)
      `,
      )
      processedRequest = transformFn(props.request)
    }

    // 发送请求
    if (!processedRequest.url) {
      throw new Error('请求URL不能为空')
    }

    const requestOptions = {
      method: processedRequest.method || 'GET',
      headers: processedRequest.headers || {},
    }

    // 只有在非GET请求时才添加body
    if (processedRequest.method !== 'GET' && processedRequest.body) {
      requestOptions.body = processedRequest.body
    }

    const response = await fetch(processedRequest.url, requestOptions)

    const responseText = await response.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    const snippets = getCodesByType('request')
    const finalOutput = {
      message: '请求发送成功',
      requestSent: {
        url: processedRequest.url,
        method: processedRequest.method,
        headers: processedRequest.headers,
        body: processedRequest.body || null,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseData,
      },
      commonCodeSnippets: snippets,
      note: '注意：某些请求可能因为CORS限制而失败。建议使用支持跨域的公共API进行测试。',
    }

    emit('update:transformedRequest', finalOutput)
  } catch (err) {
    console.error('请求执行错误:', err)

    const snippets = getCodesByType('request')
    let errorMessage = err.message
    let corsHelp = ''

    // 检查是否是CORS错误
    if (
      err.message.includes('Failed to fetch') ||
      err.message.includes('CORS') ||
      err.message.includes('Access-Control-Allow-Origin')
    ) {
      corsHelp = ``
      errorMessage = 'CORS跨域请求被阻止'
    }

    const errorOutput = {
      message: '请求执行失败',
      error: errorMessage,
      errorDetails: err.message,
      requestAttempted: {
        url: props.request.url,
        method: props.request.method,
        headers: props.request.headers,
        body: props.request.body || null,
      },
      corsHelp: corsHelp,
      commonCodeSnippets: snippets,
      suggestedTestAPIs: [
        {
          name: 'JSONPlaceholder - GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          description: '免费的JSON测试API',
        },
        {
          name: 'HTTPBin - GET',
          url: 'https://httpbin.org/get',
          description: 'HTTP请求测试服务',
        },
        {
          name: 'GitHub API - GET',
          url: 'https://api.github.com/users/octocat',
          description: 'GitHub公共API',
        },
        {
          name: 'JSONPlaceholder - POST',
          url: 'https://jsonplaceholder.typicode.com/posts',
          description: '支持POST的测试API',
        },
      ],
    }

    emit('update:transformedRequest', errorOutput)
    error.value = errorMessage + corsHelp
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
  executeRequest()
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
.request-transformer {
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
  .request-transformer {
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
  .request-transformer {
    padding: var(--spacing-sm);

    .btn {
      width: 100%;
      max-width: 280px;
    }
  }
}
</style>
