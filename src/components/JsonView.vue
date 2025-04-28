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
      >
        <span
          @click="toggleClose"
          :class="['toggle-icon', innerclosed ? 'closed' : '']"
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
                v-if="innerclosed"
                class="collapsed-content"
                @click="toggleClose"
                >...</span
              ><span v-if="innerclosed">{{ subfix }}</span>
              <span class="json-note">
                {{ innerclosed ? ' // count: ' + length : '' }}
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
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              >
                <rect
                  x="9"
                  y="9"
                  width="13"
                  height="13"
                  rx="2"
                  ry="2"
                ></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </p>
          <div
            v-if="!innerclosed && length"
            class="json-body"
          >
            <template
              v-for="(item, index) in items"
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
            <span
              v-show="!innerclosed"
              class="body-line"
            ></span>
          </div>
          <p
            v-if="!innerclosed && length"
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
import { ref, computed, watch } from 'vue'

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
})

const snackbar = ref(false)

const innerclosed = ref(props.closed)

watch(
  () => props.closed,
  (newVal) => {
    innerclosed.value = newVal
  },
)

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

const toggleClose = () => {
  innerclosed.value = !innerclosed.value
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
