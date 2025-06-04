<template>
  <div class="ai-assistant-content">
    <div class="input-section">
      <textarea
        v-model="userInput"
        class="ai-input"
        placeholder="描述您想要的转换，例如：提取所有用户的姓名和邮箱..."
        rows="3"
        :disabled="isGenerating"
      />
      
      <button
        class="btn btn--primary ai-btn"
        :class="{ loading: isGenerating }"
        @click="generateTransformCode"
        :disabled="isGenerating || !userInput.trim()"
      >
        <span>{{ isGenerating ? '生成中...' : '生成代码' }}</span>
      </button>
    </div>

    <div v-if="jsonStructure" class="json-structure">
      <div class="structure-title">检测到的JSON结构：</div>
      <div class="structure-content">{{ jsonStructure }}</div>
    </div>

    <div v-if="error" class="error-message">
      <div class="error-title">错误：</div>
      <div class="error-content">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  json: {
    type: Object,
    required: true,
  },
  apiKey: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['codeGenerated'])

const userInput = ref('')
const jsonStructure = ref('')
const error = ref('')
const isGenerating = ref(false)

// 分析JSON结构
const analyzeJsonStructure = (json) => {
  try {
    if (!json) return 'JSON数据为空'
    
    const getStructure = (obj, depth = 0, maxDepth = 3) => {
      if (depth > maxDepth) return '...'
      
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]'
        const firstItem = obj[0]
        if (typeof firstItem === 'object' && firstItem !== null) {
          return `[${getStructure(firstItem, depth + 1, maxDepth)}] (${obj.length}个元素)`
        } else {
          return `[${typeof firstItem}] (${obj.length}个元素)`
        }
      } else if (typeof obj === 'object' && obj !== null) {
        const keys = Object.keys(obj).slice(0, 10) // 只显示前10个键
        const structure = keys.map(key => {
          const value = obj[key]
          if (Array.isArray(value)) {
            return `${key}: ${getStructure(value, depth + 1, maxDepth)}`
          } else if (typeof value === 'object' && value !== null) {
            return `${key}: {${Object.keys(value).length}个属性}`
          } else {
            return `${key}: ${typeof value}`
          }
        }).join(', ')
        
        const moreKeys = Object.keys(obj).length > 10 ? ', ...' : ''
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
- 代码要简洁高效
- 使用return语句返回结果
- 可以使用ES6+语法
- 如果需要使用jsonpath，可以直接使用jsonpath.query()等方法
- 添加必要的错误处理

示例输出格式：
// 提取所有用户的姓名
try {
  const users = json.users || []
  return users.map(user => user.name).filter(name => name)
} catch (error) {
  return []
}

现在请生成代码：
`
}

// 调用OpenAI API
const callOpenAI = async (prompt) => {
  if (!props.apiKey) {
    throw new Error('请先配置OpenAI API密钥')
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的JavaScript代码生成助手，专门帮助用户生成JSON数据转换代码。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  } catch (err) {
    console.error('OpenAI API调用失败:', err)
    throw err
  }
}

// 生成转换代码
const generateTransformCode = async () => {
  if (!userInput.value.trim()) return
  
  isGenerating.value = true
  error.value = ''
  
  try {
    const structure = analyzeJsonStructure(props.json)
    jsonStructure.value = structure
    
    const prompt = generatePrompt(structure, userInput.value)
    const generatedCode = await callOpenAI(prompt)
    
    // 清理生成的代码
    const cleanCode = generatedCode
      .replace(/```javascript/g, '')
      .replace(/```/g, '')
      .trim()
    
    emit('codeGenerated', cleanCode)
  } catch (err) {
    error.value = err.message
  } finally {
    isGenerating.value = false
  }
}

// 监听JSON变化时自动分析结构
watch(() => props.json, (newJson) => {
  if (newJson) {
    jsonStructure.value = analyzeJsonStructure(newJson)
  }
}, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.ai-assistant-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;

  .input-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    .ai-input {
      width: 100%;
      padding: var(--spacing-md);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font-family-base);
      font-size: var(--font-size-base);
      resize: vertical;
      min-height: 60px;
      
      &:focus {
        outline: none;
        border-color: var(--color-primary-600);
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .ai-btn {
      align-self: flex-start;
      min-width: 120px;
    }
  }

  .json-structure {
    padding: var(--spacing-md);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-light);

    .structure-title {
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .structure-content {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      color: var(--text-primary);
      line-height: 1.4;
      word-break: break-all;
    }
  }

  .error-message {
    padding: var(--spacing-md);
    background: var(--color-error-light);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-md);

    .error-title {
      color: var(--color-error);
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .error-content {
      color: var(--color-error);
      font-size: var(--font-size-sm);
      line-height: 1.4;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-assistant-content {
    .input-section .ai-btn {
      align-self: stretch;
    }
  }
}
</style> 