<template>
  <div
    class="modal-overlay"
    v-if="modelValue"
    @click.self="closeDialog"
  >
    <div class="ai-dialog">
      <ModalHeader
        title="AI 代码生成助手"
        icon="mdi-robot"
        variant="primary"
        @close="closeDialog"
      />

      <div class="dialog-content">
        <div class="content-layout">
          <!-- 左侧：输入和配置 -->
          <div class="left-panel">
            <div class="input-section">
              <!-- API配置 -->
              <div
                v-if="!apiKey"
                class="api-config"
              >
                <div class="config-header">
                  <span>🔑 配置 API 密钥</span>
                </div>
                <div class="form-group">
                  <input
                    v-model="tempApiKey"
                    type="password"
                    class="form-input"
                    placeholder="请输入 Deepseek API 密钥"
                    @keyup.enter="saveApiKey"
                  />
                  <button
                    class="btn btn--primary btn--sm"
                    @click="saveApiKey"
                    :disabled="!tempApiKey.trim()"
                  >
                    保存
                  </button>
                </div>
                <p class="config-tip">💡 密钥仅保存在本地浏览器中</p>
              </div>

              <!-- JSON结构展示 -->
              <div
                v-if="apiKey && jsonStructure"
                class="info-block"
              >
                <h4>检测到的JSON结构</h4>
                <div class="structure-preview">{{ jsonStructure }}</div>
              </div>

              <!-- 需求输入 -->
              <div
                v-if="apiKey"
                class="form-group"
              >
                <label>描述转换需求</label>
                <textarea
                  v-model="userInput"
                  class="form-textarea"
                  placeholder="例如：提取所有用户的姓名和邮箱..."
                  rows="4"
                  :disabled="isGenerating"
                />
              </div>

              <!-- 生成按钮 -->
              <div
                v-if="apiKey"
                class="generate-section"
              >
                <button
                  class="btn btn--primary"
                  @click="generateTransformCode"
                  :disabled="isGenerating || !userInput.trim()"
                >
                  <span>{{ isGenerating ? '生成中...' : '生成代码' }}</span>
                </button>
              </div>

              <!-- API密钥管理 -->
              <div
                v-if="apiKey"
                class="key-management"
              >
                <button
                  class="btn btn--tertiary btn--sm"
                  @click="resetApiKey"
                >
                  🔑 重置密钥
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：生成结果 -->
          <div class="right-panel">
            <div class="result-section">
              <div class="result-header">
                <h4>生成的代码</h4>
                <div class="result-actions">
                  <button
                    class="btn btn--secondary btn--sm"
                    @click="regenerateCode"
                    :disabled="isGenerating || !userInput.trim() || !apiKey"
                  >
                    {{ isGenerating ? '生成中...' : '重新生成' }}
                  </button>
                  <button
                    class="btn btn--primary btn--sm"
                    @click="applyCode"
                    :disabled="!generatedCode"
                  >
                    应用
                  </button>
                </div>
              </div>

              <div class="code-display">
                <pre
                  v-if="streamedCode || generatedCode"
                  class="code-content"
                  >{{ streamedCode || generatedCode || '暂无生成代码' }}</pre
                >
                <div
                  v-else-if="!apiKey"
                  class="empty-state"
                >
                  请先配置 API 密钥
                </div>
                <div
                  v-else
                  class="empty-state"
                >
                  请输入转换需求并点击生成
                </div>
              </div>

              <!-- 错误信息 -->
              <div
                v-if="error"
                class="error-message"
              >
                <strong>错误：</strong>{{ error }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ModalHeader from '@/components/base/ModalHeader.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  json: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'codeGenerated'])

const userInput = ref('')
const jsonStructure = ref('')
const error = ref('')
const isGenerating = ref(false)
const streamedCode = ref('')
const generatedCode = ref('')
const apiKey = ref('')
const tempApiKey = ref('')

// 分析JSON结构
const analyzeJsonStructure = (json) => {
  try {
    if (!json) return 'JSON数据为空'

    const getStructure = (obj, depth = 0, maxDepth = 2) => {
      if (depth > maxDepth) return '...'

      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]'
        const firstItem = obj[0]
        if (typeof firstItem === 'object' && firstItem !== null) {
          return `[${getStructure(firstItem, depth + 1, maxDepth)}] (${obj.length}项)`
        } else {
          return `[${typeof firstItem}] (${obj.length}项)`
        }
      } else if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj).slice(0, 8)
        const structure = keys
          .map((key) => {
            const value = obj[key]
            if (Array.isArray(value)) {
              return `${key}: ${getStructure(value, depth + 1, maxDepth)}`
            } else if (typeof value === 'object' && value !== null) {
              return `${key}: {${Object.keys(value).length}属性}`
            } else {
              return `${key}: ${typeof value}`
            }
          })
          .join(', ')

        const moreKeys = Object.keys(obj).length > 8 ? ', ...' : ''
        return `{${structure}${moreKeys}}`
      } else {
        return typeof obj
      }
    }

    return getStructure(json)
  } catch (err) {
    return '无法解析JSON结构'
  }
}

// 生成AI提示词
const generatePrompt = (jsonStructure, userRequest) => {
  return `
你是一个JavaScript代码生成助手。用户有一个JSON数据，结构如下：
${jsonStructure}

用户的转换需求：${userRequest}

请生成一个JavaScript函数体（不包含function声明），该函数：
1. 接收一个名为json的参数（即原始JSON数据）
2. 有一个可用的jsonpath库（可以使用jsonpath.query(json, '$..path')等方法）
3. 返回转换后的结果

要求：
- 只返回函数体内容，不要包含function关键字或函数名
- 代码要简洁高效优雅
- 使用return语句返回结果
- 可以使用ES6+语法
- 如果需要使用jsonpath，可以直接使用jsonpath.query()等方法

现在请生成代码：
`
}

// 流式调用deepseek API
const callOpenAIStream = async (prompt, onMessage) => {
  if (!apiKey.value) {
    throw new Error('请先配置Deepseek API密钥')
  }
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的JavaScript代码生成助手，专门帮助用户生成JSON数据转换代码。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
        stream: true,
      }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let done = false
    let buffer = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        let lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.replace(/^data:/, '').trim()
            if (dataStr === '[DONE]') continue
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  onMessage(content)
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('OpenAI API流式调用失败:', err)
    throw err
  }
}

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

// 生成转换代码
const generateTransformCode = async () => {
  if (!userInput.value.trim()) return

  isGenerating.value = true
  error.value = ''
  streamedCode.value = ''
  generatedCode.value = ''

  try {
    const structure = analyzeJsonStructure(props.json)
    jsonStructure.value = structure

    const prompt = generatePrompt(structure, userInput.value)
    await callOpenAIStream(prompt, (chunk) => {
      streamedCode.value += chunk
    })

    // 清理生成的代码
    const cleanCode = streamedCode.value
      .replace(/```javascript/g, '')
      .replace(/```/g, '')
      .trim()

    generatedCode.value = cleanCode
  } catch (err) {
    error.value = err.message
  } finally {
    isGenerating.value = false
  }
}

// 重新生成代码
const regenerateCode = () => {
  generateTransformCode()
}

// 应用代码
const applyCode = () => {
  if (generatedCode.value) {
    emit('codeGenerated', generatedCode.value)
    closeDialog()
  }
}

// 关闭弹窗
const closeDialog = () => {
  emit('update:modelValue', false)
}

// 监听JSON变化时自动分析结构
watch(
  () => props.json,
  (newJson) => {
    if (newJson) {
      jsonStructure.value = analyzeJsonStructure(newJson)
    }
  },
  { immediate: true, deep: true },
)

// 生命周期
onMounted(() => {
  loadApiKey()
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.ai-dialog {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90vw;
  height: 80vh;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-content {
  flex: 1;
  overflow: hidden;
}

.content-layout {
  display: flex;
  height: 100%;
}

.left-panel {
  flex: 1;
  border-right: 1px solid var(--border-light);
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.input-section {
  height: 100%;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow-y: auto;
}

.api-config {
  .config-header {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-md);
  }

  .config-tip {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: var(--spacing-sm) 0 0 0;
  }
}

.info-block {
  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-primary);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
  }

  .structure-preview {
    background: var(--bg-tertiary);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    word-break: break-all;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &:has(input) {
    flex-direction: row;
    align-items: center;
  }

  label {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    font-size: var(--font-size-md);
  }
}

.generate-section {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.key-management {
  margin-top: auto;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.result-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);

  h4 {
    margin: 0;
    color: var(--text-primary);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
  }

  .result-actions {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.code-display {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-lg);

  .code-content {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    line-height: 1.5;
    color: var(--text-primary);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-tertiary);
    font-size: var(--font-size-md);
  }
}

.error-message {
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-error-light);
  border-top: 1px solid var(--color-error);
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
