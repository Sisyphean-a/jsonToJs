<template>
  <resizable-layout :column-count="columnCount">
    <template #column1>
      <html-input
        :initial-html="pageState.htmlInput"
        @update:html="handleHtmlUpdate"
        @update:htmlInput="handleHtmlInputUpdate"
      />
    </template>

    <template #column2>
      <resizable-row-layout :row-count="2">
        <template #row1>
          <html-view :html="pageState.html" />
        </template>
        <template #row2>
          <html-preview :html="pageState.html" />
        </template>
      </resizable-row-layout>
    </template>
  </resizable-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ResizableLayout from '@/components/ResizableLayout.vue'
import ResizableRowLayout from '@/components/ResizableRowLayout.vue'
import HtmlView from './components/HtmlView.vue'
import HtmlInput from './components/HtmlInput.vue'
import HtmlPreview from './components/HtmlPreview.vue'
import { usePageStateStore } from '@/stores/pageState.js'

const pageStateStore = usePageStateStore()

// 默认HTML示例
const defaultHtml = '<button class="a b"><span class="c">按钮</i></button>'

const columnCount = ref(2)

// 获取页面状态
const pageState = pageStateStore.getHtmlPageState

// 初始化页面状态
onMounted(() => {
  pageStateStore.initHtmlPage(defaultHtml)
})

// 处理HTML输入文本更新
const handleHtmlInputUpdate = (newHtmlInput) => {
  pageStateStore.updateHtmlInput(newHtmlInput)
}

// 处理HTML更新
const handleHtmlUpdate = (newHtml) => {
  pageStateStore.updateHtml(newHtml)
}
</script>

<style lang="scss" scoped></style>
