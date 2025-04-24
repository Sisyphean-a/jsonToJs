<template>
  <div class="d-flex flex-row" style="height: 100vh; width: 100vw">
    <v-sheet class="column" :style="{ width: `${columnWidths[0]}%` }">
      <v-textarea
        v-model="jsonInput"
        label="粘贴JSON数据"
        auto-grow
        filled
        height="100%"
        @input="updateJson"
        class="pa-2"
      ></v-textarea>
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(0)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[1]}%` }">
      <json-view :json="json" class="pa-2" />
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(1)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[2]}%` }">
      <div class="pa-2">第三列内容</div>
    </v-sheet>

    <div class="resize-handle" @mousedown="startResize(2)"></div>

    <v-sheet class="column" :style="{ width: `${columnWidths[3]}%` }">
      <div class="pa-2">第四列内容</div>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import jsonView from '@/components/jsonView.vue'

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
  const deltaX = event.clientX - startX.value
  const containerWidth = document.querySelector('.d-flex').offsetWidth
  let deltaPercentage = (deltaX / containerWidth) * 100

  // 原始宽度
  const originalWidthLeft = startWidths.value[index]
  const originalWidthRight = startWidths.value[index + 1]

  // 计算初步的新宽度
  let newWidthLeft = originalWidthLeft + deltaPercentage
  let newWidthRight = originalWidthRight - deltaPercentage

  // 应用最小宽度限制
  if (newWidthLeft < 10) {
    deltaPercentage = 10 - originalWidthLeft // 调整 delta，使得左侧为 10%
    newWidthLeft = 10
    newWidthRight = originalWidthRight - deltaPercentage
  } else if (newWidthRight < 10) {
    deltaPercentage = originalWidthRight - 10 // 调整 delta，使得右侧为 10%
    newWidthRight = 10
    newWidthLeft = originalWidthLeft + deltaPercentage
  }

  // 确保两个宽度的总和不变
  // (这一步在上面的调整中已隐式完成，因为 deltaPercentage 被重新计算以补偿)

  // 更新列宽
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
