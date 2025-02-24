import qs from "qs";
import { useResponse, useResponseError } from "@/http/useResponse";
import { useEnv } from "@/libs/useEnv";

import { useAuth } from "@/libs/useAuth";
import { getCurrentLanguage } from "@/libs/useLanguageEnum";


const BASE_URL = useEnv().baseUrl;

export const useFetch = function(data: RequestData): Promise<any> {
  const userInfo = useAuth();
  const { url } = data;
  return new Promise((resolve, reject) => {
    if (data.config?.method?.toUpperCase() === "GET" || data.config?.method === undefined) {
      const qsString = qs.stringify(data.data, { indices: true });
      fetch(`${data.baseURL || BASE_URL}${url}?${qsString}`, {
        //@ts-ignore
        credentials: "include", mode: "cors", headers: {
          token: userInfo.info?.token,
          'Language-Code': getCurrentLanguage()
        }
      }).then(res => {
        useResponse(res, resolve, reject);
      }).catch(err => {
        useResponseError(err, reject);
      });
    } else {
      const getContentType = ()=> data.config?.multipart? {}:{"Content-Type": "application/json;charset=utf-8"}
      fetch((data.baseURL || BASE_URL) + url || "", {
        body: data.config?.multipart ? data.data : JSON.stringify(data.data),
        headers: Object.assign({
          ...getContentType(),
          'Language-Code': getCurrentLanguage(),
          token: userInfo.info?.token
        },data.config?.headers),
        ...data.config,
        credentials: "include",
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache"
      } as RequestInit).then(res => {
        useResponse(res, resolve, reject);

      }).catch(err => {
        useResponseError(err, reject);
      });
    }
  });
};

