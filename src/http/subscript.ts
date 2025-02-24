
import { useFetch } from "@/http/useFetch";
//查询订阅套餐列表


export const fetchRechargeList = async function(): Promise<any> {
  return await useFetch({
    config: {
      method: "GET",
    },
    url: "/sys/rechargeAttribute"
  });
};

export const fetchMemberInfo = async function(data): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "GET"
    },
    url: "/sys/getUserMember"
  })
}
export const fetchDictList = async function(data?:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/findDictList"
  })
}
export const fetchDictAddOrUpdate = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/updatePay"
  })
}
export const fetchDelPay = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/delPay"
  })
}
