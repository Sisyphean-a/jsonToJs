<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
  >
    <v-card>
      <v-card-title>常用代码示例</v-card-title>
      <v-card-text>
        <v-expansion-panels v-model="expandedPanels">
          <v-expansion-panel
            v-for="(code, index) in commonCodes"
            :key="index"
          >
            <v-expansion-panel-title>
              {{ code.title }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="code-container">
                <pre><code class="language-javascript" v-html="highlightedCodes[index]"></code></pre>
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click.stop="selectCode(code)"
                >
                  使用此代码
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="dialog = false"
          >关闭</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { commonCodes } from '../utils/commonCodes'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const expandedPanels = ref([])
const highlightedCodes = ref([])

// 高亮所有代码
onMounted(() => {
  highlightedCodes.value = commonCodes.map((code) => {
    return hljs.highlight(code.code, { language: 'javascript' }).value
  })
})

const selectCode = (code) => {
  emit('select', code.code)
  dialog.value = false
}
</script>

<style scoped>
.code-container {
  position: relative;
  margin: 8px 0;
}

pre {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  margin: 0;
}

code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.v-expansion-panel {
  margin-bottom: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v-expansion-panel-title {
  font-weight: 500;
}
</style>
