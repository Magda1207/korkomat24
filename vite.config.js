import { defineConfig } from 'vite'
import postcss from './postcss.config.js'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  css: {
    postcss,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~.+/,
        replacement: (val) => {
          return val.replace(/^~/, "");
        },
      },
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  } 
})
