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
                <div
                  :ref="(el) => (codeEditors[index] = el)"
                  class="code-editor"
                ></div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { commonCodes } from '../utils/commonCodes'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { createEditorExtensions } from '../utils/editorUtils'

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

const codeEditors = ref([])
const editorViews = ref([])
const expandedPanels = ref([])

// 创建编辑器扩展
const extensions = createEditorExtensions(true)

// 初始化指定索引的编辑器
const initEditor = async (index) => {
  await nextTick()
  const editor = codeEditors.value[index]

  if (editor && !editorViews.value[index]) {
    const view = new EditorView({
      state: EditorState.create({
        doc: commonCodes[index].code,
        extensions,
      }),
      parent: editor,
    })
    editorViews.value[index] = view
  }
}

// 清理编辑器实例
const cleanupEditors = () => {
  editorViews.value.forEach((view, index) => {
    if (view) {
      view.destroy()
    }
  })
  editorViews.value = []
  expandedPanels.value = []
}

// 监听面板展开状态变化
watch(
  expandedPanels,
  async (newVal, oldVal) => {
    // 初始化新展开的面板
    if (newVal !== null) {
      await initEditor(newVal)
    }

    // 清理已关闭的面板的编辑器实例
    if (oldVal !== null && oldVal !== newVal) {
      if (editorViews.value[oldVal]) {
        editorViews.value[oldVal].destroy()
        editorViews.value[oldVal] = null
      }
    }
  },
  { deep: true },
)

watch(dialog, (newVal) => {
  if (!newVal) {
    cleanupEditors()
  }
})

onBeforeUnmount(() => {
  cleanupEditors()
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

.code-editor {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  margin: 0;
  overflow-x: auto;
  border: 1px solid #e0e0e0;
  min-height: 50px;
}

.v-expansion-panel {
  margin-bottom: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v-expansion-panel-title {
  font-weight: 500;
}

:deep(.cm-editor) {
  height: 100%;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
