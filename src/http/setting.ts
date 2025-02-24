import { useFetch } from "@/http/useFetch";

const BASE_URL = import.meta.env.DEV ? "/question-server" : "/api/question";
export const fetchSettingUpdate = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/updateSetting"
  });
};
export const fetchSettingGet = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/getSetting"
  });
};
export const fetchUpdatePassword = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/modifyPwd"
  });
};
