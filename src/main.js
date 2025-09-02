import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
// 按需导入常用组件，减少打包体积
import {
  VApp,
  VMain,
  VContainer,
  VRow,
  VCol,
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VCardActions,
  VTextField,
  VTextarea,
  VIcon,
  VToolbar,
  VAppBar,
  VNavigationDrawer,
  VList,
  VListItem,
  VListItemTitle,
  VDivider,
  VMenu,
  VDialog,
  VSheet,
  VSpacer,
  VChip,
  VTooltip,
  VProgressLinear,
  VSnackbar,
  VAlert,
} from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 使用自定义轻量级图标配置
import { customSvgIconSet } from '@/shared/utils/icons.js'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components: {
    VApp,
    VMain,
    VContainer,
    VRow,
    VCol,
    VBtn,
    VCard,
    VCardText,
    VCardTitle,
    VCardActions,
    VTextField,
    VTextarea,
    VIcon,
    VToolbar,
    VAppBar,
    VNavigationDrawer,
    VList,
    VListItem,
    VListItemTitle,
    VDivider,
    VMenu,
    VDialog,
    VSheet,
    VSpacer,
    VChip,
    VTooltip,
    VProgressLinear,
    VSnackbar,
    VAlert,
  },
  directives,
  // 配置图标 - 使用SVG图标而不是字体文件
  icons: {
    defaultSet: 'custom',
    sets: {
      custom: customSvgIconSet,
    },
  },
  theme: {
    defaultTheme: 'light',
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
