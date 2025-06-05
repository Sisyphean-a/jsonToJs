<template>
  <v-textarea
    v-model="localJsonInput"
    :label="hasError ? '解析错误' : '粘贴JSON数据'"
    auto-grow
    filled
    height="100%"
    @input="handleInput"
    class="pa-2"
    :error="hasError"
  ></v-textarea>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialJson: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:json', 'update:jsonInput'])

const localJsonInput = ref(props.initialJson)
const hasError = ref(false)

// 监听外部JSON变化，只在值真正不同时才更新
watch(
  () => props.initialJson,
  (newVal) => {
    if (newVal !== localJsonInput.value) {
      localJsonInput.value = newVal
      hasError.value = false
    }
  },
)

// 将JS对象格式转换为标准JSON格式
const convertJsObjectToJson = (input) => {
  try {
    // 去除首尾空白字符
    let processed = input.trim()

    // 如果不是以 { 开头和 } 结尾，直接返回原输入
    if (!processed.startsWith('{') || !processed.endsWith('}')) {
      return input
    }

    // 使用正则表达式为未加引号的键名添加双引号
    // 匹配模式：单词字符开头的标识符，后面跟冒号
    processed = processed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

    // 处理开头的键名（没有前面的逗号）
    processed = processed.replace(/^(\s*\{\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

    return processed
  } catch (e) {
    return input
  }
}

// 处理输入变化
const handleInput = () => {
  // 发射原始输入文本
  emit('update:jsonInput', localJsonInput.value)

  try {
    // 首先尝试直接解析
    const parsedJson = JSON.parse(localJsonInput.value)
    emit('update:json', parsedJson)
    hasError.value = false
  } catch (e) {
    // 如果直接解析失败，尝试转换JS对象格式
    try {
      const convertedJson = convertJsObjectToJson(localJsonInput.value)
      const parsedJson = JSON.parse(convertedJson)
      emit('update:json', parsedJson)
      hasError.value = false
    } catch (convertError) {
      // 如果转换后仍然无法解析，显示错误
      const errorJson = {
        data: localJsonInput.value,
        error: convertError.message,
      }
      emit('update:json', errorJson)
      hasError.value = true
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.v-input__details) {
  display: none;
}
</style>
