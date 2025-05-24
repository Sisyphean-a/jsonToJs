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
            :class="{ selected: attr.selected }"
          >
            <input
              type="checkbox"
              :id="'attr-' + index"
              v-model="attr.selected"
              class="custom-checkbox"
            />
            <label
              :for="'attr-' + index"
              class="attribute-label"
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
          class="confirm-btn"
          :disabled="selectedCount === 0"
        >
          <span class="btn-icon">🗑️</span>
          确认移除 {{ selectedCount > 0 ? `(${selectedCount})` : '' }}
        </button>
        <button
          @click="$emit('update:modelValue', false)"
          class="cancel-btn"
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
</script>

<style lang="scss" scoped>
/* ========================================
   内容区域样式
======================================== */

.no-attributes {
  text-align: center;
  color: #6b7280;
  padding: 40px 20px;

  .no-attributes-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    margin: 0;
    font-size: 16px;
  }
}

.attribute-content {
  .select-all-section {
    margin-bottom: 18px;
    padding-bottom: 14px;
    border-bottom: 2px solid #e5e7eb;

    .select-all-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(30, 41, 59, 0.06);
      border-radius: 8px;
      border: 1px solid rgba(30, 41, 59, 0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      user-select: none;
      backdrop-filter: blur(8px);

      &:hover {
        background: rgba(30, 41, 59, 0.1);
        border-color: rgba(30, 41, 59, 0.18);
      }

      &:active {
        background: rgba(30, 41, 59, 0.12);
      }

      .select-all-label {
        font-weight: 600;
        color: #334155;
        cursor: pointer;
        font-size: 14px;
        flex: 1;
      }
    }
  }

  .attribute-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .attribute-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: white;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(30, 41, 59, 0.3);
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.1);
    }

    &.selected {
      border-color: rgba(6, 95, 70, 0.4);
      background: rgba(236, 253, 245, 0.5);
      box-shadow: 0 2px 8px rgba(6, 95, 70, 0.1);

      .attribute-label {
        .attribute-name {
          color: #065f46;
          font-weight: 600;
        }
      }
    }

    .attribute-label {
      cursor: pointer;
      flex: 1;
      overflow: hidden;

      .attribute-name {
        font-size: 13px;
        font-weight: 500;
        color: #374151;
        transition: color 0.2s ease;
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
  border-radius: 3px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:checked {
    background: #1e3a8a;
    border-color: #1e3a8a;
  }

  &:indeterminate {
    background: #92400e;
    border-color: #92400e;
  }

  &:hover {
    border-color: rgba(30, 58, 138, 0.6);
  }
}

.modal-footer {
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  button {
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .confirm-btn {
    background: linear-gradient(135deg, #991b1b 0%, #b91c1c 100%);
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(153, 27, 27, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%);
      box-shadow: 0 4px 12px rgba(153, 27, 27, 0.4);
    }

    &:disabled {
      background: rgba(148, 163, 184, 0.3);
      color: rgba(148, 163, 184, 0.6);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;

      .btn-icon {
        opacity: 0.5;
      }
    }

    .btn-icon {
      font-size: 16px;
    }
  }

  .cancel-btn {
    background: white;
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #334155;

    &:hover {
      background: rgba(248, 250, 252, 0.8);
      border-color: rgba(148, 163, 184, 0.5);
    }
  }
}

// 响应式设计
@media (max-width: 640px) {
  .attribute-content .attribute-list {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 8px;

    button {
      width: 100%;
    }
  }
}
</style>
