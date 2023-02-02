import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    hmr: true,
    port: 3001,
    proxy: {
      '/api': {
        target: "http://localhost:8081/",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace('^/api', "/api"),
      }
    }
  },
  resolve: {
    //配置路径别名
    alias: {
      '@': path.resolve('src')
    }
  }

})
