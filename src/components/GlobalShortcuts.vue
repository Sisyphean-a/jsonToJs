<template>
  <v-dialog v-model="showNavigationDialog" max-width="600" @click:outside="closeDialog">
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" color="primary">mdi-navigation</v-icon>
        <span>页面导航</span>
        <v-spacer></v-spacer>
        <v-chip size="small" color="primary" variant="outlined">
          Tab 键快捷访问
        </v-chip>
      </v-card-title>
      
      <v-divider></v-divider>
      
      <div class="route-groups pa-2">
        <div 
          v-for="(routes, category) in groupedRoutes" 
          :key="category"
          class="mb-4"
        >
          <v-subheader class="text-primary font-weight-bold px-4">
            {{ category }}
          </v-subheader>
          
          <v-list class="py-0">
            <v-list-item
              v-for="route in routes"
              :key="route.path"
              @click="navigateToRoute(route.path)"
              class="navigation-item mx-2 rounded"
              :ripple="true"
            >
              <template v-slot:prepend>
                <v-avatar size="40" class="mr-4" color="primary" variant="tonal">
                  <v-icon :icon="route.icon" color="primary"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium text-h6 mb-1">
                {{ route.title }}
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-body-2 mb-1">
                {{ route.description }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="text-caption text-primary">
                {{ route.path }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" color="grey"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </div>
      
      <v-divider></v-divider>
    </v-card>
  </v-dialog>
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
.navigation-item {
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.navigation-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(4px);
}

.route-groups {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.v-list-item__content) {
  padding: 12px 0;
}

:deep(.v-subheader) {
  height: auto;
  min-height: 32px;
}
</style> 