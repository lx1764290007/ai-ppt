import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "@/router/route";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import i18n from "@/i18n";
import "@/global.css";
import useClickOutside from "@/libs/useClickOutside";

const sw = new URL("/public/sw.js", import.meta.url).href;
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
window.addEventListener('load', () => {
  console.log('load',sw)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(sw).then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  }
});
app.use(ElementPlus);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.directive('click-outside', useClickOutside.directives.clickOutside);

app.mount("#app");
