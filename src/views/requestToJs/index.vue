<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <curl-input
        :initial-curl="pageState.curlCommandInput"
        @update:curl="handleCurlUpdate"
        @update:curlInput="handleCurlInputUpdate"
      />
    </template>

    <template #column2>
      <request-view :request="pageState.parsedRequest" />
    </template>

    <template #column3>
      <request-transformer
        :request="pageState.parsedRequest"
        @update:transformedRequest="handleTransformedRequestUpdate"
      />
    </template>

    <template #column4>
      <request-view :request="pageState.transformedRequest" />
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ResizableLayout from '@/components/ResizableLayout.vue'
import CurlInput from './components/CurlInput.vue'
import RequestView from './components/RequestView.vue'
import RequestTransformer from './components/RequestTransformer.vue'
import { usePageStateStore } from '@/stores/pageState.js'

const pageStateStore = usePageStateStore()

// 默认cURL示例
const defaultCurl = `curl 'https://jsonplaceholder.typicode.com/posts/1' \\
  -H 'Accept: application/json' \\
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'`

const defaultParsedRequest = {
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  body: null
}

const defaultTransformedRequest = {
  message: "请求已准备就绪",
  requestDetails: defaultParsedRequest,
  commonCodeSnippets: []
}

const columnCount = ref(4)

// 获取页面状态
const pageState = pageStateStore.getRequestToJsPageState

// 初始化页面状态
onMounted(() => {
  pageStateStore.initRequestToJsPage()
})

// 处理cURL输入文本更新
const handleCurlInputUpdate = (newCurlInput) => {
  pageStateStore.updateCurlCommandInput(newCurlInput)
}

// 处理cURL解析更新
const handleCurlUpdate = (newParsedRequest) => {
  pageStateStore.updateParsedRequest(newParsedRequest)
}

// 处理转换后请求更新
const handleTransformedRequestUpdate = (newTransformedRequest) => {
  pageStateStore.updateTransformedRequest(newTransformedRequest)
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}
</style>
