<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <json-input-content :initial-json="jsonInput" @update:json="json = $event" />
    </template>

    <template #column2>
      <json-view :json="json" />
    </template>

    <template #column3>
      <div>第三列内容</div>
    </template>

    <template #column4>
      <div>第四列内容</div>
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref } from 'vue'
import jsonView from '@/components/JsonView.vue'
import JsonInputContent from '@/components/JsonInputContent.vue'
import ResizableLayout from '@/components/ResizableLayout.vue'

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

const json = ref(defaultJson)
const jsonInput = ref(JSON.stringify(defaultJson, null, 2))
const columnCount = ref(4) // 默认4列，可以根据需要调整
</script>

<style lang="scss" scoped></style>
