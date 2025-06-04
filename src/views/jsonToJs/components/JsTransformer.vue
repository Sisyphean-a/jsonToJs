<template>
  <div class="js-transformer">
    <ResizableRowLayout :row-count="2">
      <!-- 第一行：AI配置和助手区域 -->
      <template #row1>
        <div class="ai-section">
          <!-- API密钥配置区域 -->
          <div class="api-config" v-if="!apiKey">
            <div class="config-header">
              <span class="config-icon">🔑</span>
              <span class="config-title">配置 OpenAI API 密钥</span>
            </div>
            <div class="config-content">
              <input
                v-model="tempApiKey"
                type="password"
                class="api-input"
                placeholder="请输入您的 OpenAI API 密钥"
                @keyup.enter="saveApiKey"
              />
              <button
                class="btn btn--primary"
                @click="saveApiKey"
                :disabled="!tempApiKey.trim()"
              >
                保存密钥
              </button>
            </div>
            <div class="config-tip">
              💡 您的API密钥将保存在本地浏览器中，不会上传到服务器
            </div>
          </div>

          <!-- AI助手区域 -->
          <div v-if="apiKey" class="ai-area">
            <div class="ai-header">
              <div class="ai-title-section">
                <span class="ai-icon">🤖</span>
                <span class="ai-title">AI 转换助手</span>
              </div>
              <button
                class="btn btn--tertiary btn--sm"
                @click="resetApiKey"
                title="重置API密钥"
              >
                🔑 重置密钥
              </button>
            </div>
            
            <AITransformAssistant
              :json="json"
              :api-key="apiKey"
              @codeGenerated="handleAICodeGenerated"
            />
          </div>
        </div>
      </template>

      <!-- 第二行：代码编辑器区域 -->
      <template #row2>
        <div class="code-section">
          <div class="function-header">
            <span style="color: #2196f3">function </span>
            <span style="color: #4caf50">transform</span>(<span style="color: #ff9800">json</span>) {
          </div>

          <CodeEditor
            ref="codeEditor"
            v-model="code"
            :placeholder="defaultCode"
            @ctrl-enter="handleCtrlEnter"
            @ctrl-save="handleCtrlSave"
            @format="handleFormat"
          />

          <div class="function-footer">}</div>

          <div class="button-area">
            <button
              class="btn btn--primary"
              :class="{ loading: isExecuting }"
              @click="executeTransform"
              :disabled="isExecuting"
            >
              <span>{{ isExecuting ? '执行中...' : '执行转换' }}</span>
            </button>
            <button
              class="btn btn--secondary"
              @click="formatCode"
            >
              <span>格式化代码</span>
            </button>
            <button
              class="btn btn--tertiary"
              @click="showCommonCodeDialog = true"
            >
              <span>常用代码</span>
            </button>
          </div>

          <div
            v-if="error"
            class="error-area"
          >
            <div class="error-title">错误信息：</div>
            <div class="error-content">{{ error }}</div>
          </div>
        </div>
      </template>
    </ResizableRowLayout>

    <CommonCodeDialog
      v-model="showCommonCodeDialog"
      type="json"
      @select="handleCodeSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CodeEditor from '@/components/CodeEditor.vue'
import CommonCodeDialog from '@/components/CommonCodeDialog.vue'
import AITransformAssistant from '@/components/AITransformAssistant.vue'
import ResizableRowLayout from '@/components/ResizableRowLayout.vue'
import jsonpath from 'jsonpath'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:transformedJson'])

const codeEditor = ref(null)
const code = ref('')
const error = ref('')
const isExecuting = ref(false)
const showCommonCodeDialog = ref(false)
const apiKey = ref('')
const tempApiKey = ref('')

// 默认代码
const defaultCode =
  '// Ctrl + Enter：格式化+执行\n// Ctrl + S：格式化\n// Ctrl + /：注释/取消注释\nreturn json.address'

// 初始化代码
code.value = defaultCode

// API密钥管理
const saveApiKey = () => {
  if (tempApiKey.value.trim()) {
    apiKey.value = tempApiKey.value.trim()
    localStorage.setItem('openai_api_key', apiKey.value)
    tempApiKey.value = ''
  }
}

const resetApiKey = () => {
  apiKey.value = ''
  tempApiKey.value = ''
  localStorage.removeItem('openai_api_key')
}

const loadApiKey = () => {
  const savedKey = localStorage.getItem('openai_api_key')
  if (savedKey) {
    apiKey.value = savedKey
  }
}

// AI代码生成处理
const handleAICodeGenerated = (generatedCode) => {
  if (generatedCode) {
    codeEditor.value?.setCode(generatedCode)
    error.value = ''
  }
}

// 生命周期
onMounted(() => {
  loadApiKey()
})

const formatCode = async () => {
  try {
    await codeEditor.value?.formatCode()
  } catch (err) {
    error.value = err.message
  }
}

const executeTransform = () => {
  isExecuting.value = true
  error.value = ''

  try {
    const currentCode = codeEditor.value?.getCode() || code.value
    if (!currentCode.trim()) {
      emit('update:transformedJson', props.json)
      return
    }

    const transformFn = new Function(
      'json',
      'jsonpath',
      `
      function transform(json) {
        ${currentCode}
      }
      return transform(json)
    `,
    )

    const transformedJson = transformFn(props.json, jsonpath)
    emit('update:transformedJson', transformedJson)
  } catch (err) {
    error.value = err.message
    emit('update:transformedJson', props.json)
  } finally {
    isExecuting.value = false
  }
}

const handleCtrlEnter = async (formattedCode, formatError) => {
  if (formatError) {
    error.value = formatError.message
  } else {
    error.value = ''
  }
  executeTransform()
}

const handleCtrlSave = async (formattedCode, formatError) => {
  if (formatError) {
    error.value = formatError.message
  } else {
    error.value = ''
  }
}

const handleFormat = (formattedCode) => {
  error.value = ''
}

const handleCodeSelect = (selectedCode) => {
  codeEditor.value?.setCode(selectedCode)
}
</script>

<style lang="scss" scoped>
.js-transformer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-tertiary);

  .ai-section {
    height: 100%;
    padding: var(--spacing-lg);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .api-config {
      background: var(--bg-secondary);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      border: 1px solid var(--border-light);

      .config-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        
        .config-icon {
          font-size: var(--font-size-lg);
        }
        
        .config-title {
          font-weight: var(--font-weight-semibold);
          color: var(--text-primary);
          font-size: var(--font-size-md);
        }
      }

      .config-content {
        display: flex;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);

        .api-input {
          flex: 1;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          
          &:focus {
            outline: none;
            border-color: var(--color-primary-600);
            box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
          }
          
          &::placeholder {
            color: var(--text-tertiary);
          }
        }
      }

      .config-tip {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        background: var(--bg-tertiary);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-light);
      }
    }

    .ai-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .ai-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md) 0;

        .ai-title-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .ai-icon {
            font-size: var(--font-size-lg);
          }
          
          .ai-title {
            font-weight: var(--font-weight-semibold);
            color: var(--text-primary);
            font-size: var(--font-size-md);
          }
        }
      }
    }
  }

  .code-section {
    height: 100%;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    overflow-y: auto;

    .function-header,
    .function-footer {
      font-family: var(--font-family-mono);
      color: var(--text-secondary);
      padding: 0 var(--spacing-md);
      user-select: none;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
    }

    .button-area {
      padding: var(--spacing-md) 0;
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .error-area {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--color-error-light);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-md);
      max-height: 100px;
      overflow-y: auto;
      backdrop-filter: var(--backdrop-blur);

      .error-title {
        color: var(--color-error);
        font-weight: var(--font-weight-semibold);
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-size-base);
      }

      .error-content {
        color: var(--color-error);
        font-family: var(--font-family-mono);
        font-size: var(--font-size-sm);
        white-space: pre-wrap;
        line-height: 1.4;
      }

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--color-error);
        border-radius: var(--radius-xs);
        opacity: 0.5;
      }

      &::-webkit-scrollbar-thumb:hover {
        opacity: 0.8;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .js-transformer {
    .ai-section {
      padding: var(--spacing-md);

      .api-config {
        padding: var(--spacing-md);

        .config-content {
          flex-direction: column;
          gap: var(--spacing-sm);

          .api-input {
            margin-bottom: var(--spacing-sm);
          }
        }
      }

      .ai-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
    }

    .code-section {
      padding: var(--spacing-md);

      .function-header,
      .function-footer {
        font-size: var(--font-size-base);
        padding: 0 var(--spacing-sm);
      }

      .button-area {
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .btn {
        width: 200px;
        height: var(--button-height-lg);
      }
    }
  }
}

@media (max-width: 480px) {
  .js-transformer {
    .ai-section {
      padding: var(--spacing-sm);

      .api-config {
        padding: var(--spacing-sm);
      }
    }

    .code-section {
      padding: var(--spacing-sm);

      .btn {
        width: 100%;
        max-width: 280px;
      }
    }
  }
}
</style>
