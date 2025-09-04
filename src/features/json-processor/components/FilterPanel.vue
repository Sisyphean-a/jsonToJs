<template>
  <div class="filter-panel">
    <v-card
      class="filter-card"
      elevation="2"
    >
      <v-card-text class="filter-content">
        <!-- 筛选配置区域 -->
        <div class="filter-config-section">
          <div class="config-row">
            <span class="config-label">筛选</span>
            <v-btn-toggle
              v-model="methodToggle"
              mandatory
              density="compact"
              color="primary"
              class="config-toggle"
            >
              <v-btn
                value="specified"
                size="small"
              >
                指定
              </v-btn>
              <v-btn
                value="recursive"
                size="small"
              >
                递归
              </v-btn>
            </v-btn-toggle>

            <span class="config-label">格式</span>
            <v-btn-toggle
              v-model="formatToggle"
              mandatory
              density="compact"
              color="primary"
              class="config-toggle"
            >
              <v-btn
                value="object"
                size="small"
              >
                对象
              </v-btn>
              <v-btn
                value="grouped"
                size="small"
              >
                分组
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>

        <!-- 数组路径配置 (仅指定层级筛选时显示) -->
        <v-row
          v-if="localFilterConfig.method === 'specified'"
          dense
          class="array-path-section"
        >
          <v-col cols="auto">
            <span class="config-label">路径</span>
          </v-col>
          <v-col
            cols="auto"
            style="min-width: 200px"
          >
            <v-text-field
              v-model="localFilterConfig.listPath"
              @update:model-value="updateListPath"
              placeholder="json"
              density="compact"
              variant="outlined"
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- 智能推荐 -->
        <div
          v-if="smartRecommendation && smartRecommendation.suggestedPaths.length > 1"
          class="path-suggestions"
        >
          <div class="suggestion-label">推荐路径：</div>
          <div class="suggestion-chips">
            <v-chip
              v-for="path in smartRecommendation.suggestedPaths"
              :key="path"
              @click="selectSuggestedPath(path)"
              size="small"
              variant="outlined"
              color="primary"
              class="suggestion-chip"
            >
              {{ path }}
            </v-chip>
          </div>
        </div>

        <!-- 已选字段管理 -->
        <div class="selected-fields-section">
          <div class="section-header">
            <span class="section-label"
              >已选字段 ({{ localFilterConfig.selectedKeys.length }})</span
            >
            <v-btn
              v-if="localFilterConfig.selectedKeys.length > 0"
              @click="clearAllFields"
              size="x-small"
              variant="text"
              color="error"
              density="compact"
              class="clear-btn"
            >
              清空
            </v-btn>
          </div>

          <!-- 字段列表 -->
          <div class="fields-list">
            <div
              v-for="field in localFilterConfig.selectedKeys"
              :key="field"
              class="field-tag"
            >
              <span class="field-name">{{ field }}</span>
              <button
                @click="removeField(field)"
                class="field-remove"
                type="button"
              >
                ×
              </button>
            </div>
          </div>

          <!-- 手动添加字段 -->
          <div class="manual-add-section">
            <v-text-field
              v-model="newFieldName"
              @keyup.enter="addManualField"
              placeholder="手动输入字段名"
              density="compact"
              variant="outlined"
              hide-details
            >
              <template #append-inner>
                <v-btn
                  @click="addManualField"
                  :disabled="!newFieldName.trim()"
                  size="small"
                  variant="text"
                  icon="mdi-plus"
                  density="compact"
                ></v-btn>
              </template>
            </v-text-field>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useJsonContext } from '../composables/useJsonContext.js'
import { analyzeJsonStructure } from '@/shared/utils/filterUtils.js'

// 使用JSON上下文
const { jsonState, updateFilterConfig, addSelectedKey, removeSelectedKey, clearSelectedKeys } =
  useJsonContext()

// 本地状态
const localFilterConfig = reactive({
  method: jsonState.filterConfig.method,
  outputFormat: jsonState.filterConfig.outputFormat,
  listPath: jsonState.filterConfig.listPath,
  selectedKeys: [...jsonState.filterConfig.selectedKeys],
})

const newFieldName = ref('')

// 智能推荐
const smartRecommendation = computed(() => {
  if (jsonState.parsedJson) {
    return analyzeJsonStructure(jsonState.parsedJson)
  }
  return null
})

// 按钮组状态 - 直接使用computed，简化逻辑
const methodToggle = computed({
  get: () => localFilterConfig.method,
  set: (value) => {
    localFilterConfig.method = value
    updateFilterConfig({ method: value })
  },
})

const formatToggle = computed({
  get: () => localFilterConfig.outputFormat,
  set: (value) => {
    localFilterConfig.outputFormat = value
    updateFilterConfig({ outputFormat: value })
  },
})

// 监听store状态变化，同步到本地状态
watch(
  () => jsonState.filterConfig,
  (newConfig) => {
    localFilterConfig.method = newConfig.method
    localFilterConfig.outputFormat = newConfig.outputFormat
    localFilterConfig.listPath = newConfig.listPath
    localFilterConfig.selectedKeys = [...newConfig.selectedKeys]
  },
  { deep: true },
)

// 监听智能推荐变化，自动应用推荐配置
watch(
  smartRecommendation,
  (recommendation) => {
    if (recommendation && jsonState.filterConfig.selectedKeys.length === 0) {
      // 只在没有选择字段时自动应用推荐
      updateFilterConfig({
        method: recommendation.method,
        listPath: recommendation.suggestedPaths[0] || 'json',
      })
    }
  },
  { immediate: true },
)

// 这些函数已经不需要了，因为使用了computed的setter

// 更新数组路径
const updateListPath = (listPath) => {
  updateFilterConfig({ listPath })
}

// 添加手动输入的字段
const addManualField = () => {
  const fieldName = newFieldName.value.trim()
  if (fieldName && !localFilterConfig.selectedKeys.includes(fieldName)) {
    addSelectedKey(fieldName)
    newFieldName.value = ''
  }
}

// 移除字段
const removeField = (field) => {
  removeSelectedKey(field)
}

// 清空所有字段
const clearAllFields = () => {
  clearSelectedKeys()
}

// 选择推荐路径
const selectSuggestedPath = (path) => {
  updateFilterConfig({ listPath: path })
}

// 定义事件
defineEmits(['field-added', 'field-removed', 'config-changed'])
</script>

<style lang="scss" scoped>
.filter-panel {
  padding: 4px;
}

.filter-card {
  border-radius: 8px;
}

.filter-content {
  padding: 16px;
}

.filter-config-section {
  margin-bottom: 16px;
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  /* 防止子元素过度拉伸 */
  > * {
    flex-shrink: 0;
  }
}

.array-path-section {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  min-width: fit-content;
  margin-right: 8px;
  padding: 4px 0;

  /* 添加一些视觉层次 */
  position: relative;

  &::after {
    content: ':';
    margin-left: 2px;
    color: #9ca3af;
  }
}

.config-toggle {
  /* 确保v-btn-toggle正确显示 */
  display: inline-flex !important;
  width: auto !important;

  .v-btn-group {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    border-radius: 6px !important;
    width: auto !important;
    overflow: hidden;
  }

  .v-btn {
    min-width: 48px !important;
    max-width: 80px !important;
    width: auto !important;
    height: 32px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    flex: none !important;
    border-radius: 0 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;

    /* 未选中状态 */
    background-color: #f9fafb !important;
    color: #6b7280 !important;
    border: 1px solid #e5e7eb !important;

    &:hover:not(.v-btn--active) {
      background-color: #f3f4f6 !important;
      color: #374151 !important;
    }

    /* 选中状态 */
    &.v-btn--active {
      background-color: #3b82f6 !important;
      color: white !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 1px 2px rgba(59, 130, 246, 0.2) !important;
      z-index: 1;
      position: relative;
    }

    /* 第一个按钮 */
    &:first-child {
      border-top-left-radius: 6px !important;
      border-bottom-left-radius: 6px !important;
    }

    /* 最后一个按钮 */
    &:last-child {
      border-top-right-radius: 6px !important;
      border-bottom-right-radius: 6px !important;
    }

    /* 中间按钮的边框处理 */
    &:not(:first-child) {
      border-left: none !important;
    }

    &.v-btn--active + .v-btn {
      border-left: 1px solid #3b82f6 !important;
    }
  }
}

.selected-fields-section {
  margin-bottom: 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
    min-height: 32px;

    .section-label {
      font-size: 13px;
      font-weight: 500;
      color: #666;
      margin-bottom: 0;
    }
  }

  .clear-btn {
    flex-shrink: 0;
    min-width: auto !important;
    padding: 4px 8px !important;
    height: 24px !important;
  }
}

.fields-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  min-height: 32px;
  padding: 8px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  align-items: flex-start;
}

.field-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 12px;
  font-size: 12px;
  color: #333;
  flex-shrink: 0;
  max-width: 200px;
}

.field-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.field-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: #bbdefb;
  border-radius: 50%;
  color: #f44336;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: #ffcdd2;
    transform: scale(1.1);
  }
}

.manual-add-section {
  margin-top: 16px;
}

.path-suggestions {
  margin-top: 16px;

  .suggestion-label {
    font-size: 11px;
    color: #999;
    margin-bottom: 6px;
  }

  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .suggestion-chip {
    font-size: 11px !important;
    height: 20px !important;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #e3f2fd;
      transform: translateY(-1px);
    }
  }
}
</style>
