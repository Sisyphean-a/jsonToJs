<template>
  <div class="code-executor">
    <!-- 代码执行逻辑在这里处理，不需要UI -->
  </div>
</template>

<script setup>
import { ref, computed, readonly } from 'vue'
import { useErrorHandler } from '@/shared/composables/useErrorHandler.js'
import { SECURITY_CONFIG, EDITOR_CONFIG } from '@/shared/constants/app-config.js'
import jsonpath from 'jsonpath'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  json: {
    type: Object,
    required: true,
  },
  autoExecute: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['result', 'error', 'executing'])

// 使用统一错误处理
const { handleError, clearErrors } = useErrorHandler({
  context: 'CodeExecutor',
  maxErrors: 1,
  autoHideDelay: 0,
})

// 执行状态
const isExecuting = ref(false)
const lastExecutionTime = ref(null)
const executionHistory = ref([])

// 计算属性
const hasCode = computed(() => props.code && props.code.trim().length > 0)
const isValidJson = computed(() => {
  try {
    return props.json && typeof props.json === 'object'
  } catch {
    return false
  }
})

/**
 * 验证代码安全性
 * @param {string} code 要验证的代码
 * @returns {Object} 验证结果
 */
const validateCodeSecurity = (code) => {
  const dangerousPatterns = SECURITY_CONFIG.dangerousPatterns
  const violations = []

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      violations.push({
        pattern: pattern.source,
        message: `检测到潜在危险代码模式: ${pattern.source}`,
      })
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  }
}

/**
 * 创建安全的执行环境
 * @param {string} userCode 用户代码
 * @returns {Function} 安全的执行函数
 */
const createSafeExecutor = (userCode) => {
  // 创建受限的执行环境
  const safeGlobals = {
    // 允许的全局对象
    JSON,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,

    // 工具函数
    jsonpath,

    // 安全的控制台方法（可选）
    console: {
      log: (...args) => console.log('[User Code]', ...args),
      warn: (...args) => console.warn('[User Code]', ...args),
      error: (...args) => console.error('[User Code]', ...args),
    },
  }

  // 构建安全的函数代码
  const functionCode = `
    "use strict";
    
    // 禁用危险的全局对象
    const window = undefined;
    const document = undefined;
    const localStorage = undefined;
    const sessionStorage = undefined;
    const fetch = undefined;
    const XMLHttpRequest = undefined;
    const eval = undefined;
    const Function = undefined;
    const setTimeout = undefined;
    const setInterval = undefined;
    const require = undefined;
    const module = undefined;
    const exports = undefined;
    const global = undefined;
    const process = undefined;
    
    // 用户转换函数
    function transform(json) {
      ${userCode}
    }
    
    return transform(json);
  `

  return new Function('json', 'jsonpath', ...Object.keys(safeGlobals), functionCode)
}

/**
 * 执行代码转换
 * @returns {Promise<any>} 转换结果
 */
const executeTransform = async () => {
  if (!hasCode.value) {
    emit('result', props.json)
    return props.json
  }

  if (!isValidJson.value) {
    const error = new Error('无效的JSON输入数据')
    handleError(error, 'Input Validation')
    emit('error', error)
    throw error
  }

  isExecuting.value = true
  emit('executing', true)
  clearErrors()

  const startTime = Date.now()

  try {
    // 安全性验证
    const securityCheck = validateCodeSecurity(props.code)
    if (!securityCheck.isValid) {
      const securityError = new Error(
        `代码安全检查失败:\n${securityCheck.violations.map((v) => v.message).join('\n')}`,
      )
      throw securityError
    }

    // 创建安全执行器
    const executor = createSafeExecutor(props.code)

    // 设置执行超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`代码执行超时 (${SECURITY_CONFIG.codeExecution.timeout}ms)`))
      }, SECURITY_CONFIG.codeExecution.timeout)
    })

    // 执行代码
    const executionPromise = Promise.resolve().then(() => {
      const safeGlobals = [jsonpath]
      return executor(props.json, ...safeGlobals)
    })

    // 竞争执行和超时
    const result = await Promise.race([executionPromise, timeoutPromise])

    const executionTime = Date.now() - startTime
    lastExecutionTime.value = executionTime

    // 记录执行历史
    addExecutionHistory({
      timestamp: new Date(),
      executionTime,
      success: true,
      codeLength: props.code.length,
    })

    emit('result', result)
    return result
  } catch (error) {
    const executionTime = Date.now() - startTime

    // 记录执行历史
    addExecutionHistory({
      timestamp: new Date(),
      executionTime,
      success: false,
      error: error.message,
      codeLength: props.code.length,
    })

    // 处理错误
    handleError(error, 'Code Execution', {
      code: props.code,
      jsonInput: props.json,
      executionTime,
    })

    emit('error', error)
    emit('result', props.json) // 返回原始数据作为fallback
    throw error
  } finally {
    isExecuting.value = false
    emit('executing', false)
  }
}

/**
 * 添加执行历史记录
 * @param {Object} record 执行记录
 */
const addExecutionHistory = (record) => {
  executionHistory.value.push(record)

  // 只保留最近的20条记录
  if (executionHistory.value.length > 20) {
    executionHistory.value.shift()
  }
}

/**
 * 获取执行统计信息
 * @returns {Object} 统计信息
 */
const getExecutionStats = () => {
  const history = executionHistory.value
  const successCount = history.filter((r) => r.success).length
  const errorCount = history.length - successCount
  const avgExecutionTime =
    history.length > 0 ? history.reduce((sum, r) => sum + r.executionTime, 0) / history.length : 0

  return {
    totalExecutions: history.length,
    successCount,
    errorCount,
    successRate: history.length > 0 ? (successCount / history.length) * 100 : 0,
    avgExecutionTime: Math.round(avgExecutionTime),
    lastExecutionTime: lastExecutionTime.value,
  }
}

/**
 * 清除执行历史
 */
const clearExecutionHistory = () => {
  executionHistory.value = []
  lastExecutionTime.value = null
}

// 暴露方法给父组件
defineExpose({
  executeTransform,
  getExecutionStats,
  clearExecutionHistory,
  isExecuting: readonly(isExecuting),
  hasCode,
  isValidJson,
})
</script>

<style lang="scss" scoped>
.code-executor {
  display: none; // 这个组件不需要UI，只处理逻辑
}
</style>
