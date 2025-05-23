<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <html-input
        :initial-html="htmlInput"
        @update:html="html = $event"
      />
    </template>

    <template #column2>
      <html-view :html="html" />
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref } from 'vue'
import ResizableLayout from '@/components/ResizableLayout.vue'
import HtmlView from './components/HtmlView.vue'
import HtmlInput from './components/HtmlInput.vue'

// 默认HTML示例
const defaultHtml = '<button class="a b"><span class="c">按钮</i></button>'

const html = ref(defaultHtml)
const htmlInput = ref(defaultHtml)
const columnCount = ref(2)
</script>

<style lang="scss" scoped></style>
