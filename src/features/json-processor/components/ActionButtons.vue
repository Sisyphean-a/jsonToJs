<template>
  <div
    class="action-buttons"
    :class="containerClasses"
  >
    <button
      class="btn btn--primary"
      :class="{ loading: isExecuting }"
      @click="handleExecute"
      :disabled="isExecuting || disabled"
      :title="executeTooltip"
    >
      <v-icon
        v-if="!isExecuting"
        icon="mdi-play"
        size="16"
        class="btn-icon"
      />
      <v-icon
        v-else
        icon="mdi-loading"
        size="16"
        class="btn-icon btn-icon--spinning"
      />
      <span>{{ isExecuting ? '执行中...' : '执行转换' }}</span>
    </button>

    <button
      class="btn btn--secondary"
      @click="handleFormat"
      :disabled="disabled || !hasCode"
      title="格式化代码 (Ctrl+S)"
    >
      <v-icon
        icon="mdi-code-braces"
        size="16"
        class="btn-icon"
      />
      <span>格式化代码</span>
    </button>

    <button
      class="btn btn--tertiary"
      @click="handleShowCommonCode"
      :disabled="disabled"
      title="选择常用代码片段"
    >
      <v-icon
        icon="mdi-code-tags"
        size="16"
        class="btn-icon"
      />
      <span>常用代码</span>
    </button>

    <button
      class="btn btn--ghost"
      @click="handleShowAI"
      :disabled="disabled || !hasValidJson"
      :title="aiTooltip"
    >
      <v-icon
        icon="mdi-robot"
        size="16"
        class="btn-icon"
      />
      <span>AI</span>
    </button>

    <!-- 额外操作按钮 -->
    <!-- <div
      v-if="showExtraActions"
      class="extra-actions"
    >
      <button
        class="btn btn--ghost btn--small"
        @click="handleClear"
        :disabled="disabled || !hasCode"
        title="清空代码"
      >
        <v-icon
          icon="mdi-delete"
          size="14"
        />
      </button>

      <button
        class="btn btn--ghost btn--small"
        @click="handleCopy"
        :disabled="disabled || !hasCode"
        title="复制代码"
      >
        <v-icon
          icon="mdi-content-copy"
          size="14"
        />
      </button>

      <button
        v-if="showStats"
        class="btn btn--ghost btn--small"
        @click="handleShowStats"
        :disabled="disabled"
        title="显示统计信息"
      >
        <v-icon
          icon="mdi-chart-line"
          size="14"
        />
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isExecuting: {
    type: Boolean,
    default: false,
  },
  hasCode: {
    type: Boolean,
    default: false,
  },
  hasValidJson: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  layout: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical', 'grid'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  showExtraActions: {
    type: Boolean,
    default: false,
  },
  showStats: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'execute',
  'format',
  'show-common-code',
  'show-ai',
  'clear',
  'copy',
  'show-stats',
])

// 计算属性
const containerClasses = computed(() => {
  return [
    'action-buttons',
    `action-buttons--${props.layout}`,
    `action-buttons--${props.size}`,
    {
      'action-buttons--compact': props.compact,
      'action-buttons--disabled': props.disabled,
    },
  ]
})

const executeTooltip = computed(() => {
  if (props.isExecuting) {
    return '正在执行代码...'
  }
  if (!props.hasValidJson) {
    return '请提供有效的JSON数据'
  }
  return '执行代码转换 (Ctrl+Enter)'
})

const aiTooltip = computed(() => {
  if (!props.hasValidJson) {
    return '需要有效的JSON数据才能使用AI助手'
  }
  return '使用AI助手生成代码'
})

// 事件处理方法
const handleExecute = () => {
  if (!props.isExecuting && !props.disabled) {
    emit('execute')
  }
}

const handleFormat = () => {
  if (!props.disabled && props.hasCode) {
    emit('format')
  }
}

const handleShowCommonCode = () => {
  if (!props.disabled) {
    emit('show-common-code')
  }
}

const handleShowAI = () => {
  if (!props.disabled && props.hasValidJson) {
    emit('show-ai')
  }
}

const handleClear = () => {
  if (!props.disabled && props.hasCode) {
    emit('clear')
  }
}

const handleCopy = async () => {
  if (!props.disabled && props.hasCode) {
    emit('copy')
  }
}

const handleShowStats = () => {
  if (!props.disabled) {
    emit('show-stats')
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md, 12px);
  padding: var(--spacing-md, 12px) 0;
  flex-wrap: wrap;

  &--horizontal {
    flex-direction: row;
  }

  &--vertical {
    flex-direction: column;
    align-items: center;
  }

  &--grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-sm, 8px);
  }

  &--small {
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px) 0;
  }

  &--large {
    gap: var(--spacing-lg, 16px);
    padding: var(--spacing-lg, 16px) 0;
  }

  &--compact {
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-xs, 4px) 0;

    .btn {
      padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
      font-size: var(--font-size-xs, 12px);

      .btn-icon {
        width: 14px;
        height: 14px;
      }
    }
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
  border: none;
  border-radius: var(--radius-md, 8px);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
  user-select: none;
  min-height: 36px;
  position: relative;
  overflow: hidden;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--color-primary-600, #2563eb);
    color: white;
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));

    &:hover:not(:disabled) {
      background: var(--color-primary-700, #1d4ed8);
      box-shadow: var(--shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

    &.loading {
      background: var(--color-primary-500, #3b82f6);
      cursor: wait;
    }
  }

  &--secondary {
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #1f2937);
    border: 1px solid var(--border-light, #e5e7eb);

    &:hover:not(:disabled) {
      background: var(--bg-tertiary, #e5e7eb);
      border-color: var(--border-medium, #d1d5db);
      transform: translateY(-1px);
    }
  }

  &--tertiary {
    background: transparent;
    color: var(--color-primary-600, #2563eb);
    border: 1px solid var(--color-primary-600, #2563eb);

    &:hover:not(:disabled) {
      background: var(--color-primary-50, #eff6ff);
      transform: translateY(-1px);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--text-secondary, #6b7280);
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: var(--bg-secondary, #f3f4f6);
      color: var(--text-primary, #1f2937);
      border-color: var(--border-light, #e5e7eb);
    }
  }

  &--small {
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    font-size: var(--font-size-xs, 12px);
    min-height: 28px;
    border-radius: var(--radius-sm, 4px);
  }
}

.btn-icon {
  flex-shrink: 0;
  transition: transform var(--transition-fast, 0.15s);

  &--spinning {
    animation: spin 1s linear infinite;
  }
}

.extra-actions {
  display: flex;
  gap: var(--spacing-xs, 4px);
  margin-left: var(--spacing-sm, 8px);
  padding-left: var(--spacing-sm, 8px);
  border-left: 1px solid var(--border-light, #e5e7eb);
}

/* 动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 高对比度支持 */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }
}

/* 减少动画支持 */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn-icon {
    transition: none;
  }

  .btn-icon--spinning {
    animation: none;
  }
}
</style>
