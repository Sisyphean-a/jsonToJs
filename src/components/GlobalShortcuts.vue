<template>
  <BaseModal
    v-model="showNavigationDialog"
    size="large"
    no-padding
    @close="closeDialog"
  >
    <!-- 头部 -->
    <template #header>
      <ModalHeader
        title="快速导航"
        subtitle="Tab 键快速访问所有页面"
        icon="mdi-navigation-variant"
        @close="closeDialog"
      />
    </template>

    <!-- 内容 -->
    <template #content>
      <div class="navigation-content">
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
                <v-icon
                  :icon="route.icon"
                  size="20"
                ></v-icon>
              </div>
              <div class="route-info">
                <h4 class="route-title">{{ route.title }}</h4>
                <p class="route-description">{{ route.description }}</p>
                <span class="route-path">{{ route.path }}</span>
              </div>
              <div class="route-arrow">
                <v-icon
                  icon="mdi-arrow-right"
                  size="16"
                  color="rgba(30, 41, 59, 0.6)"
                ></v-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from './BaseModal.vue'
import ModalHeader from './ModalHeader.vue'

const router = useRouter()
const showNavigationDialog = ref(false)

// 从路由配置中自动获取路由列表，包含详细信息
const routeList = computed(() => {
  return router
    .getRoutes()
    .filter((route) => route.name && route.path !== '/:pathMatch(.*)*' && route.meta) // 只显示有 meta 信息的路由
    .map((route) => ({
      name: route.name,
      path: route.path,
      title: route.meta?.title || route.name,
      description: route.meta?.description || '暂无描述',
      icon: route.meta?.icon || 'mdi-file',
      category: route.meta?.category || '其他',
    }))
})

// 按类别分组路由
const groupedRoutes = computed(() => {
  const groups = {}
  routeList.value.forEach((route) => {
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
    // 如果弹窗已经显示，关闭弹窗
    if (showNavigationDialog.value) {
      event.preventDefault()
      closeDialog()
      return
    }

    // 如果弹窗没有显示，检查当前焦点是否在输入元素上
    const activeElement = document.activeElement
    const inputElements = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']

    // 如果当前焦点在输入元素上，或者元素有 contenteditable 属性，则不触发
    if (inputElements.includes(activeElement.tagName) || activeElement.contentEditable === 'true') {
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
   导航内容样式
======================================== */

.navigation-content {
  padding: 32px;
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
}

.category-count {
  background: rgba(30, 41, 59, 0.08);
  color: #334155;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(30, 41, 59, 0.15);
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
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  overflow: hidden;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.route-card::before {
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

.route-card:hover {
  border-color: rgba(30, 41, 59, 0.3);
  box-shadow:
    0 8px 25px -5px rgba(30, 41, 59, 0.15),
    0 4px 10px -5px rgba(30, 41, 59, 0.1);
}

.route-card:hover::before {
  opacity: 1;
}

.route-card:focus {
  border-color: rgba(30, 41, 59, 0.4);
  box-shadow:
    0 0 0 2px rgba(30, 41, 59, 0.2),
    0 8px 25px -5px rgba(30, 41, 59, 0.15);
}

.route-card:active {
  transform: translateY(-1px) scale(0.98);
}

.route-icon {
  width: 44px;
  height: 44px;
  background: rgba(30, 41, 59, 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(30, 41, 59, 0.12);
  position: relative;
  z-index: 1;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.route-card:hover .route-icon {
  background: rgba(30, 41, 59, 0.12);
  border-color: rgba(30, 41, 59, 0.18);
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
   响应式设计
======================================== */

@media (max-width: 768px) {
  .navigation-content {
    padding: 24px;
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
  .route-card,
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
