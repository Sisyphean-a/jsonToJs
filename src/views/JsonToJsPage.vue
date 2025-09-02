<template>
  <div class="json-to-js-page">
    <resizable-layout :column-count="3">
      <template #column1>
        <json-display-with-input />
      </template>
      <template #column2>
        <js-transformer />
      </template>
      <template #column3>
        <JsonResultDisplay />
      </template>
    </resizable-layout>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { provideJsonContext } from '@/features/json-processor/composables/useJsonContext.js'
import { usePageStateStore } from '@/stores/pageState.js'
import ResizableLayout from '@/components/layout/ResizableLayout.vue'
import JsonDisplayWithInput from '@/features/json-processor/components/JsonDisplayWithInput.vue'
import JsTransformer from '@/features/json-processor/components/JsTransformer.vue'
import JsonResultDisplay from '@/features/json-processor/components/JsonResultDisplay.vue'

// 提供上下文，子组件可以直接使用
provideJsonContext()

// 使用页面状态store
const pageStateStore = usePageStateStore()

onMounted(() => {
  // 初始化页面状态
  pageStateStore.initJsonPage()
})
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
