<template>
  <div class="html-container">
    <v-snackbar
      v-model="snackbar"
      :timeout="500"
      color="success"
      location="top"
    >
      复制成功 {{ snackbarText }}
    </v-snackbar>
    <div class="html-content">
      <div
        :class="['html-view', hasChildren ? 'closeable' : '']"
        :style="'font-size:' + fontSize + 'px'"
        :data-path="componentId + '-' + htmlPath"
      >
        <span
          @click="toggleExpand"
          :class="['toggle-icon', !isExpanded ? 'closed' : '']"
          v-if="hasChildren || hasCollapsibleAttrs"
        ></span>
        <div class="content-wrap">
          <p class="first-line">
            <!-- 处理HTML注释 -->
            <template v-if="isComment">
              <span class="html-comment"> &lt;!--{{ commentContent }}--&gt; </span>
            </template>

            <!-- 处理普通元素 -->
            <template v-else-if="!isTextNode">
              <span class="html-tag">
                &lt;{{ tagInfo.name }}
                <template
                  v-for="(attr, index) in processedAttributes"
                  :key="index"
                >
                  <span class="html-attr">
                    <span class="attr-name">{{ attr.name }}</span>
                    <span v-if="attr.value !== undefined"
                      >="<span class="attr-value">
                        <template v-if="attr.name === 'class' && attr.isCollapsible">
                          <span
                            v-if="!isAttrExpanded(attr.name)"
                            @click.stop="toggleAttrExpand(attr.name)"
                            class="collapsed-attr"
                            >...</span
                          >
                          <span v-else>{{ attr.value }}</span>
                        </template>
                        <template v-else>
                          {{ attr.value }}
                        </template> </span
                      >"</span
                    >
                  </span>
                </template>
                {{ tagInfo.isSelfClosing ? '/' : '' }}&gt;
              </span>

              <!-- 处理折叠状态下的内容预览 -->
              <template v-if="hasChildren && !isExpanded">
                <span
                  class="collapsed-content"
                  @click="toggleExpand"
                  :title="htmlPath"
                >
                  ...
                </span>
                <span class="html-tag"> &lt;/{{ tagInfo.name }}&gt; </span>
              </template>

              <!-- 处理没有子元素但有文本内容的情况 -->
              <span
                v-if="!hasChildren && tagInfo.textContent"
                class="html-text"
              >
                {{ tagInfo.textContent }}
              </span>

              <!-- 处理没有子元素且没有内容的闭合标签 -->
              <span
                v-if="!hasChildren && !tagInfo.isSelfClosing && !tagInfo.textContent"
                class="html-tag"
              >
                &lt;/{{ tagInfo.name }}&gt;
              </span>
            </template>

            <!-- 处理纯文本节点 -->
            <template v-else>
              <span class="html-text">
                {{ props.html }}
              </span>
            </template>

            <button
              class="copy-btn"
              :class="{ 'root-level': isRootLevel }"
              @click.stop="copyHtml"
              title="复制HTML"
            >
              <img
                src="@/assets/icons/copy.svg"
                alt="复制"
                width="14"
                height="14"
              />
            </button>
            <button
              v-if="(isExpanded && hasCollapsedDescendants) || hasCollapsibleAttrs"
              class="expand-all-btn"
              :class="{ 'root-level': isRootLevel }"
              @click.stop="expandAllDescendants"
              title="展开所有子级"
            >
              <img
                src="@/assets/icons/expand.svg"
                alt="展开所有"
                width="14"
                height="14"
              />
            </button>
          </p>

          <div
            v-if="isExpanded && hasChildren && forceRender"
            class="html-body"
          >
            <!-- 子元素内容 -->
            <template
              v-for="(child, index) in renderedChildren"
              :key="index"
            >
              <html-view
                :html="child.html"
                :closed="closed"
                :fontSize="fontSize"
                :isRootLevel="false"
                :depth="currentDepth + 1"
                :maxExpandDepth="maxExpandDepth"
                :htmlPath="generateChildPath(index)"
                :componentId="componentId"
              ></html-view>
            </template>

            <p
              v-if="renderingComplete === false"
              class="html-loading"
            >
              加载中...
            </p>

            <span
              v-show="isExpanded"
              class="body-line"
            ></span>
          </div>

          <p
            v-if="isExpanded && hasChildren && !tagInfo.isSelfClosing && !isTextNode && !isComment"
            class="last-line"
          >
            <span class="html-tag">&lt;/{{ tagInfo.name }}&gt;</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  html: {
    type: String,
    required: true,
    default: '',
  },
  closed: {
    type: Boolean,
    default: false,
  },
  fontSize: {
    type: Number,
    default: 18,
  },
  isRootLevel: {
    type: Boolean,
    default: true,
  },
  // 当前深度层级
  depth: {
    type: Number,
    default: 0,
  },
  // 默认最大展开深度
  maxExpandDepth: {
    type: Number,
    default: 3,
  },
  // HTML 路径标识
  htmlPath: {
    type: String,
    default: '',
  },
  componentId: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 9),
  },
})

const snackbar = ref(false)
const snackbarText = ref('')

// 计算当前深度
const currentDepth = computed(() => props.depth)

// 展开/折叠状态
const isExpanded = ref(!(props.closed || props.depth >= props.maxExpandDepth))
// 是否需要渲染子节点
const forceRender = ref(isExpanded.value)

// 属性展开状态
const expandedAttrs = ref({})

// 检查属性是否展开
const isAttrExpanded = (attrName) => {
  return !!expandedAttrs.value[attrName]
}

// 切换属性展开状态
const toggleAttrExpand = (attrName) => {
  expandedAttrs.value[attrName] = !expandedAttrs.value[attrName]
}

// 异步渲染相关状态
const renderedChildren = ref([])
const renderingComplete = ref(false)
const batchSize = 10 // 每批渲染的项目数量

// 检查是否为HTML注释
const isComment = computed(() => {
  if (!props.html) return false
  return props.html.trim().startsWith('<!--') && props.html.trim().endsWith('-->')
})

// 提取注释内容
const commentContent = computed(() => {
  if (!isComment.value || !props.html) return ''
  const content = props.html.trim()
  return content.substring(4, content.length - 3)
})

// 检查是否为文本节点
const isTextNode = computed(() => {
  if (!props.html) return true
  // 如果不是以 < 开头，则认为是纯文本节点
  return !props.html.trim().startsWith('<') || props.html.trim() === '<!---->'
})

// 解析HTML字符串
const parseHtml = (htmlString) => {
  if (!htmlString) return []
  // 处理空注释标记
  if (htmlString.trim() === '<!---->') {
    return []
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${htmlString}</div>`, 'text/html')
  return doc.body.firstChild.childNodes
}

// 提取标签信息
const tagInfo = computed(() => {
  if (!props.html) {
    return {
      name: '',
      fullTag: '',
      textContent: '',
      attributes: [],
      isSelfClosing: false,
    }
  }

  // 处理注释或文本节点
  if (isComment.value || isTextNode.value) {
    return {
      name: '',
      fullTag: props.html,
      textContent: props.html,
      attributes: [],
      isSelfClosing: false,
    }
  }

  try {
    const parser = new DOMParser()
    // 修改解析方式，确保能正确处理colgroup等特殊标签
    let doc, element

    // 特殊处理表格相关标签
    const htmlTrim = props.html.trim()
    const firstTag = htmlTrim.split(/[\s>]/)[0].replace('<', '')

    if (
      htmlTrim.startsWith('<colgroup') ||
      htmlTrim.startsWith('<col') ||
      htmlTrim.startsWith('<thead') ||
      htmlTrim.startsWith('<tbody') ||
      htmlTrim.startsWith('<tr') ||
      htmlTrim.startsWith('<td') ||
      htmlTrim.startsWith('<th')
    ) {
      doc = parser.parseFromString(`<table>${props.html}</table>`, 'text/html')
      element = doc.querySelector(firstTag)
    } else {
      doc = parser.parseFromString(`<div>${props.html}</div>`, 'text/html')
      element = doc.body.firstChild.firstChild
    }

    // 如果解析失败或为空
    if (!element) {
      return {
        name: '',
        fullTag: props.html,
        textContent: props.html,
        attributes: [],
        isSelfClosing: false,
      }
    }

    // 处理元素节点
    const attributes = []
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        attributes.push({
          name: attr.name,
          value: attr.value,
        })
      }
    }

    // 检查是否为自闭合标签
    const isSelfClosing =
      /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(
        element.tagName,
      )

    // 获取直接文本内容（不包括子元素）
    let textContent = ''
    for (let i = 0; i < element.childNodes.length; i++) {
      if (element.childNodes[i].nodeType === Node.TEXT_NODE) {
        textContent += element.childNodes[i].textContent
      }
    }
    textContent = textContent.trim()

    return {
      name: element.tagName.toLowerCase(),
      fullTag: element.outerHTML,
      textContent,
      attributes,
      isSelfClosing,
    }
  } catch (e) {
    console.error('解析HTML失败', e)
    return {
      name: '',
      fullTag: props.html,
      textContent: props.html,
      attributes: [],
      isSelfClosing: false,
    }
  }
})

// 处理属性，为class属性添加折叠功能
const processedAttributes = computed(() => {
  if (!tagInfo.value.attributes) return []

  return tagInfo.value.attributes.map((attr) => {
    // 处理class属性
    if (attr.name === 'class' && attr.value) {
      const classNames = attr.value.split(/\s+/).filter(Boolean)
      return {
        ...attr,
        isCollapsible: classNames.length > 1,
      }
    }
    return attr
  })
})

// 检查是否有可折叠的属性
const hasCollapsibleAttrs = computed(() => {
  return processedAttributes.value.some((attr) => attr.isCollapsible)
})

// 解析子元素
const children = computed(() => {
  if (!props.html) return []
  
  // 处理注释或文本节点
  if (isComment.value || isTextNode.value) {
    return []
  }

  // 处理空注释标记
  if (props.html.trim() === '<!---->') {
    return []
  }

  try {
    const parser = new DOMParser()
    let element

    // 特殊处理表格相关标签
    const htmlTrim = props.html.trim()
    const firstTag = htmlTrim.split(/[\s>]/)[0].replace('<', '')

    if (
      htmlTrim.startsWith('<colgroup') ||
      htmlTrim.startsWith('<thead') ||
      htmlTrim.startsWith('<tbody') ||
      htmlTrim.startsWith('<tr') ||
      htmlTrim.startsWith('<td') ||
      htmlTrim.startsWith('<th')
    ) {
      const doc = parser.parseFromString(`<table>${props.html}</table>`, 'text/html')
      element = doc.querySelector(firstTag)
    } else if (htmlTrim.startsWith('<table')) {
      // 特殊处理完整表格
      const doc = parser.parseFromString(props.html, 'text/html')
      element = doc.querySelector('table')
    } else {
      const doc = parser.parseFromString(`<div>${props.html}</div>`, 'text/html')
      element = doc.body.firstChild.firstChild
    }

    if (!element) {
      return []
    }

    const result = []
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i]

      // 处理注释节点
      if (child.nodeType === Node.COMMENT_NODE) {
        result.push({
          html: `<!--${child.textContent}-->`,
          isComment: true,
        })
        continue
      }

      // 处理文本节点 - 跳过纯空白文本节点
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent.trim()
        if (text === '') continue

        result.push({
          html: child.textContent,
          isText: true,
        })
        continue
      }

      // 处理元素节点
      result.push({
        html: child.outerHTML,
        isElement: true,
      })
    }

    return result
  } catch (e) {
    console.error('解析子元素失败', e)
    return []
  }
})

// 是否有子元素
const hasChildren = computed(() => {
  return children.value.length > 0
})

// 生成子节点的HTML路径
const generateChildPath = (index) => {
  const basePathStr = props.htmlPath || ''
  return `${basePathStr}/${index}`
}

// 复制HTML
const copyHtml = () => {
  const htmlToCopy = props.html || ''
  navigator.clipboard.writeText(htmlToCopy).then(() => {
    snackbar.value = true
    snackbarText.value = ''
  })
}

// 切换展开/折叠状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value

  // 只有当展开时才设置forceRender为true
  if (isExpanded.value) {
    forceRender.value = true
    // 如果展开且尚未渲染任何项，则启动渲染
    if (children.value.length > 0 && renderedChildren.value.length === 0) {
      startRender()
    }
  }
}

// 开始渲染流程
const startRender = () => {
  // 如果子元素数量少，直接一次性渲染
  if (children.value.length <= batchSize) {
    renderedChildren.value = children.value
    renderingComplete.value = true
    return
  }

  // 重置渲染状态
  renderedChildren.value = []
  renderingComplete.value = false

  // 开始批量渲染
  nextTick(() => {
    renderBatch(0, children.value)
  })
}

// 异步渲染函数
const renderBatch = (startIdx, allChildren) => {
  const endIdx = Math.min(startIdx + batchSize, allChildren.length)

  // 使用requestIdleCallback实现时间分片（兼容性处理）
  const requestIdle =
    window.requestIdleCallback || ((cb) => setTimeout(() => cb({ timeRemaining: () => 50 }), 1))

  requestIdle(() => {
    // 如果已经折叠或不再需要渲染，则停止渲染过程
    if (!isExpanded.value || !forceRender.value) {
      renderingComplete.value = true
      return
    }

    renderedChildren.value = [...renderedChildren.value, ...allChildren.slice(startIdx, endIdx)]

    if (endIdx < allChildren.length) {
      renderBatch(endIdx, allChildren)
    } else {
      renderingComplete.value = true
    }
  })
}

// 检查是否有已折叠的后代节点
const hasCollapsedDescendants = computed(() => {
  // 如果当前节点没有子项，或者当前节点是折叠的，则没有需要展开的后代
  if (!hasChildren.value || !isExpanded.value) return false

  // 简单实现：如果有子元素，就认为可能需要展开
  return true
})

// 展开所有后代节点
const expandAllDescendants = () => {
  // 展开所有属性
  processedAttributes.value.forEach((attr) => {
    if (attr.isCollapsible) {
      expandedAttrs.value[attr.name] = true
    }
  })

  nextTick(() => {
    const currentElement = document.querySelector(
      `[data-path="${props.componentId}-${props.htmlPath}"]`,
    )
    if (!currentElement) return

    const childNodes = currentElement.querySelectorAll('.html-view')
    childNodes.forEach((node) => {
      const toggleIcon = node.querySelector('.toggle-icon')
      if (toggleIcon && toggleIcon.classList.contains('closed')) {
        toggleIcon.click()
      }
    })
  })
}

// 注册事件监听
onMounted(() => {
  if (isExpanded.value && forceRender.value && hasChildren.value) {
    startRender()
  }
})

// 移除事件监听
onUnmounted(() => {
  // 移除之前的事件监听
})

// 监听children变化
watch(
  () => children.value,
  (newChildren) => {
    // 只有在展开状态且需要渲染时才处理
    if (isExpanded.value && forceRender.value) {
      // 如果children为空，直接设置完成
      if (newChildren.length === 0) {
        renderedChildren.value = newChildren
        renderingComplete.value = true
        return
      }

      startRender()
    }
  },
)
</script>

<style lang="scss" scoped>
.html-container {
  background-color: var(--bg-secondary);
  padding: var(--spacing-sm);
  padding-right: var(--spacing-4xl);
  border-radius: var(--radius-sm);
  position: relative;
}

.html-content {
  position: relative;
}

.html-view {
  position: relative;
  display: block;
  width: 100%;
  white-space: nowrap;
  padding-left: var(--spacing-xl);
  box-sizing: border-box;
  font-family: var(--font-family-mono);
  line-height: 1.5;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 16px;
  height: 16px;
  margin-left: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);

  /* 根层级永远显示 */
  &.root-level {
    opacity: 0.7;
  }

  &:hover {
    opacity: 1;
  }
}

/* 非根层级，鼠标悬停时显示 */
.first-line:hover .copy-btn:not(.root-level) {
  opacity: 0.7;
}

.html-loading {
  padding-left: var(--spacing-xl);
  color: var(--text-tertiary);
  font-style: italic;
}

.collapsed-content {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 var(--spacing-xs);
  border-radius: var(--radius-xs);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.collapsed-attr {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 var(--spacing-xs);
  border-radius: var(--radius-xs);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.first-line {
  padding: 0;
  margin: 0;
  line-height: 1.6;
  min-height: 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.html-body {
  position: relative;
  padding: 0;
  margin: 0 0 0 1px;

  .body-line {
    position: absolute;
    height: 100%;
    width: 0;
    border-left: 1px solid var(--border-light);
    top: 0;
    left: 2px;
  }
}

.last-line {
  padding: 0;
  margin: 0;
  min-height: 22px;
}

.toggle-icon {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 16px;
  height: 16px;
  text-align: center;
  left: 0;
  top: 7px;
  border-radius: var(--radius-xs);
  transition: all var(--transition-fast);

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 3px 0 3px;
    border-color: var(--text-secondary) transparent transparent transparent;
    transition: transform var(--transition-fast);
  }

  &.closed::before {
    transform: rotate(-90deg);
  }
}

.expand-all-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 16px;
  height: 16px;
  margin-left: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);

  /* 根层级永远显示 */
  &.root-level {
    opacity: 0.7;
  }

  &:hover {
    opacity: 1;
  }
}

/* 非根层级，鼠标悬停时显示 */
.first-line:hover .expand-all-btn:not(.root-level) {
  opacity: 0.7;
}

.html-tag {
  color: var(--color-info);
}

.html-attr {
  margin-left: var(--spacing-xs);

  .attr-name {
    color: #e83e8c;
  }

  .attr-value {
    color: var(--color-success);
  }
}

.html-text {
  color: var(--text-primary);
  margin-left: var(--spacing-xs);
}

.html-comment {
  color: var(--text-tertiary);
  font-style: italic;
}
</style>
