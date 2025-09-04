<template>
  <div class="filter-panel">
    <v-card
      class="filter-card"
      elevation="2"
    >
      <v-card-title class="filter-title">
        <v-icon
          class="mr-2"
          size="20"
          >mdi-filter</v-icon
        >
        筛选配置
      </v-card-title>

      <v-card-text class="filter-content">
        <!-- 筛选方式选择 -->
        <div class="filter-method-section">
          <div class="section-label">筛选方式</div>
          <div class="radio-group">
            <v-btn-toggle
              v-model="localFilterConfig.method"
              @update:model-value="updateFilterMethod"
              mandatory
              variant="outlined"
              density="compact"
            >
              <v-btn
                value="specified"
                size="small"
              >
                指定层级筛选
              </v-btn>
              <v-btn
                value="recursive"
                size="small"
              >
                递归深度筛选
              </v-btn>
            </v-btn-toggle>
          </div>
        </div>

        <!-- 数组路径配置 (仅指定层级筛选时显示) -->
        <div
          v-if="localFilterConfig.method === 'specified'"
          class="array-path-section"
        >
          <div class="section-label">数组路径</div>
          <v-text-field
            v-model="localFilterConfig.listPath"
            @update:model-value="updateListPath"
            placeholder="json"
            density="compact"
            variant="outlined"
            hint="指定要处理的数组位置，如 json.data"
            persistent-hint
          ></v-text-field>

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
            <v-chip
              v-for="(field, index) in localFilterConfig.selectedKeys"
              :key="field"
              class="field-chip"
              closable
              @click:close="removeField(field)"
              color="primary"
              variant="outlined"
            >
              <span class="field-name">{{ field }}</span>
              <template #append>
                <div class="field-actions">
                  <v-btn
                    @click.stop="moveFieldUp(index)"
                    :disabled="index === 0"
                    size="x-small"
                    variant="text"
                    icon="mdi-arrow-up"
                    density="compact"
                  ></v-btn>
                  <v-btn
                    @click.stop="moveFieldDown(index)"
                    :disabled="index === localFilterConfig.selectedKeys.length - 1"
                    size="x-small"
                    variant="text"
                    icon="mdi-arrow-down"
                    density="compact"
                  ></v-btn>
                </div>
              </template>
            </v-chip>
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

// 监听store状态变化，同步到本地状态
watch(
  () => jsonState.filterConfig,
  (newConfig) => {
    localFilterConfig.method = newConfig.method
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

// 更新筛选方式
const updateFilterMethod = (method) => {
  updateFilterConfig({ method })
}

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

// 字段上移
const moveFieldUp = (index) => {
  if (index > 0) {
    const newKeys = [...localFilterConfig.selectedKeys]
    ;[newKeys[index - 1], newKeys[index]] = [newKeys[index], newKeys[index - 1]]
    updateFilterConfig({ selectedKeys: newKeys })
  }
}

// 字段下移
const moveFieldDown = (index) => {
  if (index < localFilterConfig.selectedKeys.length - 1) {
    const newKeys = [...localFilterConfig.selectedKeys]
    ;[newKeys[index], newKeys[index + 1]] = [newKeys[index + 1], newKeys[index]]
    updateFilterConfig({ selectedKeys: newKeys })
  }
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
  padding: var(--spacing-md);
}

.filter-card {
  border-radius: var(--radius-md);
}

.filter-title {
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(var(--color-primary), 0.05);
  border-bottom: 1px solid var(--border-light);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

.filter-content {
  padding: var(--spacing-lg);
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  display: block;
  flex: 1;
  white-space: nowrap;
}

.filter-method-section {
  margin-bottom: var(--spacing-lg);
}

.array-path-section {
  margin-bottom: var(--spacing-lg);
}

.selected-fields-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    gap: var(--spacing-sm);
    min-height: 32px;
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
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  min-height: 40px;
  padding: var(--spacing-sm);
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
  background: rgba(var(--color-gray-50), 0.3);
}

.field-chip {
  .field-name {
    font-size: var(--font-size-sm);
  }

  .field-actions {
    display: flex;
    gap: 2px;
    margin-left: var(--spacing-xs);
  }
}

.manual-add-section {
  margin-top: var(--spacing-md);
}

.path-suggestions {
  margin-top: var(--spacing-md);

  .suggestion-label {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    margin-bottom: var(--spacing-xs);
  }

  .suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .suggestion-chip {
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background-color: rgba(var(--color-primary), 0.1);
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-panel {
    padding: var(--spacing-sm);
  }

  .filter-content {
    padding: var(--spacing-md);
  }

  .fields-list {
    gap: var(--spacing-xs);
  }
}
</style>
