import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import * as prettier from 'prettier/standalone'
import * as prettierPluginBabel from 'prettier/parser-babel'
import * as prettierPluginEstree from 'prettier/plugins/estree'
import { javascript } from '@codemirror/lang-javascript'

// 自定义浅色主题
export const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#fafafa',
    color: '#333333',
  },
  '.cm-content': {
    caretColor: '#333333',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#333333',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#e6f3ff',
  },
  '.cm-line': {
    '&::selection, & > span::selection, & > span > span::selection': {
      backgroundColor: '#e6f3ff',
    },
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#999999',
    borderRight: '1px solid #e0e0e0',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f0f0f0',
    color: '#333333',
  },
  '.cm-activeLine': {
    backgroundColor: '#f5f5f5',
  },
  '.cm-keyword': { color: '#7f0055', fontWeight: 'bold' },
  '.cm-atom': { color: '#219' },
  '.cm-number': { color: '#164' },
  '.cm-def': { color: '#00f' },
  '.cm-variable': { color: '#333' },
  '.cm-variable-2': { color: '#05a' },
  '.cm-variable-3': { color: '#085' },
  '.cm-property': { color: '#333' },
  '.cm-operator': { color: '#333' },
  '.cm-comment': { color: '#a50' },
  '.cm-string': { color: '#a11' },
  '.cm-string-2': { color: '#f50' },
  '.cm-meta': { color: '#555' },
  '.cm-qualifier': { color: '#555' },
  '.cm-builtin': { color: '#30a' },
  '.cm-bracket': { color: '#997' },
  '.cm-tag': { color: '#170' },
  '.cm-attribute': { color: '#00c' },
  '.cm-hr': { color: '#999' },
  '.cm-link': { color: '#00c' },
  '.cm-error': { color: '#f00' },
})

// 定义语法高亮样式
const jsHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#7f0055', fontWeight: 'bold' },
  { tag: tags.atom, color: '#219' },
  { tag: tags.number, color: '#164' },
  { tag: tags.definition(tags.variableName), color: '#00f' },
  { tag: tags.variableName, color: '#333' },
  { tag: tags.propertyName, color: '#333' },
  { tag: tags.operator, color: '#333' },
  { tag: tags.comment, color: '#a50', fontStyle: 'italic' },
  { tag: tags.string, color: '#a11' },
  { tag: tags.meta, color: '#555' },
  { tag: tags.function(tags.variableName), color: '#7f0055' },
  { tag: tags.function(tags.propertyName), color: '#7f0055' },
  { tag: tags.punctuation, color: '#997' },
  { tag: tags.className, color: '#085' },
  { tag: tags.modifier, color: '#085' },
  { tag: tags.bool, color: '#219' },
  { tag: tags.regexp, color: '#f50' },
  { tag: tags.null, color: '#219' },
  { tag: tags.invalid, color: '#f00' },
])

// 创建编辑器扩展
export const createEditorExtensions = (readonly = false) => {
  const extensions = [javascript(), lightTheme, syntaxHighlighting(jsHighlightStyle)]

  if (readonly) {
    extensions.push(EditorView.editable.of(false))
  }

  return extensions
}

// 代码格式化配置
export const prettierConfig = {
  parser: 'babel',
  plugins: [prettierPluginBabel, prettierPluginEstree],
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 80,
  trailingComma: 'none',
  bracketSpacing: true,
  arrowParens: 'avoid',
}

// 格式化代码
export const formatCode = async (code) => {
  return await prettier.format(code, prettierConfig)
}
