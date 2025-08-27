<template>
  <BaseModal
    v-model="dialog"
    size="large"
    @close="closeDialog"
  >
    <!-- 头部 -->
    <template #header>
      <ModalHeader
        :title="dialogTitle"
        subtitle="选择并快速使用"
        icon="mdi-code-braces"
        @close="closeDialog"
      />
    </template>

    <!-- 内容 -->
    <template #content>
      <div class="code-list">
        <div
          v-for="(code, index) in currentCodes"
          :key="index"
          class="code-item"
          :class="{ expanded: expandedItems.includes(index) }"
        >
          <!-- 代码标题区域 -->
          <div
            class="code-header"
            @click="toggleExpand(index)"
          >
            <div class="code-title-content">
              <div class="code-icon">
                <v-icon
                  size="16"
                  color="#334155"
                  >mdi-code-tags</v-icon
                >
              </div>
              <h3 class="code-title">{{ code.title }}</h3>
            </div>
            <div class="header-actions">
              <button
                class="btn btn--sm btn--secondary"
                @click.stop="selectCode(code)"
              >
                <v-icon
                  size="14"
                  color="#475569"
                  >mdi-check</v-icon
                >
                使用
              </button>
              <div class="expand-indicator">
                <v-icon
                  :class="{ rotated: expandedItems.includes(index) }"
                  size="20"
                  color="rgba(30, 41, 59, 0.6)"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
            </div>
          </div>

          <!-- 代码内容区域 -->
          <div class="code-content">
            <div class="code-display">
              <pre><code class="language-javascript" v-html="highlightedCodes[index]"></code></pre>
            </div>
            <div class="code-actions">
              <button
                class="btn btn--secondary"
                @click="copyCode(code.code)"
              >
                <v-icon
                  size="16"
                  color="#334155"
                  >mdi-content-copy</v-icon
                >
                复制
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部 -->
    <template #footer>
      <footer class="modal-footer">
        <div class="footer-info">
          <span class="code-count">共 {{ currentCodes.length }} 个代码示例</span>
        </div>
        <button
          class="btn btn--secondary"
          @click="closeDialog"
        >
          关闭
        </button>
      </footer>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getCodesByType } from '../utils/commonCodes'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import BaseModal from './BaseModal.vue'
import ModalHeader from './ModalHeader.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'json',
    validator: (value) => ['json', 'html'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const expandedItems = ref([])
const highlightedCodes = ref([])

// 根据类型获取当前的代码片段
const currentCodes = computed(() => {
  return getCodesByType(props.type)
})

// 根据类型生成标题
const dialogTitle = computed(() => {
  const typeNames = {
    json: 'JSON处理代码示例',
  }
  return typeNames[props.type] || '常用代码示例'
})

// 高亮所有代码
const highlightCodes = () => {
  highlightedCodes.value = currentCodes.value.map((code) => {
    return hljs.highlight(code.code, { language: 'javascript' }).value
  })
}

// 监听类型变化，重新高亮代码
watch(
  () => props.type,
  () => {
    highlightCodes()
    expandedItems.value = [] // 重置展开状态
  },
  { immediate: false },
)

// 组件挂载时高亮代码
onMounted(() => {
  highlightCodes()
})

const toggleExpand = (index) => {
  const expandedIndex = expandedItems.value.indexOf(index)
  if (expandedIndex > -1) {
    expandedItems.value.splice(expandedIndex, 1)
  } else {
    expandedItems.value.push(index)
  }
}

const selectCode = (code) => {
  emit('select', code.code)
  closeDialog()
}

const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    // 这里可以添加一个简单的提示，比如使用 Vuetify 的 snackbar
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const closeDialog = () => {
  dialog.value = false
  // 关闭时收起所有展开的项目
  expandedItems.value = []
}
</script>

<style scoped>
/* ========================================
   代码列表样式
======================================== */

.code-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ========================================
   代码项目样式
======================================== */

.code-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  position: relative;
  box-shadow: var(--shadow-sm);
}

.code-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-gray-800), 0.02);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.code-item:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-lg);
}

.code-item:hover::before {
  opacity: 1;
}

.code-item.expanded {
  border-color: var(--border-strong);
}

.code-header {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 1;
}

.code-header:hover {
  background: rgba(var(--color-gray-800), 0.05);
}

.code-title-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.code-icon {
  width: 24px;
  height: 24px;
  background: rgba(var(--color-gray-800), 0.08);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(var(--color-gray-800), 0.12);
}

.code-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.expand-indicator {
  transition: transform var(--transition-normal);
}

.expand-indicator .rotated {
  transform: rotate(180deg);
}

/* ========================================
   代码内容样式
======================================== */

.code-content {
  border-top: 1px solid var(--border-light);
  position: relative;
  z-index: 1;
  overflow: hidden;
  max-height: 0;
  transition:
    max-height var(--transition-normal),
    opacity var(--transition-normal);
  opacity: 0;
}

.code-item.expanded .code-content {
  max-height: 1000px;
  opacity: 1;
}

.code-display {
  padding: 0;
  background: var(--bg-secondary);
  border-radius: 0;
}

.code-display pre {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  margin: 0;
  border: none;
  border-radius: 0;
  font-family: var(--font-family-mono);
  font-size: var(--font-size-md);
  line-height: 1.5;
  overflow-x: auto;
}

.code-display pre::-webkit-scrollbar {
  height: 6px;
}

.code-display pre::-webkit-scrollbar-track {
  background: var(--border-light);
  border-radius: var(--radius-xs);
}

.code-display pre::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: var(--radius-xs);
}

.code-actions {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-primary);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

/* ========================================
   底部区域样式
======================================== */

.modal-footer {
  background: rgba(var(--bg-secondary), 0.8);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg) var(--spacing-2xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: var(--backdrop-blur);
}

.footer-info {
  display: flex;
  align-items: center;
}

.code-count {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* ========================================
   响应式设计
======================================== */

@media (max-width: 768px) {
  .code-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .code-title {
    font-size: var(--font-size-md);
  }

  .code-display pre {
    padding: var(--spacing-md);
  }

  .code-actions {
    padding: var(--spacing-sm) var(--spacing-md);
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .btn {
    width: 100%;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .modal-footer {
    padding: var(--spacing-md) var(--spacing-xl);
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }

  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .code-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .code-icon {
    width: 20px;
    height: 20px;
  }

  .code-title {
    font-size: var(--font-size-base);
  }

  .code-display pre {
    padding: var(--spacing-md);
    font-size: var(--font-size-base);
  }

  .code-actions {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}
</style>
