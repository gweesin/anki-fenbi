import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    outDir: 'public', // 直接输出到 public 根目录
    lib: {
      entry: path.resolve(__dirname, 'src/inject/index.ts'),
      formats: ['iife'],
      name: 'InjectScript',
      fileName: () => 'inject-bundle.js', // 固定文件名
    },
    emptyOutDir: false, // 关键：不要清空 public，否则会删掉你的图标等资源
  },
})
