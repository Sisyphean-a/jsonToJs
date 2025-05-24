<template>
  <BaseModal
    v-model="dialog"
    size="large"
    @close="closeDialog"
  >
    <!-- 头部 -->
    <template #header>
      <ModalHeader
        title="常用代码示例"
        subtitle="选择并快速使用"
        icon="mdi-code-braces"
        @close="closeDialog"
      />
    </template>

    <!-- 内容 -->
    <template #content>
      <div class="code-list">
        <div
          v-for="(code, index) in commonCodes"
          :key="index"
          class="code-item"
          :class="{ expanded: expandedItems.includes(index) }"
        >
          <!-- 代码标题区域 -->
          <div class="code-header" @click="toggleExpand(index)">
            <div class="code-title-content">
              <div class="code-icon">
                <v-icon size="16" color="#334155">mdi-code-tags</v-icon>
              </div>
              <h3 class="code-title">{{ code.title }}</h3>
            </div>
            <div class="header-actions">
              <button class="quick-use-btn" @click.stop="selectCode(code)">
                <v-icon size="14" color="#475569">mdi-check</v-icon>
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
              <button class="copy-btn" @click="copyCode(code.code)">
                <v-icon size="16" color="#334155">mdi-content-copy</v-icon>
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
          <span class="code-count">共 {{ commonCodes.length }} 个代码示例</span>
        </div>
        <button class="close-footer-btn" @click="closeDialog">
          关闭
        </button>
      </footer>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { commonCodes } from '../utils/commonCodes'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import BaseModal from './BaseModal.vue'
import ModalHeader from './ModalHeader.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const expandedItems = ref([])
const highlightedCodes = ref([])

// 高亮所有代码
onMounted(() => {
  highlightedCodes.value = commonCodes.map((code) => {
    return hljs.highlight(code.code, { language: 'javascript' }).value
  })
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
  gap: 16px;
}

/* ========================================
   代码项目样式
======================================== */

.code-item {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.code-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 41, 59, 0.02);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.code-item:hover {
  border-color: rgba(30, 41, 59, 0.3);
  box-shadow: 
    0 8px 25px -5px rgba(30, 41, 59, 0.12),
    0 4px 10px -5px rgba(30, 41, 59, 0.08);
}

.code-item:hover::before {
  opacity: 1;
}

.code-item.expanded {
  border-color: rgba(30, 41, 59, 0.35);
}

.code-header {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.code-header:hover {
  background: rgba(30, 41, 59, 0.05);
}

.code-title-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-icon {
  width: 24px;
  height: 24px;
  background: rgba(30, 41, 59, 0.08);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(30, 41, 59, 0.12);
}

.code-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  line-height: 1.3;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quick-use-btn {
  background: rgba(132, 147, 169, 0.1);
  border: 1px solid rgba(94, 114, 142, 0.3);
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 4px;
}

.quick-use-btn:hover {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.4);
  color: #334155;
}

.expand-indicator {
  transition: transform 0.3s ease;
}

.expand-indicator .rotated {
  transform: rotate(180deg);
}

/* ========================================
   代码内容样式
======================================== */

.code-content {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  position: relative;
  z-index: 1;
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.code-item.expanded .code-content {
  max-height: 1000px;
  opacity: 1;
}

.code-display {
  padding: 0;
  background: #f8fafc;
  border-radius: 0;
}

.code-display pre {
  background: #f8fafc;
  padding: 16px;
  margin: 0;
  border: none;
  border-radius: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: auto;
}

.code-display pre::-webkit-scrollbar {
  height: 6px;
}

.code-display pre::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
}

.code-display pre::-webkit-scrollbar-thumb {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 3px;
}

.code-actions {
  padding: 12px 16px;
  background: white;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.copy-btn {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #334155;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 5px;
}

.copy-btn:hover {
  background: rgba(30, 41, 59, 0.05);
  border-color: rgba(30, 41, 59, 0.3);
}

/* ========================================
   底部区域样式
======================================== */

.modal-footer {
  background: rgba(248, 250, 252, 0.8);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(8px);
}

.footer-info {
  display: flex;
  align-items: center;
}

.code-count {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.close-footer-btn {
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #334155;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-footer-btn:hover {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(148, 163, 184, 0.5);
}

/* ========================================
   响应式设计
======================================== */

@media (max-width: 768px) {
  .code-header {
    padding: 10px 14px;
  }
  
  .code-title {
    font-size: 14px;
  }
  
  .code-display pre {
    padding: 14px;
  }
  
  .code-actions {
    padding: 10px 14px;
    flex-direction: column;
    gap: 8px;
  }
  
  .copy-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 14px;
  }
  
  .modal-footer {
    padding: 14px 20px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .close-footer-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .code-header {
    padding: 10px 12px;
  }
  
  .code-icon {
    width: 20px;
    height: 20px;
  }
  
  .code-title {
    font-size: 13px;
  }
  
  .code-display pre {
    padding: 12px;
    font-size: 13px;
  }
  
  .code-actions {
    padding: 10px 12px;
  }
}
</style>
