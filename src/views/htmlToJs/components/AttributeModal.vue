<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    size="large"
    @close="$emit('update:modelValue', false)"
  >
    <!-- 头部 -->
    <template #header>
      <ModalHeader
        title="选择要移除的属性"
        @close="$emit('update:modelValue', false)"
      />
    </template>

    <!-- 内容 -->
    <template #content>
      <div
        v-if="attributes.length === 0"
        class="no-attributes"
      >
        <div class="no-attributes-icon">📝</div>
        <p>未找到任何属性</p>
      </div>
      <div
        v-else
        class="attribute-content"
      >
        <!-- 全选功能 -->
        <div class="select-all-section">
          <div
            class="select-all-item"
            @click="toggleSelectAll"
          >
            <input
              type="checkbox"
              id="select-all"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              class="custom-checkbox"
              @click.stop
            />
            <label
              for="select-all"
              class="select-all-label"
              @click.prevent
            >
              全选 ({{ selectedCount }}/{{ attributes.length }})
            </label>
          </div>
        </div>

        <!-- 属性列表 -->
        <div class="attribute-list">
          <div
            v-for="(attr, index) in attributes"
            :key="index"
            class="attribute-item"
            :class="{
              selected: attr.selected,
              'attr-high-freq': isHighFreqAttribute(attr.name),
              'attr-mid-freq': isMidFreqAttribute(attr.name),
            }"
            @click="toggleAttribute(index)"
          >
            <input
              type="checkbox"
              :id="'attr-' + index"
              v-model="attr.selected"
              class="custom-checkbox"
              @click.stop
            />
            <label
              :for="'attr-' + index"
              class="attribute-label"
              @click.stop
            >
              <span class="attribute-name">{{ attr.name }}</span>
            </label>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部 -->
    <template #footer>
      <div class="modal-footer">
        <button
          @click="confirmRemove"
          class="btn btn--danger"
          :disabled="selectedCount === 0"
        >
          <span class="btn-icon">🗑️</span>
          确认移除 {{ selectedCount > 0 ? `(${selectedCount})` : '' }}
        </button>
        <button
          @click="$emit('update:modelValue', false)"
          class="btn btn--secondary"
        >
          取消
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '../../../components/BaseModal.vue'
import ModalHeader from '../../../components/ModalHeader.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  attributes: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'remove-attributes'])

// 计算选中的数量
const selectedCount = computed(() => {
  return props.attributes.filter((attr) => attr.selected).length
})

// 计算是否全选
const isAllSelected = computed(() => {
  return props.attributes.length > 0 && selectedCount.value === props.attributes.length
})

// 计算是否部分选中
const isIndeterminate = computed(() => {
  return selectedCount.value > 0 && selectedCount.value < props.attributes.length
})

// 全选/取消全选
const toggleSelectAll = () => {
  const shouldSelectAll = !isAllSelected.value
  props.attributes.forEach((attr) => {
    attr.selected = shouldSelectAll
  })
}

const confirmRemove = () => {
  const selectedAttrs = props.attributes.filter((attr) => attr.selected).map((attr) => attr.name)
  emit('remove-attributes', selectedAttrs)
}

// 切换单个属性的选中状态
const toggleAttribute = (index) => {
  props.attributes[index].selected = !props.attributes[index].selected
}

// 高频属性列表（最常用的属性）
const highFreqAttributes = [
  'class',
  'style',
  'src',
  'href',
  'id',
  'title',
  'alt',
  'width',
  'height',
]

// 中频属性列表（较常用的属性）
const midFreqAttributes = [
  'colspan',
  'rowspan',
  'type',
  'name',
  'value',
  'placeholder',
  'disabled',
  'readonly',
  'required',
  'for',
  'target',
  'rel',
  'role',
  'tabindex',
]

// 判断是否为高频属性
const isHighFreqAttribute = (name) => {
  return highFreqAttributes.includes(name.toLowerCase())
}

// 判断是否为中频属性
const isMidFreqAttribute = (name) => {
  return midFreqAttributes.includes(name.toLowerCase()) && !isHighFreqAttribute(name)
}
</script>

<style lang="scss" scoped>
/* ========================================
   内容区域样式
======================================== */

.no-attributes {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-4xl) var(--spacing-xl);

  .no-attributes-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-lg);
  }

  p {
    margin: 0;
    font-size: var(--font-size-xl);
  }
}

.attribute-content {
  .select-all-section {
    margin-bottom: var(--spacing-2xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--border-light);

    .select-all-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: rgba(var(--color-gray-800), 0.06);
      border-radius: var(--radius-md);
      border: 1px solid rgba(var(--color-gray-800), 0.12);
      transition: all var(--transition-normal);
      cursor: pointer;
      user-select: none;
      backdrop-filter: var(--backdrop-blur);

      &:hover {
        background: rgba(var(--color-gray-800), 0.1);
        border-color: rgba(var(--color-gray-800), 0.18);
      }

      &:active {
        background: rgba(var(--color-gray-800), 0.12);
      }

      .select-all-label {
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
        cursor: pointer;
        font-size: var(--font-size-md);
        flex: 1;
      }
    }
  }

  .attribute-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }

  .attribute-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-md);
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    transition: all var(--transition-normal);
    cursor: pointer;
    box-shadow: var(--shadow-xs);

    &:hover {
      border-color: var(--border-medium);
      box-shadow: var(--shadow-sm);
    }

    &.selected {
      border-color: rgba(6, 95, 70, 0.4);
      background: var(--color-success-light);
      box-shadow: 0 2px 8px rgba(6, 95, 70, 0.1);

      .attribute-label {
        .attribute-name {
          color: #065f46;
          font-weight: var(--font-weight-semibold);
        }
      }
    }

    // 高频属性样式（最常用）
    &.attr-high-freq {
      border-left: 3px solid var(--color-info);
      background: var(--color-info-light);

      .attribute-label {
        .attribute-name {
          color: var(--color-primary-800);
          font-weight: var(--font-weight-medium);
        }
      }

      &:hover {
        border-color: var(--color-info);
        background: rgba(219, 234, 254, 0.8);
      }

      &.selected {
        border-color: rgba(6, 95, 70, 0.4);
        border-left-color: var(--color-info);
        background: rgba(236, 253, 245, 0.7);

        .attribute-label {
          .attribute-name {
            color: #065f46;
          }
        }
      }
    }

    // 中频属性样式（较常用）
    &.attr-mid-freq {
      border-left: 3px solid var(--color-warning);
      background: var(--color-warning-light);

      .attribute-label {
        .attribute-name {
          color: #d97706;
          font-weight: var(--font-weight-medium);
        }
      }

      &:hover {
        border-color: var(--color-warning);
        background: rgba(255, 251, 235, 0.8);
      }

      &.selected {
        border-color: rgba(6, 95, 70, 0.4);
        border-left-color: var(--color-warning);
        background: rgba(236, 253, 245, 0.7);

        .attribute-label {
          .attribute-name {
            color: #065f46;
          }
        }
      }
    }

    .attribute-label {
      cursor: pointer;
      flex: 1;
      overflow: hidden;

      .attribute-name {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
        transition: color var(--transition-fast);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--border-strong);
  background: var(--bg-primary);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-normal);

  &:checked {
    background: var(--color-primary-800);
    border-color: var(--color-primary-800);
  }

  &:indeterminate {
    background: #92400e;
    border-color: #92400e;
  }

  &:hover {
    border-color: var(--color-primary-600);
  }
}

.modal-footer {
  padding: var(--spacing-xl) var(--spacing-2xl);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);

  .btn {
    min-width: 120px;
    justify-content: center;
  }

  .btn-icon {
    font-size: var(--font-size-xl);
  }
}

// 响应式设计
@media (max-width: 640px) {
  .attribute-content .attribute-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-sm);
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: var(--spacing-sm);

    .btn {
      width: 100%;
    }
  }
}
</style>
