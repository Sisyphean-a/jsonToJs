<template>
  <!-- 背景遮罩层 -->
  <div
    v-if="modelValue"
    class="base-modal-overlay"
    @click="handleOverlayClick"
  >
    <!-- 主弹窗容器 -->
    <div
      class="base-modal-container"
      :class="[
        `base-modal--${size}`,
        {
          'base-modal--fullscreen': fullscreen,
          'base-modal--no-padding': noPadding,
        },
      ]"
      @click.stop
    >
      <!-- 头部插槽 -->
      <slot name="header"></slot>

      <!-- 内容插槽 -->
      <main
        class="base-modal-content"
        v-if="!hideContent"
      >
        <slot name="content"></slot>
      </main>

      <!-- 底部插槽 -->
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  // 弹窗大小：small、medium、large、extra-large
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'extra-large'].includes(value),
  },
  // 是否全屏
  fullscreen: {
    type: Boolean,
    default: false,
  },
  // 是否禁用点击遮罩关闭
  persistentModal: {
    type: Boolean,
    default: false,
  },
  // 是否不显示内容区域（有些弹窗可能只有头部和底部）
  hideContent: {
    type: Boolean,
    default: false,
  },
  // 是否移除内容区域的默认padding
  noPadding: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleOverlayClick = () => {
  if (!props.persistentModal) {
    emit('update:modelValue', false)
    emit('close')
  }
}
</script>

<style scoped>
/* ========================================
   基础弹窗样式
======================================== */

.base-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: overlayFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.base-modal-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow:
    0 20px 40px -8px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* 不同尺寸的弹窗 */
.base-modal--small {
  max-width: 400px;
}

.base-modal--medium {
  max-width: 600px;
}

.base-modal--large {
  max-width: 800px;
}

.base-modal--extra-large {
  max-width: 1000px;
}

.base-modal--fullscreen {
  max-width: 95vw;
  max-height: 95vh;
  border-radius: 16px;
}

/* 内容区域 */
.base-modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  scroll-behavior: smooth;
}

.base-modal--no-padding .base-modal-content {
  padding: 0;
}

/* 滚动条样式 */
.base-modal-content::-webkit-scrollbar {
  width: 6px;
}

.base-modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.base-modal-content::-webkit-scrollbar-thumb {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 3px;
}
.base-modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(30, 41, 59, 0.5);
}

/* 动画定义 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .base-modal-overlay {
    padding: 16px;
  }

  .base-modal-container {
    border-radius: 20px;
    max-height: 95vh;
  }

  .base-modal--fullscreen {
    border-radius: 16px;
  }

  .base-modal-content {
    padding: 20px;
  }

  .base-modal--no-padding .base-modal-content {
    padding: 0;
  }
}

@media (max-width: 480px) {
  .base-modal-container {
    border-radius: 16px;
  }

  .base-modal-content {
    padding: 16px;
  }

  .base-modal--no-padding .base-modal-content {
    padding: 0;
  }
}

/* 可访问性增强 */
@media (prefers-reduced-motion: reduce) {
  .base-modal-overlay,
  .base-modal-container {
    animation: none;
    transition: none;
  }
}
</style>
