import { defineStore } from "pinia";
import { getLanguageFromLocal, setLanguageToLocal } from "@/i18n/util";

export const useLanguageStore = defineStore("_language", {
  state: () => ({
    locale: getLanguageFromLocal()
  }),
  actions: {
    changeLanguage(value: string) {
      this.locale = value;
      setLanguageToLocal(value);
    }
  }
});