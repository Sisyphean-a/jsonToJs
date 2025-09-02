// 只导入项目中实际使用的图标，减少打包体积
import { h, defineComponent } from 'vue'
import {
  mdiHome,
  mdiCodeTags,
  mdiContentCopy,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiCheck,
  mdiAlert,
  mdiInformation,
  mdiMenu,
  mdiFormatAlignLeft,
  mdiPlay,
  mdiStop,
  mdiRefresh,
  mdiDownload,
  mdiUpload,
  mdiFileDocument,
  mdiCog,
  mdiHelpCircle,
  mdiNavigationVariant,
  mdiArrowRight,
  mdiFile,
  mdiCodeBraces,
  mdiRobot,
} from '@mdi/js'

// 定义项目中使用的图标映射 - 使用完整的mdi-前缀名称
export const icons = {
  'mdi-home': mdiHome,
  'mdi-code-tags': mdiCodeTags,
  'mdi-content-copy': mdiContentCopy,
  'mdi-chevron-down': mdiChevronDown,
  'mdi-chevron-up': mdiChevronUp,
  'mdi-close': mdiClose,
  'mdi-check': mdiCheck,
  'mdi-alert': mdiAlert,
  'mdi-information': mdiInformation,
  'mdi-menu': mdiMenu,
  'mdi-format-align-left': mdiFormatAlignLeft,
  'mdi-play': mdiPlay,
  'mdi-stop': mdiStop,
  'mdi-refresh': mdiRefresh,
  'mdi-download': mdiDownload,
  'mdi-upload': mdiUpload,
  'mdi-file-document': mdiFileDocument,
  'mdi-cog': mdiCog,
  'mdi-help-circle': mdiHelpCircle,
  'mdi-navigation-variant': mdiNavigationVariant,
  'mdi-arrow-right': mdiArrowRight,
  'mdi-file': mdiFile,
  'mdi-code-braces': mdiCodeBraces,
  'mdi-robot': mdiRobot,
}

// SVG图标集配置
export const customSvgIconSet = {
  component: defineComponent({
    name: 'CustomIcon',
    props: {
      icon: String,
      size: [String, Number],
    },
    setup(props) {
      return () => {
        const iconPath = icons[props.icon] || icons['mdi-help-circle']
        if (!iconPath) {
          console.warn(`图标 ${props.icon} 未找到`)
          return null
        }

        const size = props.size || '24'
        return h(
          'svg',
          {
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            style: {
              display: 'inline-block',
              verticalAlign: 'middle',
            },
          },
          [h('path', { d: iconPath })],
        )
      }
    },
  }),
}
