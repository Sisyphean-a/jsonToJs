import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { codeInspectorPlugin } from 'code-inspector-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isExtension = mode === 'extension'

  return {
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
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@/shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      },
    },
    build: {
      // 扩展模式的特殊配置
      ...(isExtension && {
        outDir: 'dist',
        assetsDir: 'assets',
        // 确保扩展模式下的CSP兼容性
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            // 扩展模式下使用更简单的文件名
            entryFileNames: 'assets/[name].js',
            chunkFileNames: 'assets/[name].js',
            assetFileNames: 'assets/[name].[ext]',
          },
        },
      }),
      // 非扩展模式的配置
      ...(!isExtension && {
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

              'babel-utils': ['@babel/parser', '@babel/types'],
              highlight: ['highlight.js'],
              jsonpath: ['jsonpath'],
              openai: ['openai'],
            },
          },
        },
      }),
      // 通用配置
      // 增加chunk大小警告限制
      chunkSizeWarningLimit: 500,
      // 启用CSS代码分割（扩展模式下禁用）
      cssCodeSplit: !isExtension,
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
  }
})
