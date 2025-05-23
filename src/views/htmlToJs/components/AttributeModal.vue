<template>
  <div
    v-if="modelValue"
    class="attribute-modal"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择要移除的属性</h3>
        <button
          @click="$emit('update:modelValue', false)"
          class="close-btn"
        >
          &times;
        </button>
      </div>
      <div class="modal-body">
        <div
          v-if="attributes.length === 0"
          class="no-attributes"
        >
          未找到任何属性
        </div>
        <div
          v-else
          class="attribute-list"
        >
          <div
            v-for="(attr, index) in attributes"
            :key="index"
            class="attribute-item"
          >
            <input
              type="checkbox"
              :id="'attr-' + index"
              v-model="attr.selected"
            />
            <label :for="'attr-' + index">{{ attr.name }}</label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="confirmRemove"
          class="confirm-btn"
        >
          确认移除
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

const confirmRemove = () => {
  const selectedAttrs = props.attributes.filter((attr) => attr.selected).map((attr) => attr.name)
  emit('remove-attributes', selectedAttrs)
}
</script>

<style lang="scss" scoped>
.attribute-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal-content {
  width: 80%;
  max-width: 500px;
  max-height: 80%;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #6c757d;

    &:hover {
      color: #343a40;
    }
  }
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  max-height: 300px;

  .no-attributes {
    text-align: center;
    color: #6c757d;
    padding: 20px 0;
  }

  .attribute-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }

  .attribute-item {
    display: flex;
    align-items: center;
    gap: 6px;

    label {
      cursor: pointer;
    }
  }
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }

  .confirm-btn {
    background-color: #4dabf7;
    border: 1px solid #339af0;
    color: #fff;

    &:hover {
      background-color: #339af0;
    }
  }

  .cancel-btn {
    background-color: #fff;
    border: 1px solid #ced4da;

    &:hover {
      background-color: #f1f3f5;
    }
  }
}
</style>
