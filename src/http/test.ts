import { useFetch } from "@/http/useFetch";


export const testApi = function(data: RequestData): Promise<any> {
  return useFetch({
    ...data,
    method: "GET",
    url: "http://192.168.0.124:3301/platform/user/list"
  });
};
