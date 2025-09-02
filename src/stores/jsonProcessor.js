import { defineStore } from 'pinia'
import { reactive, computed, readonly } from 'vue'

export const useJsonProcessorStore = defineStore('jsonProcessor', () => {
  // 状态定义
  const state = reactive({
    // 输入相关
    inputJson: '',
    inputHistory: [], // 输入历史记录
    
    // 解析相关
    parsedJson: null,
    parseErrors: [],
    
    // 转换相关
    transformedJson: null,
    transformCode: '',
    transformErrors: [],
    
    // 执行状态
    isExecuting: false,
    lastExecutionTime: null,
  })

  // 数据验证函数
  const validateJsonInput = (input) => {
    if (typeof input !== 'string') {
      throw new Error('JSON输入必须是字符串类型')
    }
    if (input.length > 1024 * 1024) { // 1MB限制
      throw new Error('JSON数据过大，请减少数据量')
    }
    return true
  }

  // Actions with validation
  const setInputJson = (json) => {
    try {
      validateJsonInput(json)
      state.inputJson = json
      
      // 添加到历史记录
      if (state.inputHistory.length >= 10) {
        state.inputHistory.shift()
      }
      state.inputHistory.push({
        content: json,
        timestamp: Date.now()
      })
      
      // 自动解析
      parseJson()
    } catch (error) {
      state.parseErrors.push({
        type: 'VALIDATION_ERROR',
        message: error.message,
        timestamp: Date.now()
      })
    }
  }

  const parseJson = () => {
    try {
      state.parseErrors = []
      const parsed = JSON.parse(state.inputJson)
      state.parsedJson = parsed
    } catch (error) {
      state.parseErrors.push({
        type: 'PARSE_ERROR',
        message: error.message,
        timestamp: Date.now()
      })
      state.parsedJson = null
    }
  }

  const setTransformCode = (code) => {
    state.transformCode = code
  }

  const setTransformedJson = (result) => {
    state.transformedJson = result
    state.lastExecutionTime = Date.now()
  }

  const setExecuting = (executing) => {
    state.isExecuting = executing
  }

  const addTransformError = (error) => {
    state.transformErrors.push({
      type: 'EXECUTION_ERROR',
      message: error.message,
      timestamp: Date.now()
    })
  }

  const clearErrors = () => {
    state.parseErrors = []
    state.transformErrors = []
  }

  const clearHistory = () => {
    state.inputHistory = []
  }

  // Getters
  const hasValidJson = computed(() => 
    state.parsedJson !== null && state.parseErrors.length === 0
  )
  
  const canExecuteTransform = computed(() => 
    hasValidJson.value && state.transformCode.trim().length > 0
  )

  const hasErrors = computed(() => 
    state.parseErrors.length > 0 || state.transformErrors.length > 0
  )

  const latestError = computed(() => {
    const allErrors = [...state.parseErrors, ...state.transformErrors]
    return allErrors.length > 0 ? allErrors[allErrors.length - 1] : null
  })

  return {
    // State (readonly)
    state: readonly(state),
    
    // Actions
    setInputJson,
    parseJson,
    setTransformCode,
    setTransformedJson,
    setExecuting,
    addTransformError,
    clearErrors,
    clearHistory,
    
    // Getters
    hasValidJson,
    canExecuteTransform,
    hasErrors,
    latestError
  }
})
