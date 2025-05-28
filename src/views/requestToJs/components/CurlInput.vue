<template>
  <div class="curl-input">
    <div class="input-header">
      <span>cURL 命令输入</span>
      <div class="header-buttons">
        <v-btn
          density="compact"
          variant="text"
          @click="loadExampleCurl('get')"
          size="small"
        >
          GET 示例
        </v-btn>
        <v-btn
          density="compact"
          variant="text"
          @click="loadExampleCurl('post')"
          size="small"
        >
          POST 示例
        </v-btn>
        <v-btn
          density="compact"
          variant="text"
          @click="loadExampleCurl('github')"
          size="small"
        >
          GitHub API
        </v-btn>
        <v-btn
          density="compact"
          variant="text"
          @click="loadExampleCurl('httpbin')"
          size="small"
        >
          HTTPBin
        </v-btn>
        <v-btn
          density="compact"
          variant="text"
          @click="clearInput"
          size="small"
        >
          清空
        </v-btn>
      </div>
    </div>
    
    <v-textarea
      v-model="localCurlInput"
      :label="hasError ? '解析错误' : '粘贴 cURL (bash) 命令'"
      auto-grow
      filled
      height="100%"
      @input="handleInput"
      class="pa-2"
      :error="hasError"
      placeholder="粘贴你的 cURL (bash) 命令到这里，然后会自动解析..."
    ></v-textarea>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { parseCurlCommand } from '@/utils/curlParser.js'

const props = defineProps({
  initialCurl: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:curl', 'update:curlInput'])

const localCurlInput = ref(props.initialCurl)
const hasError = ref(false)

// 监听外部cURL变化，只在值真正不同时才更新
watch(
  () => props.initialCurl,
  (newVal) => {
    if (newVal !== localCurlInput.value) {
      localCurlInput.value = newVal
      hasError.value = false
    }
  },
)

// 处理输入变化
const handleInput = () => {
  // 发射原始输入文本
  emit('update:curlInput', localCurlInput.value)

  try {
    if (!localCurlInput.value.trim()) {
      // 如果输入为空，发射空的请求对象
      emit('update:curl', {
        url: '',
        method: 'GET',
        headers: {},
        body: null
      })
      hasError.value = false
      return
    }

    const parsedCurl = parseCurlCommand(localCurlInput.value)
    if (parsedCurl) {
      emit('update:curl', parsedCurl)
      hasError.value = false
    } else {
      throw new Error('无法解析 cURL 命令，请检查格式')
    }
  } catch (e) {
    const errorRequest = {
      url: '',
      method: 'GET',
      headers: {},
      body: null,
      error: e.message,
      rawInput: localCurlInput.value
    }
    emit('update:curl', errorRequest)
    hasError.value = true
  }
}

// 加载示例cURL
const loadExampleCurl = (type) => {
  if (type === 'get') {
    localCurlInput.value = `curl 'https://jsonplaceholder.typicode.com/posts/1' \\
  -H 'Accept: application/json' \\
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'`
  } else if (type === 'post') {
    localCurlInput.value = `curl 'https://jsonplaceholder.typicode.com/posts' \\
  -X POST \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  --data-raw '{
    "title": "测试标题",
    "body": "测试内容",
    "userId": 1
  }'`
  } else if (type === 'github') {
    localCurlInput.value = `curl 'https://api.github.com/users/octocat' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'User-Agent: MyApp/1.0'`
  } else if (type === 'httpbin') {
    localCurlInput.value = `curl 'https://httpbin.org/get?param1=value1&param2=value2' \\
  -H 'Accept: application/json' \\
  -H 'X-Custom-Header: test-value'`
  }
  handleInput()
}

// 清空输入
const clearInput = () => {
  localCurlInput.value = ''
  handleInput()
}
</script>

<style lang="scss" scoped>
.curl-input {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  font-weight: bold;
  background-color: var(--bg-tertiary, #f0f0f0);
  border-bottom: 1px solid var(--border-light, #ccc);
  
  .header-buttons {
    display: flex;
    gap: var(--spacing-xs, 4px);
  }
}

.cors-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: var(--radius-xs, 2px);
  font-size: var(--font-size-sm, 12px);
  color: #856404;
  margin: var(--spacing-xs, 4px);
}

:deep(.v-input__details) {
  display: none;
}

:deep(.v-textarea) {
  flex: 1;
}
</style> 