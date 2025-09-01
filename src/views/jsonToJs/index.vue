<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <json-display-with-input
        :initial-json="pageState.jsonInput"
        :json="pageState.json"
        @update:json="handleJsonUpdate"
        @update:jsonInput="handleJsonInputUpdate"
      />
    </template>

    <template #column2>
      <js-transformer
        :json="pageState.json"
        @update:transformedJson="handleTransformedJsonUpdate"
      />
    </template>

    <template #column3>
      <json-view :json="pageState.transformedJson" />
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import JsonView from './components/JsonView.vue'
import JsonDisplayWithInput from '@/components/JsonDisplayWithInput.vue'
import ResizableLayout from '@/components/ResizableLayout.vue'
import JsTransformer from './components/JsTransformer.vue'
import { usePageStateStore } from '@/stores/pageState.js'

const pageStateStore = usePageStateStore()

// 默认JSON数据
const defaultJson = {
  name: '张三',
  age: 18,
  gender: '男',
  address: {
    province: '北京',
    city: '北京',
    district: '朝阳区',
  },
}

const defaultTransformedJson = {
  province: '北京',
  city: '北京',
  district: '朝阳区',
}

const columnCount = ref(3) // 三列布局：JSON展示+输入列、代码列、结果展示列

// 获取页面状态
const pageState = pageStateStore.getJsonPageState

// 初始化页面状态
onMounted(() => {
  pageStateStore.initJsonPage(defaultJson, defaultTransformedJson)
})

// 处理JSON输入文本更新
const handleJsonInputUpdate = (newJsonInput) => {
  pageStateStore.updateJsonInput(newJsonInput)
}

// 处理JSON更新
const handleJsonUpdate = (newJson) => {
  pageStateStore.updateJson(newJson)
}

// 处理转换后JSON更新
const handleTransformedJsonUpdate = (newTransformedJson) => {
  pageStateStore.updateTransformedJson(newTransformedJson)
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
