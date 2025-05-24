import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePageStateStore = defineStore('pageState', () => {
  // 默认数据
  const defaultJson = {
    name: '张三',
    age: 18,
    gender: '男',
    address: {
      province: '北京',
      city: '北京',
      district: '朝阳区',
    },
  }

  const defaultTransformedJson = {
    province: '北京',
    city: '北京',
    district: '朝阳区',
  }

  const defaultHtml = '<button class="a b"><span class="c">按钮</i></button>'

  // JSON转JS页面状态
  const jsonPageState = ref({
    jsonInput: JSON.stringify(defaultJson, null, 2),
    json: defaultJson,
    transformedJson: defaultTransformedJson,
    isInitialized: false,
  })

  // HTML转JS页面状态
  const htmlPageState = ref({
    htmlInput: defaultHtml,
    html: defaultHtml,
    transformedHtml: defaultHtml,
    isInitialized: false,
  })

  // 初始化JSON页面状态
  const initJsonPage = (fallbackJson, fallbackTransformedJson) => {
    if (!jsonPageState.value.isInitialized) {
      // 只有在没有初始化时才使用传入的默认值
      jsonPageState.value.isInitialized = true
    }
  }

  // 初始化HTML页面状态
  const initHtmlPage = (fallbackHtml, fallbackTransformedHtml) => {
    if (!htmlPageState.value.isInitialized) {
      // 只有在没有初始化时才使用传入的默认值
      if (fallbackHtml) {
        htmlPageState.value.htmlInput = fallbackHtml
        htmlPageState.value.html = fallbackHtml
        htmlPageState.value.transformedHtml = fallbackTransformedHtml
      }
      htmlPageState.value.isInitialized = true
    }
  }

  // 更新JSON页面状态
  const updateJsonInput = (value) => {
    jsonPageState.value.jsonInput = value
  }

  const updateJson = (value) => {
    jsonPageState.value.json = value
  }

  const updateTransformedJson = (value) => {
    jsonPageState.value.transformedJson = value
  }

  // 更新HTML页面状态
  const updateHtmlInput = (value) => {
    htmlPageState.value.htmlInput = value
  }

  const updateHtml = (value) => {
    htmlPageState.value.html = value
  }

  const updateTransformedHtml = (value) => {
    htmlPageState.value.transformedHtml = value
  }

  // 获取状态的计算属性
  const getJsonPageState = computed(() => jsonPageState.value)
  const getHtmlPageState = computed(() => htmlPageState.value)

  return {
    // 状态
    jsonPageState,
    htmlPageState,

    // 初始化方法
    initJsonPage,
    initHtmlPage,

    // 更新方法
    updateJsonInput,
    updateJson,
    updateTransformedJson,
    updateHtmlInput,
    updateHtml,
    updateTransformedHtml,

    // 计算属性
    getJsonPageState,
    getHtmlPageState,
  }
})
