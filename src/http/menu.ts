import { useFetch } from "@/http/useFetch";

export const fetchMenu = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "get"
    },
    url: "menu"
  });
}
