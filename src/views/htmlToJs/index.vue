<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <html-input
        :initial-html="htmlInput"
        @update:html="html = $event"
      />
    </template>

    <template #column2>
      <resizable-row-layout :row-count="2">
        <template #row1>
          <html-view :html="html" />
        </template>
        <template #row2>
          <html-preview :html="html" />
        </template>
      </resizable-row-layout>
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref } from 'vue'
import ResizableLayout from '@/components/ResizableLayout.vue'
import ResizableRowLayout from '@/components/ResizableRowLayout.vue'
import HtmlView from './components/HtmlView.vue'
import HtmlInput from './components/HtmlInput.vue'
import HtmlPreview from './components/HtmlPreview.vue'
// 默认HTML示例
const defaultHtml = '<button class="a b"><span class="c">按钮</i></button>'

const html = ref(defaultHtml)
const htmlInput = ref(defaultHtml)
const columnCount = ref(2)
</script>

<style lang="scss" scoped></style>
