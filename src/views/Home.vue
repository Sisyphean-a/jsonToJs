<template>
  <div class="d-flex flex-row" style="height: 100vh; width: 100vw">
    <v-sheet class="column" :style="{ width: `${columnWidths[0]}%` }">
      <column-header :is-collapsed="isCollapsed[0]" @toggle="toggleColumn(0)" />
      <div class="column-content">
        <v-textarea
          v-if="!isCollapsed[0]"
          v-model="jsonInput"
          label="粘贴JSON数据"
          auto-grow
          filled
          height="100%"
          @input="updateJson"
          class="pa-2"
        ></v-textarea>
      </div>
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(0)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[1]}%` }">
      <column-header :is-collapsed="isCollapsed[1]" @toggle="toggleColumn(1)" />
      <div class="column-content">
        <json-view v-if="!isCollapsed[1]" :json="json" class="pa-2" />
      </div>
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(1)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[2]}%` }">
      <column-header :is-collapsed="isCollapsed[2]" @toggle="toggleColumn(2)" />
      <div class="column-content">
        <div v-if="!isCollapsed[2]" class="pa-2">第三列内容</div>
      </div>
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(2)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[3]}%` }">
      <column-header :is-collapsed="isCollapsed[3]" @toggle="toggleColumn(3)" />
      <div class="column-content">
        <div v-if="!isCollapsed[3]" class="pa-2">第四列内容</div>
      </div>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import jsonView from '@/components/jsonView.vue'
import ColumnHeader from '@/components/ColumnHeader.vue'

// 默认JSON数据
const defaultJson = {
  name: '张三',
  age: 18,
  gender: '男',
  address: {
    province: '北京',
    city: '北京',
    district: '朝阳区',
  },
}

const json = ref(defaultJson)
const jsonInput = ref(JSON.stringify(defaultJson, null, 2))

// 列宽度百分比
const columnWidths = ref([25, 25, 25, 25])
const resizingIndex = ref(null)
const startX = ref(0)
const startWidths = ref([])

// 添加折叠状态管理
const isCollapsed = ref([false, false, false, false])

// 定义折叠后的最小宽度百分比
const collapsedWidthPercentage = 4
// 定义展开时的最小宽度百分比 (避免宽度过小)
const minExpandedWidthPercentage = 10

// 计算可见列的数量
const getVisibleColumnsCount = () => {
  return isCollapsed.value.filter((collapsed) => !collapsed).length
}

// 切换列的折叠状态
const toggleColumn = (index) => {
  // 如果要折叠的是最后一列可见列，则阻止操作
  if (!isCollapsed.value[index] && getVisibleColumnsCount() <= 1) {
    console.warn('Cannot collapse the last visible column.')
    return
  }

  isCollapsed.value[index] = !isCollapsed.value[index]
  redistributeWidths()
}

// 重新分配宽度
const redistributeWidths = () => {
  const visibleCount = getVisibleColumnsCount()
  const collapsedCount = isCollapsed.value.length - visibleCount

  // 如果所有列都折叠 (理论上不应发生，因为 toggleColumn 会阻止)
  if (visibleCount === 0 && collapsedCount > 0) {
    // 强制展开第一个折叠的列
    const firstCollapsedIndex = isCollapsed.value.findIndex((c) => c)
    if (firstCollapsedIndex !== -1) {
      isCollapsed.value[firstCollapsedIndex] = false
      // 重新计算 visibleCount 和 collapsedCount
      visibleCount = 1
      collapsedCount = isCollapsed.value.length - 1
    } else {
      // 极端情况：无法找到折叠列，则全部展开
      isCollapsed.value.fill(false)
      visibleCount = isCollapsed.value.length
      collapsedCount = 0
    }
  }

  // 如果只有展开的列，则平分
  if (collapsedCount === 0) {
    const evenWidth = 100 / isCollapsed.value.length
    columnWidths.value = columnWidths.value.map(() => evenWidth)
    return
  }

  // 计算折叠列占用的总宽度
  const totalCollapsedWidth = collapsedCount * collapsedWidthPercentage
  // 计算剩余给展开列的总宽度
  let totalVisibleWidth = 100 - totalCollapsedWidth

  // 计算每个展开列的理论宽度
  let visibleColumnWidth = totalVisibleWidth / visibleCount

  // 确保展开列不低于最小宽度
  if (visibleColumnWidth < minExpandedWidthPercentage) {
    // 如果理论宽度过小，说明折叠列占用了太多空间
    // 我们需要减少折叠列的数量或者它们的宽度，这里优先保证展开列至少有 minExpandedWidthPercentage
    visibleColumnWidth = minExpandedWidthPercentage
    // 重新计算需要多少总宽度给展开列
    totalVisibleWidth = visibleCount * visibleColumnWidth
    // 剩余给折叠列的总宽度也相应调整
    const remainingForCollapsed = 100 - totalVisibleWidth
    // 重新计算每个折叠列的宽度 (可能小于我们期望的 collapsedWidthPercentage)
    const actualCollapsedWidth = collapsedCount > 0 ? remainingForCollapsed / collapsedCount : 0

    columnWidths.value = columnWidths.value.map((_, i) =>
      isCollapsed.value[i] ? Math.max(0, actualCollapsedWidth) : visibleColumnWidth,
    )
  } else {
    // 正常分配
    columnWidths.value = columnWidths.value.map((_, i) =>
      isCollapsed.value[i] ? collapsedWidthPercentage : visibleColumnWidth,
    )
  }
}

// 更新JSON数据
const updateJson = () => {
  try {
    json.value = JSON.parse(jsonInput.value)
  } catch (e) {
    // 解析错误时不更新
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

  // 应用最小宽度限制 (对展开列)
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

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style lang="scss" scoped>
.column {
  height: 100%;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.column-content {
  flex: 1;
  overflow: auto;
}

.resize-handle {
  width: 6px;
  background-color: #e0e0e0;
  cursor: col-resize;
  height: 100%;
  transition: background-color 0.2s;

  &:hover,
  &:active {
    background-color: #1976d2;
  }
}

::v-deep .v-theme--light {
  height: 100%;
}
</style>
