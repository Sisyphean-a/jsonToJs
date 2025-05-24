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

// 处理输入变化
const handleInput = () => {
  // 发射原始输入文本
  emit('update:jsonInput', localJsonInput.value)

  try {
    const parsedJson = JSON.parse(localJsonInput.value)
    emit('update:json', parsedJson)
    hasError.value = false
  } catch (e) {
    const errorJson = {
      data: localJsonInput.value,
      error: e.message,
    }
    emit('update:json', errorJson)
    hasError.value = true
  }
}
</script>

<style lang="scss" scoped>
:deep(.v-input__details) {
  display: none;
}
</style>
