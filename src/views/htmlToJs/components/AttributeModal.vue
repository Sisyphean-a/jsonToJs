<template>
  <div
    v-if="modelValue"
    class="attribute-modal"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择要移除的属性</h3>
        <button
          @click="$emit('update:modelValue', false)"
          class="close-btn"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              d="M13 1L1 13M1 1L13 13"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <div class="modal-body">
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
            <div class="select-all-item">
              <input
                type="checkbox"
                id="select-all"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
                class="custom-checkbox"
              />
              <label
                for="select-all"
                class="select-all-label"
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
      </div>
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
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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
.attribute-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    width: 32px;
    height: 32px;
    cursor: pointer;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;

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
        padding: 10px 14px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 10px;
        border: 1px solid #0ea5e9;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(14, 165, 233, 0.12);
        }

        .select-all-label {
          font-weight: 600;
          color: #0369a1;
          cursor: pointer;
          font-size: 14px;
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
      padding: 10px 12px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        border-color: #3b82f6;
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(59, 130, 246, 0.12);
      }

      &.selected {
        border-color: #10b981;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);

        .attribute-label {
          .attribute-name {
            color: #059669;
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
}

.custom-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  &:checked {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  &:indeterminate {
    background: #f59e0b;
    border-color: #f59e0b;
  }

  &:hover {
    border-color: #3b82f6;
    transform: scale(1.05);
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
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    }

    &:disabled {
      background: #d1d5db;
      color: #9ca3af;
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
    border: 2px solid #d1d5db;
    color: #374151;

    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  }
}

// 响应式设计
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 20px;
    max-height: 90vh;
  }

  .modal-body .attribute-content .attribute-list {
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
