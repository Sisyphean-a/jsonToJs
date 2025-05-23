<template>
  <!-- 背景遮罩层 -->
  <div 
    v-if="showNavigationDialog" 
    class="navigation-overlay" 
    @click="closeDialog"
  >
    <!-- 主弹窗容器 -->
    <div 
      class="navigation-modal" 
      @click.stop
    >
      <!-- 头部区域 -->
      <header class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <v-icon size="20" color="white">mdi-navigation-variant</v-icon>
          </div>
          <div class="header-text">
            <h2 class="header-title">快速导航 <span class="header-subtitle">Tab 键快速访问所有页面</span></h2>
          </div>
        </div>
        <button class="close-btn" @click="closeDialog">
          <v-icon size="18" color="rgba(255,255,255,0.8)">mdi-close</v-icon>
        </button>
      </header>

      <!-- 内容区域 -->
      <main class="modal-content">
        <div 
          v-for="(routes, category) in groupedRoutes" 
          :key="category"
          class="route-category"
        >
          <div class="category-header">
            <h3 class="category-title">{{ category }}</h3>
            <span class="category-count">{{ routes.length }}</span>
          </div>
          
          <div class="route-grid">
            <div
              v-for="route in routes"
              :key="route.path"
              class="route-card"
              @click="navigateToRoute(route.path)"
              tabindex="0"
              @keydown.enter="navigateToRoute(route.path)"
              @keydown.space="navigateToRoute(route.path)"
            >
              <div class="route-icon">
                <v-icon :icon="route.icon" size="20"></v-icon>
              </div>
              <div class="route-info">
                <h4 class="route-title">{{ route.title }}</h4>
                <p class="route-description">{{ route.description }}</p>
                <span class="route-path">{{ route.path }}</span>
              </div>
              <div class="route-arrow">
                <v-icon icon="mdi-arrow-right" size="16" color="rgba(103, 126, 234, 0.6)"></v-icon>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showNavigationDialog = ref(false)

// 从路由配置中自动获取路由列表，包含详细信息
const routeList = computed(() => {
  return router.getRoutes()
    .filter(route => route.name && route.path !== '/:pathMatch(.*)*' && route.meta) // 只显示有 meta 信息的路由
    .map(route => ({
      name: route.name,
      path: route.path,
      title: route.meta?.title || route.name,
      description: route.meta?.description || '暂无描述',
      icon: route.meta?.icon || 'mdi-file',
      category: route.meta?.category || '其他'
    }))
})

// 按类别分组路由
const groupedRoutes = computed(() => {
  const groups = {}
  routeList.value.forEach(route => {
    if (!groups[route.category]) {
      groups[route.category] = []
    }
    groups[route.category].push(route)
  })
  return groups
})

// 处理键盘事件
const handleKeyDown = (event) => {
  // 检查是否按下了 Tab 键
  if (event.key === 'Tab') {
    // 检查当前焦点是否在输入元素上（输入框、文本域等）
    const activeElement = document.activeElement
    const inputElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']
    
    // 如果当前焦点在输入元素上，或者元素有 contenteditable 属性，则不触发
    if (inputElements.includes(activeElement.tagName) || 
        activeElement.contentEditable === 'true') {
      return
    }
    
    // 阻止默认的 Tab 行为
    event.preventDefault()
    
    // 显示导航弹窗
    showNavigationDialog.value = true
  }
  
  // 按 Escape 键关闭弹窗
  if (event.key === 'Escape' && showNavigationDialog.value) {
    closeDialog()
  }
}

// 导航到指定路由
const navigateToRoute = (path) => {
  router.push(path)
  closeDialog()
}

// 关闭弹窗
const closeDialog = () => {
  showNavigationDialog.value = false
}

// 组件挂载时添加事件监听器
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* ========================================
   核心布局样式
======================================== */

.navigation-overlay {
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

.navigation-modal {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  max-width: 800px;
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
  padding: 32px;
  max-height: calc(90vh - 200px);
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

.route-category {
  margin-bottom: 32px;
}

.route-category:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(103, 126, 234, 0.1);
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-count {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(3, 105, 161, 0.2);
}

/* ========================================
   路由网格样式
======================================== */

.route-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.route-card {
  background: white;
  border: 2px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  outline: none;
}

.route-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.route-card:hover {
  border-color: rgba(103, 126, 234, 0.4);
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(103, 126, 234, 0.15),
    0 10px 10px -5px rgba(103, 126, 234, 0.1);
}

.route-card:hover::before {
  opacity: 1;
}

.route-card:focus {
  border-color: rgba(103, 126, 234, 0.6);
  box-shadow: 
    0 0 0 3px rgba(103, 126, 234, 0.2),
    0 20px 25px -5px rgba(103, 126, 234, 0.15);
}

.route-card:active {
  transform: translateY(-1px) scale(0.98);
}

.route-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(3, 105, 161, 0.1);
  position: relative;
  z-index: 1;
}

.route-card:hover .route-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.05);
}

.route-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.route-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #1e293b;
  line-height: 1.3;
}

.route-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.route-path {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: rgba(148, 163, 184, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

.route-arrow {
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
}

.route-card:hover .route-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* ========================================
   底部区域样式
======================================== */

.modal-footer {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding: 20px 32px;
}

.shortcut-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

kbd {
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-family: inherit;
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
  .navigation-overlay {
    padding: 16px;
  }
  
  .navigation-modal {
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
    padding: 24px;
    max-height: calc(95vh - 140px);
  }
  
  .route-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .route-card {
    padding: 16px;
  }
  
  .category-header {
    margin-bottom: 12px;
  }
  
  .route-category {
    margin-bottom: 24px;
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
  
  .route-card {
    gap: 12px;
    padding: 14px;
  }
  
  .route-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
  
  .route-title {
    font-size: 15px;
  }
  
  .route-description {
    font-size: 13px;
  }
}

/* ========================================
   可访问性增强
======================================== */

@media (prefers-reduced-motion: reduce) {
  .navigation-overlay,
  .navigation-modal,
  .route-card,
  .close-btn,
  .route-icon,
  .route-arrow {
    animation: none;
    transition: none;
  }
}

/* 高对比度支持 */
@media (prefers-contrast: high) {
  .route-card {
    border-color: #000;
  }
  
  .route-card:hover {
    border-color: #0066cc;
  }
  
  .category-title {
    -webkit-text-fill-color: #000;
    color: #000;
  }
}
</style> 