<template>
  <div
    class="d-flex flex-row"
    style="height: 100vh; width: 100vw"
  >
    <template
      v-for="(_, index) in columnCount"
      :key="index"
    >
      <v-sheet
        class="column"
        :style="{ width: `${columnWidths[index]}%` }"
      >
        <column-header
          :is-collapsed="isCollapsed[index]"
          @toggle="toggleColumn(index)"
        />
        <div
          class="column-content"
          v-show="transitioningColumn !== index && !isCollapsed[index]"
        >
          <slot :name="`column${index + 1}`"></slot>
        </div>
      </v-sheet>
      <div
        v-if="index < columnCount - 1"
        class="resize-handle"
        @mousedown="startResize(index)"
      ></div>
    </template>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import ColumnHeader from '@/components/ColumnHeader.vue'

const props = defineProps({
  columnCount: {
    type: Number,
    required: true,
    validator: (value) => value >= 1,
  },
})

// 修改过渡状态控制
const transitioningColumn = ref(null)
const transitionTimeout = ref(null)

// 列宽度百分比
const columnWidths = ref(Array(props.columnCount).fill(100 / props.columnCount))
const resizingIndex = ref(null)
const startX = ref(0)
const startWidths = ref([])

// 折叠状态管理
const isCollapsed = ref(Array(props.columnCount).fill(false))

// 定义折叠后的最小宽度百分比
const collapsedWidthPercentage = 4
// 定义展开时的最小宽度百分比
const minExpandedWidthPercentage = 10

// 计算可见列的数量
const visibleColumnsCount = computed(() => {
  return isCollapsed.value.filter((collapsed) => !collapsed).length
})

// 切换列的折叠状态
const toggleColumn = (index) => {
  if (!isCollapsed.value[index] && visibleColumnsCount.value <= 1) {
    console.warn('Cannot collapse the last visible column.')
    return
  }

  transitioningColumn.value = index
  isCollapsed.value[index] = !isCollapsed.value[index]

  // 清除之前的定时器
  if (transitionTimeout.value) {
    clearTimeout(transitionTimeout.value)
  }

  // 设置新的定时器
  transitionTimeout.value = setTimeout(() => {
    transitioningColumn.value = null
    transitionTimeout.value = null
  }, 300) // 与CSS过渡时间保持一致

  redistributeWidths()
}

// 重新分配宽度
const redistributeWidths = () => {
  const visibleCount = visibleColumnsCount.value
  const collapsedCount = props.columnCount - visibleCount

  // 如果所有列都折叠，强制展开第一个
  if (visibleCount === 0 && collapsedCount > 0) {
    const firstCollapsedIndex = isCollapsed.value.findIndex((c) => c)
    if (firstCollapsedIndex !== -1) {
      isCollapsed.value[firstCollapsedIndex] = false
      return
    }
  }

  // 如果只有展开的列，则平分
  if (collapsedCount === 0) {
    columnWidths.value = Array(props.columnCount).fill(100 / props.columnCount)
    return
  }

  // 计算折叠列占用的总宽度
  const totalCollapsedWidth = collapsedCount * collapsedWidthPercentage
  // 计算剩余给展开列的总宽度
  const totalVisibleWidth = 100 - totalCollapsedWidth

  // 计算每个展开列的理论宽度
  let visibleColumnWidth = totalVisibleWidth / visibleCount

  // 确保展开列不低于最小宽度
  if (visibleColumnWidth < minExpandedWidthPercentage) {
    visibleColumnWidth = minExpandedWidthPercentage
    const totalVisibleWidth = visibleCount * visibleColumnWidth
    const remainingForCollapsed = 100 - totalVisibleWidth
    const actualCollapsedWidth = collapsedCount > 0 ? remainingForCollapsed / collapsedCount : 0

    columnWidths.value = Array(props.columnCount)
      .fill(0)
      .map((_, i) =>
        isCollapsed.value[i] ? Math.max(0, actualCollapsedWidth) : visibleColumnWidth,
      )
  } else {
    columnWidths.value = Array(props.columnCount)
      .fill(0)
      .map((_, i) => (isCollapsed.value[i] ? collapsedWidthPercentage : visibleColumnWidth))
  }
}

// 开始调整大小
const startResize = (index) => {
  resizingIndex.value = index
  startX.value = event.clientX
  startWidths.value = [...columnWidths.value]

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
}

// 处理鼠标移动
const handleMouseMove = (event) => {
  if (resizingIndex.value === null) return

  const index = resizingIndex.value
  const leftIsCollapsed = isCollapsed.value[index]
  const rightIsCollapsed = isCollapsed.value[index + 1]

  if (leftIsCollapsed || rightIsCollapsed) {
    console.warn('Resizing adjacent to or of a collapsed column is currently disabled.')
    return
  }

  const deltaX = event.clientX - startX.value
  const containerWidth = document.querySelector('.d-flex').offsetWidth
  let deltaPercentage = (deltaX / containerWidth) * 100

  const originalWidthLeft = startWidths.value[index]
  const originalWidthRight = startWidths.value[index + 1]

  // 计算初步的新宽度
  let newWidthLeft = originalWidthLeft + deltaPercentage
  let newWidthRight = originalWidthRight - deltaPercentage

  // 应用最小宽度限制
  const minWidth = minExpandedWidthPercentage
  if (newWidthLeft < minWidth) {
    deltaPercentage = minWidth - originalWidthLeft
    newWidthLeft = minWidth
    newWidthRight = originalWidthRight - deltaPercentage
  } else if (newWidthRight < minWidth) {
    deltaPercentage = originalWidthRight - minWidth
    newWidthRight = minWidth
    newWidthLeft = originalWidthLeft + deltaPercentage
  }

  columnWidths.value[index] = newWidthLeft
  columnWidths.value[index + 1] = newWidthRight
}

// 停止调整大小
const stopResize = () => {
  resizingIndex.value = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
}

// 组件卸载时移除事件监听和定时器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
  if (transitionTimeout.value) {
    clearTimeout(transitionTimeout.value)
  }
})
</script>

<style lang="scss" scoped>
.d-flex {
  height: 100%;
  width: 100%;
}

.column {
  height: 100%;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-light);
  will-change: width;

  &:last-child {
    border-right: none;
  }
}

.column-content {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);
  background-color: var(--bg-primary);
  transition: display var(--transition-normal);
  will-change: display;
}

.resize-handle {
  width: 6px;
  background-color: var(--border-medium);
  cursor: col-resize;
  height: 100%;
  transition: background-color var(--transition-fast);
  position: relative;
  z-index: var(--z-dropdown);

  &:hover,
  &:active {
    background-color: var(--color-primary-600);
  }
}

:deep(.v-theme--light) {
  height: 100%;
}

:deep(.v-sheet) {
  height: 100%;
  background-color: transparent;
}
</style>
