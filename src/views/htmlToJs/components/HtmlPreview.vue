<template>
  <div>
    <div v-html="processedHtml"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
})

// 处理HTML内容：移除所有属性并添加预览样式类，但保留表格的rowspan和colspan属性
const processedHtml = computed(() => {
  if (!props.html) return ''

  // 使用正则表达式处理HTML
  let processed = props.html

  // 表格相关标签，需要保留 rowspan 和 colspan 属性
  const tableElements = ['table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot']

  // 处理所有标签
  processed = processed.replace(/<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName) => {
    const lowerTagName = tagName.toLowerCase()

    // 如果是表格相关元素，保留 rowspan 和 colspan 属性
    if (tableElements.includes(lowerTagName)) {
      const attributes = []

      // 提取 rowspan 属性
      const rowspanMatch = match.match(/rowspan\s*=\s*["']?([^"'\s>]+)["']?/i)
      if (rowspanMatch) {
        attributes.push(`rowspan="${rowspanMatch[1]}"`)
      }

      // 提取 colspan 属性
      const colspanMatch = match.match(/colspan\s*=\s*["']?([^"'\s>]+)["']?/i)
      if (colspanMatch) {
        attributes.push(`colspan="${colspanMatch[1]}"`)
      }

      // 构建新标签
      const attributesStr = attributes.length > 0 ? ' ' + attributes.join(' ') : ''
      return `<${tagName} class="preview-element" title="${tagName}"${attributesStr}>`
    } else {
      // 非表格元素，移除所有属性
      return `<${tagName} class="preview-element" title="${tagName}">`
    }
  })

  return processed
})
</script>

<style lang="scss" scoped>
// 为所有预览元素添加边框和内边距样式
:deep(.preview-element) {
  border: 1px solid #007bff !important;
  padding: 4px !important;
  margin: 3px !important;
  display: inline-block !important;
  min-height: 20px !important;
  box-sizing: border-box !important;
  vertical-align: top !important;

  // 确保块级元素正确显示
  &:is(
      div,
      p,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      section,
      article,
      header,
      footer,
      nav,
      aside,
      main,
      ul,
      ol,
      li,
      blockquote,
      pre
    ) {
    display: block !important;
    margin: 3px 0 !important;
    clear: both !important;
  }

  // 确保内联元素正确显示
  &:is(span, a, em, strong, b, i, u, small, mark, sub, sup, code) {
    display: inline-block !important;
    margin: 2px !important;
    vertical-align: top !important;
  }

  // 按钮元素样式
  &:is(button) {
    display: inline-block !important;
    padding: 6px 12px !important;
    margin: 3px !important;
    vertical-align: top !important;
  }

  // 图片元素样式 - 隐藏破碎图标
  &:is(img) {
    display: inline-block !important;
    width: 60px !important;
    height: 30px !important;
    margin: 3px !important;
    background-color: #e9ecef !important;
    position: relative !important;
    vertical-align: top !important;

    // 隐藏破碎的图片图标
    &::before {
      content: 'IMG' !important;
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      font-size: 10px !important;
      color: #6c757d !important;
      font-weight: bold !important;
    }

    // 完全隐藏原始图片内容
    color: transparent !important;
    font-size: 0 !important;
    text-indent: -9999px !important;
    overflow: hidden !important;
  }

  // SVG主元素样式
  &:is(svg) {
    display: inline-block !important;
    width: 20px !important;
    height: 20px !important;
    margin: 3px !important;
    overflow: hidden !important;
    vertical-align: top !important;
  }

  // SVG内部元素样式
  &:is(path, g, ellipse, circle, rect, line, polyline, polygon, text, tspan) {
    display: inline-block !important;
    margin: 2px !important;
    padding: 2px !important;
    max-width: 100px !important;
    overflow: hidden !important;
    vertical-align: top !important;
  }

  // SVG定义元素样式（通常不可见但需要样式）
  &:is(defs, filter, linearGradient, radialGradient, stop, clipPath, mask, pattern) {
    display: inline-block !important;
    margin: 2px !important;
    padding: 1px !important;
    max-width: 80px !important;
    background-color: rgba(255, 255, 0, 0.1) !important; // 淡黄色背景便于识别
    font-size: 10px !important;
    vertical-align: top !important;
  }

  // SVG滤镜元素样式
  &:is(
      feFlood,
      feBlend,
      feGaussianBlur,
      feOffset,
      feColorMatrix,
      feMorphology,
      feConvolveMatrix,
      feTurbulence,
      feComposite,
      feMerge,
      feMergeNode
    ) {
    display: inline-block !important;
    margin: 2px !important;
    padding: 1px !important;
    max-width: 60px !important;
    background-color: rgba(0, 255, 0, 0.1) !important; // 淡绿色背景便于识别
    font-size: 9px !important;
    vertical-align: top !important;
  }

  // 字体元素样式
  &:is(font) {
    display: inline-block !important;
    margin: 2px !important;
    vertical-align: top !important;
  }

  // 其他可能的HTML5元素
  &:is(video, audio, canvas, iframe, embed, object) {
    display: inline-block !important;
    max-width: 150px !important;
    max-height: 100px !important;
    margin: 3px !important;
    vertical-align: top !important;
  }

  // 表格元素
  &:is(table) {
    display: table !important;
    margin: 3px !important;
    padding: 4px !important;
    border-collapse: separate !important;
    border-spacing: 2px !important;
    width: auto !important;
    border: 2px solid #007bff !important;
  }

  &:is(tr) {
    display: table-row !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 1px solid #007bff !important;
  }

  &:is(td, th) {
    display: table-cell !important;
    margin: 0 !important;
    padding: 6px 8px !important;
    vertical-align: top !important;
    border: 1px solid #007bff !important;
    min-height: 20px !important;
    min-width: 40px !important;
    text-align: center !important;

    // 确保合并单元格正确显示
    &[rowspan],
    &[colspan] {
      background-color: rgba(0, 123, 255, 0.1) !important;
      font-weight: bold !important;
    }
  }

  &:is(thead, tbody, tfoot) {
    display: table-row-group !important;
    margin: 2px !important;
    padding: 2px !important;
  }

  // 表单元素
  &:is(input, textarea, select, option, label, fieldset, legend) {
    display: inline-block !important;
    margin: 3px !important;
    max-width: 120px !important;
    vertical-align: top !important;
  }
}

// 整体容器样式
div {
  padding: var(--spacing-lg);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: auto;
  font-family: var(--font-family-base);
  line-height: 1.4;
}
</style>
