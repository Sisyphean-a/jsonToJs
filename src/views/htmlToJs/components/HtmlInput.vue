<template>
  <div class="html-input-container">
    <div class="toolbar">
      <h2>HTML 输入</h2>
      <div class="actions">
        <button
          @click="resetContent"
          class="action-btn"
        >
          移除注释
        </button>
        <button
          @click="openAttributeSelector"
          class="action-btn"
        >
          移除指定属性
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
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.action-btn {
  padding: 4px 12px;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f1f3f5;
  }

  &:active {
    background-color: #e9ecef;
  }
}

.html-textarea {
  flex: 1;
  width: 100%;
  padding: 12px;
  border: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f0f0f0;
  color: #212529;
  outline: none;

  &::placeholder {
    color: #adb5bd;
  }
}
</style>
