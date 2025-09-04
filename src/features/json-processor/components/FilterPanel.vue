<template>
  <div class="filter-panel">
    <v-card
      class="filter-card"
      elevation="2"
    >
      <v-card-text class="filter-content">
        <!-- 筛选方式选择 -->
        <div class="filter-method-section">
          <div class="method-row">
            <span class="section-label">筛选方式：</span>
            <div class="method-buttons">
              <v-btn
                :variant="localFilterConfig.method === 'specified' ? 'flat' : 'outlined'"
                :color="localFilterConfig.method === 'specified' ? 'primary' : 'default'"
                @click="updateFilterMethod('specified')"
                size="small"
                density="compact"
                class="method-btn"
              >
                指定层级筛选
              </v-btn>
              <v-btn
                :variant="localFilterConfig.method === 'recursive' ? 'flat' : 'outlined'"
                :color="localFilterConfig.method === 'recursive' ? 'primary' : 'default'"
                @click="updateFilterMethod('recursive')"
                size="small"
                density="compact"
                class="method-btn"
              >
                递归深度筛选
              </v-btn>
            </div>
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

.filter-content {
  padding: var(--spacing-md);
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  display: inline-block;
  flex-shrink: 0;
  white-space: nowrap;
  min-width: auto;
  width: auto;
}

.filter-method-section {
  margin-bottom: var(--spacing-md);

  .method-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .section-label {
    width: 70px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .method-buttons {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .method-btn {
    font-size: 12px !important;
    width: 90px !important;
    min-width: 90px !important;
    max-width: 90px !important;
    padding: 0 4px !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    height: 28px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
}

.array-path-section {
  margin-bottom: var(--spacing-md);
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
  gap: 6px;
  margin-bottom: var(--spacing-md);
  min-height: 32px;
  padding: 8px;
  border: 1px dashed var(--border-light);
  border-radius: var(--radius-sm);
  background: rgba(var(--color-gray-50), 0.3);
  align-items: flex-start;
}

.field-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: rgba(var(--color-primary), 0.1);
  border: 1px solid rgba(var(--color-primary), 0.3);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-primary);
  flex-shrink: 0;
  max-width: 200px;
}

.field-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.field-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(var(--color-primary), 0.2);
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(var(--color-primary), 0.3);
    transform: scale(1.1);
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
