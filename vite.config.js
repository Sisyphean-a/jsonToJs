import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    codeInspectorPlugin({
      bundler: 'vite',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // 启用代码分割
    rollupOptions: {
      external: [
        // 将node.js模块标记为外部依赖，避免在浏览器端打包
        'jsdom',
        'fs',
        'path',
        'vm',
        'events',
        'url',
        'util',
        'http',
        'https',
        'stream',
        'zlib',
        'crypto',
        'net',
        'tls',
        'assert',
        'child_process',
        'os',
      ],
      output: {
        manualChunks: {
          // 将大型库分离成独立的chunk
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          vuetify: ['vuetify'],
          codemirror: [
            'codemirror',
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/commands',
            '@codemirror/lang-javascript',
            '@codemirror/theme-one-dark',
            '@lezer/highlight',
          ],
          'babel-utils': ['@babel/parser', '@babel/types'],
          highlight: ['highlight.js'],
          jsonpath: ['jsonpath'],
          openai: ['openai'],
        },
      },
    },
    // 增加chunk大小警告限制
    chunkSizeWarningLimit: 500,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
  },
  // 启用依赖预构建优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'vuetify'],
    // 排除服务器端依赖
    exclude: ['jsdom'],
  },
  // 开发服务器配置
  server: {
    // 启用依赖预构建
    force: false,
  },
})
