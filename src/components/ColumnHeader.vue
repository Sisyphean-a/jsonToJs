<template>
  <div
    class="column-header"
    @click="$emit('toggle')"
  >
    <div class="header-content">
      <span class="collapse-icon">
        {{ isCollapsed ? '⟶' : '⟷' }}
      </span>
    </div>
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
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.9);
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  height: 35px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  &:hover {
    background: rgba(30, 41, 59, 0.08);
    border-bottom-color: rgba(30, 41, 59, 0.3);
  }

  &:active {
    background: rgba(30, 41, 59, 0.12);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.collapse-icon {
  font-size: 14px;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
}

.column-header:hover {
  .collapse-icon {
    color: #334155;
    transform: scale(1.1);
  }

  .collapse-text {
    color: #1e293b;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .column-header {
    height: 40px;
    padding: 8px 12px;
  }

  .header-content {
    gap: 6px;
  }

  .collapse-icon {
    font-size: 13px;
  }

  .collapse-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .column-header {
    height: 36px;
    padding: 6px 8px;
  }

  .collapse-text {
    display: none; /* 在很小的屏幕上只显示图标 */
  }
}

/* 可访问性增强 */
@media (prefers-reduced-motion: reduce) {
  .column-header,
  .collapse-icon,
  .collapse-text {
    transition: none;
  }
}

/* 高对比度支持 */
@media (prefers-contrast: high) {
  .column-header {
    border-bottom-color: #000;
  }

  .collapse-text {
    color: #000;
  }

  .column-header:hover .collapse-text {
    color: #000;
  }
}
</style>
