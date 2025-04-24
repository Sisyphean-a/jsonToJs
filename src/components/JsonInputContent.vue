<template>
  <v-textarea
    v-model="localJsonInput"
    label="粘贴JSON数据"
    auto-grow
    filled
    height="100%"
    @input="handleInput"
    class="pa-2"
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

// 监听外部JSON变化
watch(
  () => props.initialJson,
  (newVal) => {
    localJsonInput.value = newVal
  },
)

// 处理输入变化
const handleInput = () => {
  try {
    const parsedJson = JSON.parse(localJsonInput.value)
    emit('update:json', parsedJson)
  } catch (e) {
    // 解析错误时不更新
  }
}
</script>
