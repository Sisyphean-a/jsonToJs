<template>
  <div class="json-container">
    <v-snackbar
      v-model="snackbar"
      :timeout="500"
      color="success"
      location="top"
    >
      复制成功
    </v-snackbar>
    <div class="json-content">
      <div
        :class="['json-view', length ? 'closeable' : '']"
        :style="'font-size:' + fontSize + 'px'"
        :data-path="jsonPath"
      >
        <span
          @click="toggleExpand"
          :class="['toggle-icon', !isExpanded ? 'closed' : '']"
          v-if="length"
        ></span>
        <div class="content-wrap">
          <p class="first-line">
            <span
              v-if="jsonKey"
              class="json-key"
              >"{{ jsonKey }}":</span
            >
            <span v-if="length">
              {{ prefix
              }}<span
                v-if="!isExpanded"
                class="collapsed-content"
                @click="toggleExpand"
                :title="jsonPath"
                >...</span
              ><span v-if="!isExpanded">{{ subfix }}</span>
              <span class="json-note">
                {{ !isExpanded ? ' ' + length : '' }}
              </span>
            </span>
            <span v-if="!length">{{ isArray ? '[]' : '{}' }}</span>

            <!-- 复制按钮直接放在内容后面 -->
            <button
              class="copy-btn"
              :class="{ 'root-level': isRootLevel }"
              @click.stop="copyJson"
              title="复制JSON"
            >
              <img
                src="@/assets/icons/copy.svg"
                alt="复制"
                width="14"
                height="14"
              />
            </button>
          </p>
          <div
            v-if="isExpanded && length && forceRender"
            class="json-body"
          >
            <template
              v-for="(item, index) in renderedItems"
              :key="index"
            >
              <json-view
                :closed="closed"
                v-if="item.isJSON"
                :json="item.value"
                :jsonKey="item.key"
                :isLast="index === items.length - 1"
                :fontSize="fontSize"
                :isRootLevel="false"
                :depth="currentDepth + 1"
                :maxExpandDepth="maxExpandDepth"
                :jsonPath="generateChildPath(item.key, index)"
              ></json-view>
              <p
                class="json-item"
                v-else
              >
                <span class="json-key">
                  {{ isArray ? '' : '"' + item.key + '"' }}
                </span>
                <span v-if="!isArray || item.key">:</span>
                <span
                  class="json-value"
                  :class="{
                    'json-string': item.type === 'string',
                    'json-number': item.type === 'number',
                    'json-bool': item.type === 'boolean',
                  }"
                >
                  {{ item.value + (index === items.length - 1 ? '' : ',') }}
                </span>
              </p>
            </template>
            <p
              v-if="renderingComplete === false"
              class="json-loading"
            >
              加载中...
            </p>
            <span
              v-show="isExpanded"
              class="body-line"
            ></span>
          </div>
          <p
            v-if="isExpanded && length"
            class="last-line"
          >
            <span>{{ subfix }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  json: {
    type: [Object, Array],
    required: true,
  },
  jsonKey: {
    type: String,
    default: '',
  },
  closed: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: true,
  },
  fontSize: {
    type: Number,
    default: 18,
  },
  isRootLevel: {
    type: Boolean,
    default: true,
  },
  // 当前深度层级
  depth: {
    type: Number,
    default: 0,
  },
  // 默认最大展开深度
  maxExpandDepth: {
    type: Number,
    default: 3,
  },
  // JSON 路径标识
  jsonPath: {
    type: String,
    default: '',
  },
})

const snackbar = ref(false)
// 计算当前深度
const currentDepth = computed(() => props.depth)

// 展开/折叠状态 - 注意这里与之前的innerclosed逻辑相反
const isExpanded = ref(!(props.closed || props.depth >= props.maxExpandDepth))
// 是否需要渲染子节点 - 初始状态与展开状态相同
const forceRender = ref(isExpanded.value)

// 异步渲染相关状态
const renderedItems = ref([])
const renderingComplete = ref(false)
const batchSize = 20 // 每批渲染的项目数量

// 监听closed属性变化
watch(
  () => props.closed,
  (newVal) => {
    const shouldExpand = !(newVal || props.depth >= props.maxExpandDepth)
    isExpanded.value = shouldExpand
    // 只有当展开时才设置forceRender为true
    if (shouldExpand) {
      forceRender.value = true
    }
  },
)

// 生成子节点的JSON路径
const generateChildPath = (key, index) => {
  const basePathStr = props.jsonPath || ''
  // 对于数组，使用索引作为路径
  if (isArray.value) {
    return `${basePathStr}/${index}`
  }
  // 对于对象，使用键名作为路径
  return `${basePathStr}/${key}`
}

const copyJson = () => {
  const jsonStr = JSON.stringify(
    props.jsonKey ? { [props.jsonKey]: props.json } : props.json,
    null,
    2,
  )
  navigator.clipboard.writeText(jsonStr).then(() => {
    snackbar.value = true
  })
}

const isObjectOrArray = (source) => {
  const type = Object.prototype.toString.call(source)
  return type === '[object Array]' || type === '[object Object]'
}

// 切换展开/折叠状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value

  // 只有当展开时才设置forceRender为true
  if (isExpanded.value) {
    forceRender.value = true
    // 如果展开且尚未渲染任何项，则启动渲染
    if (items.value.length > 0 && renderedItems.value.length === 0) {
      startRender()
    }
  }
}

// 开始渲染流程
const startRender = () => {
  // 如果items数量少，直接一次性渲染
  if (items.value.length <= batchSize) {
    renderedItems.value = items.value
    renderingComplete.value = true
    return
  }

  // 重置渲染状态
  renderedItems.value = []
  renderingComplete.value = false

  // 开始批量渲染
  nextTick(() => {
    renderBatch(0, items.value)
  })
}

const isArray = computed(() => {
  return Object.prototype.toString.call(props.json) === '[object Array]'
})

const length = computed(() => {
  return isArray.value ? props.json.length : Object.keys(props.json).length
})

const subfix = computed(() => {
  return (isArray.value ? ']' : '}') + (props.isLast ? '' : ',')
})

const prefix = computed(() => {
  return isArray.value ? '[' : '{'
})

const items = computed(() => {
  if (isArray.value) {
    return props.json.map((item) => {
      const isJSON = isObjectOrArray(item)
      let type = typeof item
      if (isJSON) type = 'json'
      return {
        value: isJSON ? item : JSON.stringify(item),
        isJSON,
        key: '',
        type,
        raw: item,
      }
    })
  }

  const json = props.json
  return Object.keys(json).map((key) => {
    const item = json[key]
    const isJSON = isObjectOrArray(item)
    let type = typeof item
    if (isJSON) type = 'json'
    return {
      value: isJSON ? item : JSON.stringify(item),
      isJSON,
      key,
      type,
      raw: item,
    }
  })
})

// 异步渲染函数
const renderBatch = (startIdx, allItems) => {
  const endIdx = Math.min(startIdx + batchSize, allItems.length)

  // 使用requestIdleCallback实现时间分片（兼容性处理）
  const requestIdle =
    window.requestIdleCallback || ((cb) => setTimeout(() => cb({ timeRemaining: () => 50 }), 1))

  requestIdle(() => {
    // 如果已经折叠或不再需要渲染，则停止渲染过程
    if (!isExpanded.value || !forceRender.value) {
      renderingComplete.value = true
      return
    }

    renderedItems.value = [...renderedItems.value, ...allItems.slice(startIdx, endIdx)]

    if (endIdx < allItems.length) {
      renderBatch(endIdx, allItems)
    } else {
      renderingComplete.value = true
    }
  })
}

// 初始化时，只有展开状态才渲染
onMounted(() => {
  if (isExpanded.value && forceRender.value) {
    startRender()
  }
})

// 监听items变化
watch(
  () => items.value,
  (newItems) => {
    // 只有在展开状态且需要渲染时才处理
    if (isExpanded.value && forceRender.value) {
      // 如果items为空，直接设置完成
      if (newItems.length === 0) {
        renderedItems.value = newItems
        renderingComplete.value = true
        return
      }

      startRender()
    }
  },
)

// 监听展开状态变化
watch(
  () => isExpanded.value,
  (newExpanded) => {
    // 不再需要监听innerclosed了，逻辑已移至toggleExpand
  },
)
</script>

<style lang="scss" scoped>
.json-container {
  background-color: #f8f9fa;
  padding: 12px;
  padding-right: 40px;
  border-radius: 6px;
  position: relative;
}

.json-content {
  position: relative;
}

.json-view {
  position: relative;
  display: block;
  width: 100%;
  white-space: nowrap;
  padding-left: 20px;
  box-sizing: border-box;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'SF Mono', monospace;
  line-height: 1.5;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #495057;
  padding: 0;
  width: 16px;
  height: 16px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  /* 根层级永远显示 */
  &.root-level {
    opacity: 0.7;
  }

  &:hover {
    opacity: 1;
  }
}

/* 非根层级，鼠标悬停时显示 */
.first-line:hover .copy-btn:not(.root-level) {
  opacity: 0.7;
}

.json-note {
  color: #6c757d;
  font-style: italic;
  margin-left: 4px;
}

.json-key {
  color: #e83e8c;
  font-weight: 500;
}

.json-value {
  color: #28a745;
  font-weight: 400;
}

.json-string {
  color: #28a745;
}

.json-number {
  color: #007bff;
}

.json-bool {
  color: #fd7e14;
}

.json-loading {
  padding-left: 20px;
  color: #6c757d;
  font-style: italic;
}

.collapsed-content {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0 4px;
  border-radius: 3px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.json-item {
  margin: 0;
  padding-left: 20px;
  line-height: 1.5;
  min-height: 22px;

  .json-key + span {
    margin: 0 4px 0 0;
  }
}

.first-line {
  padding: 0;
  margin: 0;
  line-height: 1.6;
  min-height: 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.json-body {
  position: relative;
  padding: 0;
  margin: 0 0 0 1px;

  .body-line {
    position: absolute;
    height: 100%;
    width: 0;
    border-left: 1px solid #dee2e6;
    top: 0;
    left: 2px;
  }
}

.last-line {
  padding: 0;
  margin: 0;
  min-height: 22px;
}

.toggle-icon {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 16px;
  height: 16px;
  text-align: center;
  left: 0;
  top: 4px;
  border-radius: 3px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 3px 0 3px;
    border-color: #495057 transparent transparent transparent;
    transition: transform 0.2s ease;
  }

  &.closed::before {
    transform: rotate(-90deg);
  }
}
</style>
