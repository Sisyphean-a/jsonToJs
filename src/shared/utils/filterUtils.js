/**
 * 筛选工具函数
 * 提供两种筛选方式的代码生成和执行逻辑
 */

/**
 * 生成路径访问代码
 * @param {string} path - 路径字符串，如 'json', 'json.data', 'json.users'
 * @returns {string} 生成的访问代码
 */
export function generatePathAccessCode(path) {
  if (!path || typeof path !== 'string') {
    return 'json'
  }

  // 清理路径字符串
  const cleanPath = path.trim()

  // 如果路径就是 'json'，直接返回传入的json参数
  if (cleanPath === 'json') {
    return 'json'
  }

  // 如果路径以 'json.' 开头，生成属性访问代码
  if (cleanPath.startsWith('json.')) {
    const propertyPath = cleanPath.substring(5) // 移除 'json.' 前缀
    const properties = propertyPath.split('.').filter((prop) => prop.length > 0)

    // 生成安全的属性访问代码
    let accessCode = 'json'
    for (const prop of properties) {
      // 检查属性名是否为有效的JavaScript标识符
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prop)) {
        accessCode += `.${prop}`
      } else {
        // 对于无效标识符，使用方括号访问
        accessCode += `['${prop.replace(/'/g, "\\'")}']`
      }
    }
    return accessCode
  }

  // 如果路径不以 'json' 开头，假设它是json的一个属性
  const properties = cleanPath.split('.').filter((prop) => prop.length > 0)
  let accessCode = 'json'
  for (const prop of properties) {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(prop)) {
      accessCode += `.${prop}`
    } else {
      accessCode += `['${prop.replace(/'/g, "\\'")}']`
    }
  }
  return accessCode
}

/**
 * 生成指定层级筛选的JavaScript代码
 * @param {string} listPath - 数组路径，如 'json.data'
 * @param {string[]} selectedKeys - 要提取的字段列表
 * @param {string} outputFormat - 输出格式 'object' | 'grouped'
 * @returns {string} 生成的JavaScript代码
 */
export function generateSpecifiedLevelFilterCode(listPath, selectedKeys, outputFormat = 'object') {
  if (!selectedKeys || selectedKeys.length === 0) {
    return outputFormat === 'object' ? 'return []' : 'return {}'
  }

  const keysArray = selectedKeys.map((key) => `'${key}'`).join(', ')
  const listAccessCode = generatePathAccessCode(listPath || 'json')

  if (outputFormat === 'grouped') {
    // 字段分组格式：从指定路径收集字段值
    return `
const targetData = ${listAccessCode}
const keys = [${keysArray}]

const collectFieldValues = (data, fieldName) => {
  if (!data) return []

  if (Array.isArray(data)) {
    return data.flatMap(item =>
      item && typeof item === 'object' && fieldName in item ? [item[fieldName]] : []
    )
  }

  if (typeof data === 'object' && fieldName in data) {
    return [data[fieldName]]
  }

  return []
}

return keys.reduce((acc, key) => {
  acc[key] = collectFieldValues(targetData, key)
  return acc
}, {})
    `.trim()
  }

  // 对象格式：保持原有逻辑
  return `
const targetData = ${listAccessCode}
const keys = [${keysArray}]

// 如果目标数据是数组，直接处理
if (Array.isArray(targetData)) {
  return targetData.map((item) => {
    const result = {}
    keys.forEach((key) => {
      if (item && typeof item === 'object' && key in item) {
        result[key] = item[key]
      }
    })
    return result
  })
}

// 如果目标数据是对象，尝试从对象中提取指定字段
if (targetData && typeof targetData === 'object') {
  const result = {}
  keys.forEach((key) => {
    if (key in targetData) {
      result[key] = targetData[key]
    }
  })
  return result
}

// 如果都不是，返回空结果
throw new Error('指定的路径既不是数组也不是对象类型')
  `.trim()
}

/**
 * 生成递归深度筛选的JavaScript代码
 * @param {string[]} selectedKeys - 要搜索的字段列表
 * @param {string} outputFormat - 输出格式 'object' | 'grouped'
 * @returns {string} 生成的JavaScript代码
 */
export function generateRecursiveFilterCode(selectedKeys, outputFormat = 'grouped') {
  if (!selectedKeys || selectedKeys.length === 0) {
    return outputFormat === 'object' ? 'return []' : 'return {}'
  }

  const keysArray = selectedKeys.map((key) => `'${key}'`).join(', ')

  if (outputFormat === 'object') {
    // 对象格式：递归查找并构造对象数组
    return `
const keys = [${keysArray}]

const findObjectsWithKeys = (obj, targetKeys, path = '') => {
  if (!obj || typeof obj !== 'object') return []

  const results = []

  // 检查当前对象是否包含所需字段
  const hasTargetKeys = targetKeys.some(key => key in obj)
  if (hasTargetKeys) {
    const result = {}
    targetKeys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key]
      }
    })
    // 只有当结果对象不为空时才添加
    if (Object.keys(result).length > 0) {
      results.push(result)
    }
  }

  // 递归搜索子对象和数组
  Object.values(obj).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        results.push(...findObjectsWithKeys(item, targetKeys, path))
      })
    } else if (value && typeof value === 'object') {
      results.push(...findObjectsWithKeys(value, targetKeys, path))
    }
  })

  return results
}

return findObjectsWithKeys(json, keys)
    `.trim()
  }

  // 字段分组格式：保持原有逻辑
  return `
const objList = [${keysArray}]

const getValues = (obj, key) => {
  if (!obj || typeof obj !== 'object') {
    return []
  }

  return Object.entries(obj).flatMap(([k, v]) =>
    k === key
      ? [v]
      : Array.isArray(v)
        ? v.flatMap((o) => getValues(o, key))
        : typeof v === 'object' && v !== null
          ? getValues(v, key)
          : [],
  )
}

return objList.reduce((acc, current) => {
  acc[current] = getValues(json, current)
  return acc
}, {})
  `.trim()
}

/**
 * 根据筛选配置生成对应的JavaScript代码
 * @param {Object} filterConfig - 筛选配置
 * @param {string} filterConfig.method - 筛选方式 'specified' | 'recursive'
 * @param {string} filterConfig.outputFormat - 输出格式 'object' | 'grouped'
 * @param {string} filterConfig.listPath - 数组路径（仅指定层级筛选使用）
 * @param {string[]} filterConfig.selectedKeys - 已选字段
 * @returns {string} 生成的JavaScript代码
 */
export function generateFilterCode(filterConfig) {
  const { method, outputFormat = 'grouped', listPath, selectedKeys } = filterConfig

  if (!selectedKeys || selectedKeys.length === 0) {
    return 'return null // 请先选择要筛选的字段'
  }

  switch (method) {
    case 'specified':
      return generateSpecifiedLevelFilterCode(listPath || 'json', selectedKeys, outputFormat)
    case 'recursive':
      return generateRecursiveFilterCode(selectedKeys, outputFormat)
    default:
      throw new Error(`未知的筛选方式: ${method}`)
  }
}

/**
 * 执行筛选代码
 * @param {string} code - 要执行的JavaScript代码
 * @param {any} json - JSON数据
 * @returns {Promise<any>} 执行结果
 */
export async function executeFilterCode(code, json) {
  return new Promise((resolve, reject) => {
    try {
      // 创建安全的执行环境
      const func = new Function(
        'json',
        'jsonpath',
        `
        try {
          ${code}
        } catch (error) {
          throw new Error('筛选执行错误: ' + error.message);
        }
      `,
      )

      // 执行代码
      const result = func(json, window.jsonpath)
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 验证筛选配置
 * @param {Object} filterConfig - 筛选配置
 * @returns {Object} 验证结果 { isValid: boolean, errors: string[] }
 */
export function validateFilterConfig(filterConfig) {
  const errors = []

  if (!filterConfig) {
    errors.push('筛选配置不能为空')
    return { isValid: false, errors }
  }

  const { method, outputFormat, listPath, selectedKeys } = filterConfig

  // 验证筛选方式
  if (!['specified', 'recursive'].includes(method)) {
    errors.push('筛选方式必须是 "specified" 或 "recursive"')
  }

  // 验证输出格式
  if (outputFormat && !['object', 'grouped'].includes(outputFormat)) {
    errors.push('输出格式必须是 "object" 或 "grouped"')
  }

  // 验证已选字段
  if (!Array.isArray(selectedKeys) || selectedKeys.length === 0) {
    errors.push('请至少选择一个字段')
  }

  // 验证数组路径（仅指定层级筛选）
  if (method === 'specified') {
    if (!listPath || typeof listPath !== 'string' || listPath.trim() === '') {
      errors.push('指定层级筛选需要提供有效的数组路径')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 获取筛选方式的描述信息
 * @param {string} method - 筛选方式
 * @returns {Object} 描述信息
 */
export function getFilterMethodInfo(method) {
  const methodInfo = {
    specified: {
      name: '指定层级筛选',
      description: '从指定的数组路径中提取字段',
      example: '适用于有明确数组结构的JSON数据',
      needsPath: true,
    },
    recursive: {
      name: '递归深度筛选',
      description: '递归搜索整个JSON中的指定字段',
      example: '适用于复杂嵌套结构中收集同名字段',
      needsPath: false,
    },
  }

  return (
    methodInfo[method] || {
      name: '未知筛选方式',
      description: '',
      example: '',
      needsPath: false,
    }
  )
}

/**
 * 获取输出格式的描述信息
 * @param {string} outputFormat - 输出格式
 * @returns {Object} 描述信息
 */
export function getOutputFormatInfo(outputFormat) {
  const formatInfo = {
    object: {
      name: '对象格式',
      description: '保持原始对象结构，输出对象数组',
      example: '[{name: "张三", age: 25}, {name: "李四", age: 30}]',
    },
    grouped: {
      name: '字段分组格式',
      description: '按字段分组，输出字段值数组',
      example: '{name: ["张三", "李四"], age: [25, 30]}',
    },
  }

  return (
    formatInfo[outputFormat] || {
      name: '未知输出格式',
      description: '',
      example: '',
    }
  )
}

/**
 * 智能分析JSON结构，推荐合适的筛选方式和路径
 * @param {any} json - JSON数据
 * @returns {Object} 推荐配置 { method: string, suggestedPaths: string[], reason: string }
 */
export function analyzeJsonStructure(json) {
  if (!json || typeof json !== 'object') {
    return {
      method: 'recursive',
      suggestedPaths: ['json'],
      reason: '数据不是对象或数组，建议使用递归筛选',
    }
  }

  // 如果根级别是数组
  if (Array.isArray(json)) {
    return {
      method: 'specified',
      suggestedPaths: ['json'],
      reason: '根级别是数组，建议使用指定层级筛选',
    }
  }

  // 如果是对象，查找数组属性
  const arrayPaths = []
  const findArrayPaths = (obj, currentPath = 'json') => {
    if (!obj || typeof obj !== 'object') return

    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      const newPath = `${currentPath}.${key}`

      if (Array.isArray(value)) {
        arrayPaths.push(newPath)
      } else if (value && typeof value === 'object') {
        // 只深入一层，避免过深的嵌套
        if (currentPath.split('.').length < 3) {
          findArrayPaths(value, newPath)
        }
      }
    })
  }

  findArrayPaths(json)

  if (arrayPaths.length > 0) {
    return {
      method: 'specified',
      suggestedPaths: arrayPaths,
      reason: `发现${arrayPaths.length}个数组属性，建议使用指定层级筛选`,
    }
  }

  return {
    method: 'recursive',
    suggestedPaths: ['json'],
    reason: '对象结构复杂，建议使用递归深度筛选',
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}
