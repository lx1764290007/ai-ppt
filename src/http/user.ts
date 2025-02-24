import { useFetch } from "@/http/useFetch";
import type { User } from "@/interface/User";


export const fetchLogin = async function(data: Pick<User.UserInfo & {
  password: string
}, "password" | "username">): Promise<User.Data> {
  return await useFetch({
    data,
    config: {
      method: "post"
    },
    url: "/sys/login"
  });
};
export const fetchLogout = async function(): Promise<any> {
  return await useFetch({

    config: {
      method: "post"
    },
    url: "/login/cannel"
  });
};

export const fetchRegister = async function(data: any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "post",
      multipart: true
    },
    url: "/sys/registerUser"
  });
};
export const fetchModifyPwd = async function(data: any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "post"
    },
    url: "/sys/modifyPwd"
  });
};

export const fetchFreeTrial = async function(data: any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "get",
    },
    url: "/sys/freeTrial"
  });
};

export const fetchUserInfo = async function(data: {userId: number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "GET"
    },
    url: "/sys/getUserInfo"
  });
}

export const fetchUserList = async function(data: any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/findUserList"
  });
}
export const fetchUserUpdate = async function(data: any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
      multipart: true
    },
    url: "/sys/updateUser"
  });
}
export const fetchUserDel = async function(data: Pick<User.UserInfo, "id">): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/delUser"
  });
}
