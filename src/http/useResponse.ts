// @ts-ignore
import pub from "@/libs/eventBus";
import router from "@/router/route";
import { NET_ERROR_TIPS } from "@/libs/useKeys";
import * as i18n from "@/i18n/source";
import { getLanguageFromLocal } from "@/i18n/util";
import { useUserInfo } from "@/stores/user";
import { useAuth } from "@/libs/useAuth";


export const useResponse = (res: any, resolve: (T: any) => void, reject: (T: any) => void) => {

  const locale = getLanguageFromLocal() as 'zh_hant'|'en';
  if (res.status === 304) {
    router.push({
      path: "/login"
    });
    const userInfo = useUserInfo();
    const user = useAuth();
    user.removeData();
    useResponseError(res,reject);
    userInfo.setUserInfo('roleId',"");
    userInfo.setUserInfo('nickname',"");

    reject(res.message);
  } else if (res.status === 412) {
    router.push({
      path: "/unknown"
    });
    useResponseError(res, reject);
  } else if (res.status === 403){
    router.push({
      path: "/403"
    });
    reject(res.message);
  } else if(res.status === 302) {
    reject(res.message);
    useResponseError(res, reject);
  } else if(res.status === 500){

    reject(res.message);
    useResponseError(res, reject);
  }else {
    if (!res.ok) {
      reject(res.message);
      useResponseError(res, reject);
      return
    } else if (res.status === 200) {
      res.json().then((result: any) => {
        if(result && result.code === 200) {
          resolve(result)
          return
        } else if(result && result.code === 304) {
          const userInfo = useUserInfo();
          const user = useAuth();
          router.push({
            path: "/login"
          });
          user.removeData();
          userInfo.setUserInfo('roleId',"");
          userInfo.setUserInfo('nickname',"");
          useResponseError(result.msg,reject);
        } else {
          reject(result);
          useResponseError(result.msg, reject);
        }
      }).catch((err:any)=> {
        reject(err.message);
        useResponseError(res, reject);
      })
    } else {
      pub.public(NET_ERROR_TIPS, res.message || i18n[locale].universal.error)
      reject(res.message)
    };
  }
};

export const useResponseError = (res: any, reject?: any) => {
  let message = "";
  const locale = getLanguageFromLocal() as 'zh_hant'|'en';
  try {
    res.json().then((result: any) => {
      message = result?.message;
      pub.public(NET_ERROR_TIPS, message || res?.msg || i18n[locale].universal.error);
    }).catch(function(e:Error){
      pub.public(NET_ERROR_TIPS,   i18n[locale].universal.error);
    })
  } catch (e) {
    pub.public(NET_ERROR_TIPS, res?.message || res?.statusText || res || i18n[locale].universal.error);
  }
  reject && reject();
};


