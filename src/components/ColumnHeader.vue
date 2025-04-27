<template>
  <div
    class="column-header"
    @click="$emit('toggle')"
  >
    <span class="collapse-text">{{ isCollapsed ? '点击展开' : '点击折叠' }}</span>
  </div>
</template>

<script setup>
defineProps({
  isCollapsed: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['toggle'])
</script>

<style lang="scss" scoped>
.column-header {
  display: flex;
  justify-content: center;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
  cursor: pointer;
  align-items: center;
  height: 40px;
  box-sizing: border-box;
}

.collapse-text {
  font-size: 12px;
  color: #1976d2;
  user-select: none;
}
</style>
