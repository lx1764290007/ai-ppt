import { createI18n } from "vue-i18n";
import {zh_hant, en} from "@/i18n/source";

import { useDefaultLanguage } from "@/libs/useLanguageEnum";


const messages = {
  zh_hant,
  en
}
const i18n = createI18n({
  locale: useDefaultLanguage(), // 设置当前语言类型
  legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
  globalInjection: true, // 全局注册$t方法
  messages
})

export default i18n;

