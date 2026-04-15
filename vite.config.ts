import * as path from 'path'
import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      input: {
        options: path.resolve('options.html'),
        popup: path.resolve('popup.html'),
        sidepanel: path.resolve('sidepanel.html'),
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
  plugins: [crx({ manifest })],
  legacy: {
    skipWebSocketTokenCheck: true,
  },
  server: {
    headers: {
      // 开发环境允许所有源跨域（生产环境需限制为具体域名）
      'Access-Control-Allow-Origin': '*',
      // 允许携带 Cookie/认证信息（若需要）
      'Access-Control-Allow-Credentials': 'true',
      // 允许的请求头
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    cors: {
      origin: [
        /chrome-extension:\/\//,
      ],
    },
  }
})
