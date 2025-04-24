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

const emit = defineEmits(['update:json'])

const localJsonInput = ref(props.initialJson)
const hasError = ref(false)

// 监听外部JSON变化
watch(
  () => props.initialJson,
  (newVal) => {
    localJsonInput.value = newVal
    hasError.value = false
  },
)

// 处理输入变化
const handleInput = () => {
  try {
    const parsedJson = JSON.parse(localJsonInput.value)
    emit('update:json', parsedJson)
    hasError.value = false
  } catch (e) {
    // 解析错误时不更新
    console.log('解析错误', e)
    hasError.value = true
  }
}
</script>
