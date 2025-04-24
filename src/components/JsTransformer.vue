<template>
  <div class="js-transformer">
    <div class="function-header">function transform(json) {</div>

    <div class="code-editor">
      <textarea
        v-model="jsCode"
        class="js-editor"
        placeholder="在这里输入转换代码，例如：&#10;return { ...json, processed: true }"
      ></textarea>
    </div>

    <div class="function-footer">}</div>

    <div class="button-area">
      <v-btn color="primary" @click="executeTransform" :loading="isExecuting"> 执行转换 </v-btn>
    </div>

    <div v-if="error" class="error-area">
      <div class="error-title">错误信息：</div>
      <div class="error-content">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

const jsCode = ref('')
const error = ref('')
const isExecuting = ref(false)

const executeTransform = () => {
  isExecuting.value = true
  error.value = ''

  try {
    if (!jsCode.value.trim()) {
      emit('update:transformedJson', props.json)
      return
    }

    // 创建一个新的函数
    const transformFn = new Function(
      'json',
      `
      function transform(json) {
        ${jsCode.value}
      }
      return transform(json)
    `,
    )

    // 执行转换
    const transformedJson = transformFn(props.json)
    emit('update:transformedJson', transformedJson)
  } catch (err) {
    error.value = err.message
    emit('update:transformedJson', props.json)
  } finally {
    isExecuting.value = false
  }
}
</script>

<style lang="scss" scoped>
.js-transformer {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .function-header,
  .function-footer {
    font-family: monospace;
    color: #666;
    padding: 0 10px;
    user-select: none;
  }

  .code-editor {
    flex: 1;
    min-height: 100px;
  }

  .js-editor {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-family: monospace;
    resize: none;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }

  .button-area {
    padding: 10px;
    display: flex;
    justify-content: center;
  }

  .error-area {
    padding: 10px;
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 4px;
    max-height: 80px;
    overflow-y: auto;

    .error-title {
      color: #ff4d4f;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .error-content {
      color: #ff4d4f;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
  }
}
</style>
