<template>
  <div class="html-input-container">
    <div class="toolbar">
      <h2>HTML 输入</h2>
      <div class="actions">
        <button
          @click="resetContent"
          class="btn btn--sm btn--secondary"
        >
          移除注释
        </button>
        <button
          @click="openAttributeSelector"
          class="btn btn--sm btn--secondary"
        >
          移除指定属性
        </button>
        <button
          @click="convertToJson"
          class="btn btn--sm btn--primary"
        >
          转换成JSON
        </button>
      </div>
    </div>
    <textarea
      v-model="htmlContent"
      class="html-textarea"
      placeholder="请输入HTML代码..."
      @input="updateHtml"
      spellcheck="false"
    ></textarea>

    <!-- 使用提取出的属性选择弹窗组件 -->
    <AttributeModal
      v-model="showAttributeModal"
      :attributes="attributeList"
      @remove-attributes="handleRemoveAttributes"
    />

    <!-- 成功提示组件 -->
    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      color="success"
      location="top"
    >
      {{ snackbarText }}
    </v-snackbar>

    <!-- 错误提示组件 -->
    <v-snackbar
      v-model="errorSnackbar"
      :timeout="3000"
      color="error"
      location="top"
    >
      {{ errorSnackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AttributeModal from './AttributeModal.vue'

const props = defineProps({
  initialHtml: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:html', 'update:htmlInput'])

const htmlContent = ref(props.initialHtml)
const showAttributeModal = ref(false)
const attributeList = ref([])

// Snackbar 相关变量
const snackbar = ref(false)
const snackbarText = ref('')
const errorSnackbar = ref(false)
const errorSnackbarText = ref('')

// 当输入变化时更新HTML
const updateHtml = () => {
  emit('update:htmlInput', htmlContent.value)
  emit('update:html', htmlContent.value)
}

// 重置为初始内容
const resetContent = () => {
  // 移除HTML注释 <!--comment-->
  htmlContent.value = htmlContent.value.replace(/<!--[\s\S]*?-->/g, '')
  updateHtml()
}

// 打开属性选择器
const openAttributeSelector = () => {
  // 提取HTML中所有唯一的属性名
  const attrRegex = /\s([a-zA-Z0-9_:-]+)(?:=["'][^"']*["']|=\S*|(?=\s|>))/g
  const attrSet = new Set()
  let match

  // 复制HTML内容以便处理
  const htmlForParsing = htmlContent.value

  // 使用正则表达式提取所有属性
  while ((match = attrRegex.exec(htmlForParsing)) !== null) {
    attrSet.add(match[1])
  }

  // 转换为数组格式
  attributeList.value = Array.from(attrSet)
    .map((name) => ({
      name,
      selected: false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  showAttributeModal.value = true
}

// 处理从AttributeModal组件返回的移除属性请求
const handleRemoveAttributes = (selectedAttrs) => {
  if (selectedAttrs.length === 0) {
    showAttributeModal.value = false
    return
  }

  // 为每个选中的属性创建正则表达式并替换
  selectedAttrs.forEach((attrName) => {
    // 匹配三种情况: 带引号的值、不带引号的值、无值属性
    const attrRegex = new RegExp(`\\s+${attrName}(?:=["'][^"']*["']|=\\S*|(?=\\s|>))`, 'g')
    htmlContent.value = htmlContent.value.replace(attrRegex, '')
  })

  updateHtml()
  showAttributeModal.value = false
}

// 转换HTML为JSON格式
const convertToJson = async () => {
  try {
    if (!htmlContent.value.trim()) {
      errorSnackbarText.value = '请先输入HTML内容'
      errorSnackbar.value = true
      return
    }

    const jsonResult = htmlToJson(htmlContent.value)
    const jsonString = JSON.stringify(jsonResult, null, 2)
    
    // 复制到剪切板
    await navigator.clipboard.writeText(jsonString)
    snackbarText.value = 'JSON已复制到剪切板'
    snackbar.value = true
  } catch (error) {
    console.error('转换失败:', error)
    errorSnackbarText.value = '转换失败，请检查HTML格式是否正确'
    errorSnackbar.value = true
  }
}

// HTML转JSON的核心方法
const htmlToJson = (htmlString) => {
  // 创建临时DOM元素来解析HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  
  // 如果HTML包含在body中，提取body的内容
  const bodyContent = doc.body
  if (bodyContent.children.length === 1) {
    return processNode(bodyContent.children[0])
  } else if (bodyContent.children.length > 1) {
    // 多个根元素的情况
    return Array.from(bodyContent.children).map(child => processNode(child))
  } else {
    // 没有元素节点，可能只有文本
    return processTextContent(bodyContent)
  }
}

// 处理单个节点
const processNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim()
    return text ? { _text: text } : null
  }
  
  if (node.nodeType === Node.COMMENT_NODE) {
    return { _comment: node.textContent }
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const result = {
    _tag: node.tagName.toLowerCase()
  }

  // 处理属性
  if (node.attributes.length > 0) {
    result._attrs = {}
    for (const attr of node.attributes) {
      result._attrs[attr.name] = attr.value
    }
  }

  // 处理子节点
  let firstTextFound = false
  let firstCommentFound = false
  const children = []

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim()
      if (text) {
        if (!firstTextFound) {
          // 首段文本作为_text属性
          result._text = text
          firstTextFound = true
        } else {
          // 其余文本放入children
          children.push({ _text: text })
        }
      }
    } else if (child.nodeType === Node.COMMENT_NODE) {
      if (!firstCommentFound) {
        // 首条注释作为_comment属性
        result._comment = child.textContent
        firstCommentFound = true
      } else {
        // 其余注释放入children
        children.push({ _comment: child.textContent })
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const processedChild = processNode(child)
      if (processedChild) {
        children.push(processedChild)
      }
    }
  }

  // 如果有子节点，添加_children数组
  if (children.length > 0) {
    result._children = children
  }

  return result
}

// 处理纯文本内容
const processTextContent = (container) => {
  const text = container.textContent.trim()
  return text ? { _text: text } : null
}

// 监听初始HTML变化，只在值真正不同时才更新
watch(
  () => props.initialHtml,
  (newValue) => {
    if (newValue !== htmlContent.value) {
      htmlContent.value = newValue
    }
  },
)
</script>

<style lang="scss" scoped>
.html-input-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-light);

  h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
  }

  .actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}

.html-textarea {
  flex: 1;
  width: 100%;
  padding: var(--spacing-md);
  border: none;
  resize: none;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
  line-height: 1.5;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: background-color var(--transition-fast);

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:focus {
    background-color: var(--bg-secondary);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;

    .actions {
      justify-content: center;
    }
  }

  .html-textarea {
    padding: var(--spacing-sm);
    font-size: var(--font-size-base);
  }
}
</style>
