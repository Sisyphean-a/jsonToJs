<template>
  <!-- 背景遮罩层 -->
  <div 
    v-if="dialog" 
    class="code-dialog-overlay" 
    @click="closeDialog"
  >
    <!-- 主弹窗容器 -->
    <div 
      class="code-dialog-modal" 
      @click.stop
    >
      <!-- 头部区域 -->
      <header class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="20" color="white">mdi-code-braces</v-icon>
          </div>
          <div class="header-text">
            <h2 class="header-title">常用代码示例 <span class="header-subtitle">选择并快速使用</span></h2>
          </div>
        </div>
        <button class="close-btn" @click="closeDialog">
          <v-icon size="18" color="rgba(255,255,255,0.8)">mdi-close</v-icon>
        </button>
      </header>

      <!-- 内容区域 -->
      <main class="modal-content">
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
                  <v-icon size="16" color="#667eea">mdi-code-tags</v-icon>
                </div>
                <h3 class="code-title">{{ code.title }}</h3>
              </div>
              <div class="expand-indicator">
                <v-icon 
                  :class="{ rotated: expandedItems.includes(index) }"
                  size="20" 
                  color="rgba(103, 126, 234, 0.6)"
                >
                  mdi-chevron-down
                </v-icon>
              </div>
            </div>

            <!-- 代码内容区域 -->
            <div class="code-content" v-show="expandedItems.includes(index)">
              <div class="code-display">
                <pre><code class="language-javascript" v-html="highlightedCodes[index]"></code></pre>
              </div>
              <div class="code-actions">
                <button class="use-code-btn" @click="selectCode(code)">
                  <v-icon size="16" color="white">mdi-check</v-icon>
                  使用此代码
                </button>
                <button class="copy-btn" @click="copyCode(code.code)">
                  <v-icon size="16" color="#667eea">mdi-content-copy</v-icon>
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 底部操作区域 -->
      <footer class="modal-footer">
        <div class="footer-info">
          <span class="code-count">共 {{ commonCodes.length }} 个代码示例</span>
        </div>
        <button class="close-footer-btn" @click="closeDialog">
          关闭
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { commonCodes } from '../utils/commonCodes'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

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
   核心布局样式
======================================== */

.code-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: overlayFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-dialog-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

/* ========================================
   头部区域样式
======================================== */

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.modal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-text {
  color: white;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.85;
  font-weight: 400;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

/* ========================================
   内容区域样式
======================================== */

.modal-content {
  padding: 24px;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
  scroll-behavior: smooth;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(103, 126, 234, 0.3);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(103, 126, 234, 0.5);
}

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
  border: 2px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.code-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.code-item:hover {
  border-color: rgba(103, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 
    0 10px 25px -5px rgba(103, 126, 234, 0.1),
    0 5px 10px -5px rgba(103, 126, 234, 0.05);
}

.code-item:hover::before {
  opacity: 1;
}

.code-item.expanded {
  border-color: rgba(103, 126, 234, 0.4);
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
  background: rgba(103, 126, 234, 0.05);
}

.code-title-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-icon {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(3, 105, 161, 0.1);
}

.code-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  line-height: 1.3;
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
  background: rgba(103, 126, 234, 0.3);
  border-radius: 3px;
}

.code-actions {
  padding: 12px 16px;
  background: white;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.use-code-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 8px rgba(103, 126, 234, 0.3);
}

.use-code-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4390 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 126, 234, 0.4);
}

.copy-btn {
  background: white;
  border: 2px solid rgba(103, 126, 234, 0.2);
  color: #667eea;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.copy-btn:hover {
  background: rgba(103, 126, 234, 0.05);
  border-color: rgba(103, 126, 234, 0.4);
  transform: translateY(-1px);
}

/* ========================================
   底部区域样式
======================================== */

.modal-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  border: 2px solid rgba(148, 163, 184, 0.3);
  color: #374151;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-footer-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

/* ========================================
   动画定义
======================================== */

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ========================================
   响应式设计
======================================== */

@media (max-width: 768px) {
  .code-dialog-overlay {
    padding: 16px;
  }
  
  .code-dialog-modal {
    border-radius: 20px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 14px 20px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .header-subtitle {
    font-size: 12px;
  }
  
  .modal-content {
    padding: 20px;
    max-height: calc(95vh - 160px);
  }
  
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
  
  .use-code-btn,
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
  .header-content {
    gap: 10px;
  }
  
  .header-icon {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }
  
  .header-title {
    font-size: 15px;
    gap: 8px;
  }
  
  .header-subtitle {
    font-size: 11px;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
  }
  
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

/* ========================================
   可访问性增强
======================================== */

@media (prefers-reduced-motion: reduce) {
  .code-dialog-overlay,
  .code-dialog-modal,
  .code-item,
  .close-btn,
  .expand-indicator {
    animation: none;
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .code-item {
    border-color: #000;
  }
  
  .code-item:hover {
    border-color: #0066cc;
  }
}
</style>
