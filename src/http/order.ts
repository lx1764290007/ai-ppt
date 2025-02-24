import { useFetch } from "@/http/useFetch";

export const fetchOrderCreate = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/stripe/order/create"
  });
};
export const fetchPayCreate = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "GET",
    },
    url: "/stripe/order/pay"
  });
};
export const fetchOrderStatus = async function(data:{orderId: string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "GET",
    },
    url: "/stripe/order/getOrder"
  });
};
export const fetchOrderList = async function(data:{userId: number,page:number,pageSize:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/findOrderList"
  });
};
export const fetchOrderRefund= async function(data:{amount: number,sessionId:string,chargeId?:number,userId:number, password:string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/stripe/order/refund"
  });
};
