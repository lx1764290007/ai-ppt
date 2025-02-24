import { USER_INFO_KEY } from "@/libs/KEY";
import type { User } from "@/interface/User";


export function useUserInfo(): { getKey: () => string, value: User.Data } {

  const targets: any = {
    getKey() {
      return USER_INFO_KEY;
    },
    value: {}

  };
  return new Proxy(targets, {
    set(target, p, value: User.Data) {
      if (p !== "value") return false;
      target[p] = value;
      window.localStorage.setItem(USER_INFO_KEY, JSON.stringify(value));
      return true;
    },
    get(target, key) {
      const userInfo = target[key] || {};
      if (Object.keys(userInfo).length > 0) return userInfo;
      else {
        const userInfoFromStorage = window.localStorage.getItem(USER_INFO_KEY);
        if (userInfoFromStorage) {
          return JSON.parse(userInfoFromStorage);
        }
        return null;
      }
    }
  });
}