import { USER_INFO_KEY } from "@/libs/KEY";

export interface LanguageEnum {
  label: string
  value: string
}
export const useLanguageEnum = ():LanguageEnum[] => {
  return [
    {
      label: "中文繁體",
      value: "ZH-HANT"
    },
    {
      label: "中文简体",
      value: "ZH-CN"
    },
    {
      label: "English",
      value: "EN"
    }
  ]
}
export const useLanguageIdeaLab= ():LanguageEnum[] => {
  return [
    {
      label: "中文繁體",
      value: "zh_hant"
    },
    // {
    //   label: "中文简体",
    //   value: "zh"
    // },
    {
      label: "English",
      value: "en"
    }
  ]
}
export const transformArtlabLanguageToIquiz = (value:string)=>{
  if(value === 'ZH-CN') return 'zh';
  if(value === 'ZH-HANT') return 'zh_hant';
  if(value === 'EN') return 'en';
  return value;
}
export const transformIquizLanguageToArtlab = (value:string)=>{
  if(value === 'zh') return 'ZH-CN';
  if(value === 'zh_hant') return 'ZH-HANT';
  if(value === 'en') return 'EN';
  return value;
}
function isSimplifiedChinese() {
  const language = navigator.language;
  return language === 'zh-CN';
}
function isTraditionalChinese() {
  const language = navigator.language;
  return language === 'zh-TW' || language === 'zh-HK';
}
function isEnglish() {
  const language = navigator.language;
  return language.startsWith('en');
}

export const useDefaultLanguage = ()=> {
  return isSimplifiedChinese()? "zh_hant" : isTraditionalChinese()? "zh_hant" : isEnglish()? "en" : "zh_hant";
}

export const getCurrentLanguage = ()=> {
  const locale = window.localStorage.getItem("locale");
  if(locale){
    return locale;
  }
  return  transformIquizLanguageToArtlab(useDefaultLanguage())
}