import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePageStateStore = defineStore('pageState', () => {
  // Default data for JSON to JS
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

  // Default data for HTML to JS
  const defaultHtml = '<button class="a b"><span class="c">按钮</i></button>'

  // Default data for Request to JS
  const defaultCurlInput = '';
  const defaultRequestOutput = '';

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

  // Request to JS页面状态
  const requestToJsPageState = ref({
    curlCommandInput: defaultCurlInput,
    requestOutputJson: defaultRequestOutput,
    isInitialized: false,
  })

  // --- Initialization Functions ---
  const initJsonPage = (fallbackJson, fallbackTransformedJson) => {
    if (!jsonPageState.value.isInitialized) {
      jsonPageState.value.isInitialized = true
    }
  }

  const initHtmlPage = (fallbackHtml, fallbackTransformedHtml) => {
    if (!htmlPageState.value.isInitialized) {
      if (fallbackHtml) {
        htmlPageState.value.htmlInput = fallbackHtml
        htmlPageState.value.html = fallbackHtml
        htmlPageState.value.transformedHtml = fallbackTransformedHtml
      }
      htmlPageState.value.isInitialized = true
    }
  }

  const initRequestToJsPage = () => {
    if (!requestToJsPageState.value.isInitialized) {
      // Initialize with defaults, no fallback needed for now
      requestToJsPageState.value.curlCommandInput = defaultCurlInput;
      requestToJsPageState.value.requestOutputJson = defaultRequestOutput;
      requestToJsPageState.value.isInitialized = true;
    }
  }

  // --- Update Functions ---
  // JSON
  const updateJsonInput = (value) => {
    jsonPageState.value.jsonInput = value
  }
  const updateJson = (value) => {
    jsonPageState.value.json = value
  }
  const updateTransformedJson = (value) => {
    jsonPageState.value.transformedJson = value
  }

  // HTML
  const updateHtmlInput = (value) => {
    htmlPageState.value.htmlInput = value
  }
  const updateHtml = (value) => {
    htmlPageState.value.html = value
  }
  const updateTransformedHtml = (value) => {
    htmlPageState.value.transformedHtml = value
  }

  // RequestToJs
  const updateCurlCommandInput = (value) => {
    requestToJsPageState.value.curlCommandInput = value;
  }
  const updateRequestOutputJson = (value) => {
    requestToJsPageState.value.requestOutputJson = value;
  }

  // --- Getters (Computed Properties) ---
  const getJsonPageState = computed(() => jsonPageState.value)
  const getHtmlPageState = computed(() => htmlPageState.value)
  const getRequestToJsPageState = computed(() => requestToJsPageState.value);

  return {
    // State objects (consider if these need to be directly exposed)
    jsonPageState,
    htmlPageState,
    requestToJsPageState, // Added state

    // Initialization methods
    initJsonPage,
    initHtmlPage,
    initRequestToJsPage, // Added init method

    // Update methods
    updateJsonInput,
    updateJson,
    updateTransformedJson,
    updateHtmlInput,
    updateHtml,
    updateTransformedHtml,
    updateCurlCommandInput, // Added update method
    updateRequestOutputJson, // Added update method

    // Computed Getters
    getJsonPageState,
    getHtmlPageState,
    getRequestToJsPageState, // Added getter
  }
})
