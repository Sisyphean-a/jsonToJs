import { inject, provide } from 'vue'
import { useJsonProcessorStore } from '@/stores/jsonProcessor.js'
import { useErrorHandler } from '@/composables/useErrorHandler.js'

// JSON处理上下文
export const JSON_CONTEXT_KEY = Symbol('json-context')

export function useJsonContext() {
  const context = inject(JSON_CONTEXT_KEY)
  if (!context) {
    throw new Error('useJsonContext must be used within JsonProvider')
  }
  return context
}

export function provideJsonContext() {
  const jsonProcessor = useJsonProcessorStore()
  const { handleError } = useErrorHandler({
    context: 'JsonContext',
    maxErrors: 5,
    autoHideDelay: 5000
  })
  
  // 统一的数据处理方法
  const updateJsonInput = (input) => {
    try {
      jsonProcessor.setInputJson(input)
    } catch (error) {
      handleError(error, 'JSON输入更新')
    }
  }

  const executeTransform = async (code) => {
    try {
      jsonProcessor.setExecuting(true)
      jsonProcessor.setTransformCode(code)
      
      // 执行转换逻辑
      const result = await executeCode(code, jsonProcessor.state.parsedJson)
      jsonProcessor.setTransformedJson(result)
      
      return result
    } catch (error) {
      jsonProcessor.addTransformError(error)
      handleError(error, '代码执行')
      throw error
    } finally {
      jsonProcessor.setExecuting(false)
    }
  }

  // 代码执行函数
  const executeCode = async (code, json) => {
    return new Promise((resolve, reject) => {
      try {
        // 创建安全的执行环境
        const func = new Function('json', 'jsonpath', `
          try {
            ${code}
          } catch (error) {
            throw new Error('代码执行错误: ' + error.message);
          }
        `)
        
        // 执行代码
        const result = func(json, window.jsonpath)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  const clearAllErrors = () => {
    jsonProcessor.clearErrors()
  }

  const getInputHistory = () => {
    return jsonProcessor.state.inputHistory
  }

  const restoreFromHistory = (historyItem) => {
    updateJsonInput(historyItem.content)
  }

  const context = {
    // 状态
    jsonState: jsonProcessor.state,
    
    // 方法
    updateJsonInput,
    executeTransform,
    clearAllErrors,
    getInputHistory,
    restoreFromHistory,
    
    // 计算属性
    hasValidJson: jsonProcessor.hasValidJson,
    canExecuteTransform: jsonProcessor.canExecuteTransform,
    hasErrors: jsonProcessor.hasErrors,
    latestError: jsonProcessor.latestError
  }

  provide(JSON_CONTEXT_KEY, context)
  return context
}
