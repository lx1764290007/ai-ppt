const KEY = "#locale";

export const getLanguageFromLocal = ():string => import.meta.env.VITE_BUILD_LANGUAGE || 'zh_hant';
export const setLanguageToLocal = (language: string) => window.localStorage.setItem(KEY, language);
