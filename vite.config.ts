import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";


// https://vitejs.dev/config/



export default defineConfig(({ mode }) => {
  const outputDir = mode === 'zh' ? 'zh_dist' : 'en_dist';
  return {
    base: './',
    plugins: [

      vue(), vueJsx()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@vs": fileURLToPath(new URL("./src/views", import.meta.url)),
        "@cs": fileURLToPath(new URL("./src/components", import.meta.url))
      }
    },
    server: {
      proxy: {
        cors:'cors',
        '/server': {
          target: 'https://test.idea.lab.garlicfit.com',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/server/, '')
        },

        '/question-server': {
          target: 'https://test.idea.lab.garlicfit.com/api/question',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/question-server/, '')
        },
      },

    },
    build: {
      outDir: outputDir,
      target: ['es2016']
    },
    define: {
      VITE_APP_NAME: JSON.stringify('管理后台'),
      VITE_PROXY_PREFIX:  JSON.stringify('abc')
    }
  };
});

