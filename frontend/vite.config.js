import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,      // 允许外部访问
    port: 3001,
    allowedHosts: [
      'coral.letushelpyou.online',
      'localhost',
      '127.0.0.1',
      // 或者用正则放开整个域：
      // /\.letushelpyou\.online$/
    ],
    // （可选，开发时 HMR 经隧道更稳）：
    hmr: { clientPort: 443 }
  },
})
