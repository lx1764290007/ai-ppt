import { useFetch } from "@/http/useFetch";

const BASE_URL = import.meta.env.DEV ? "/question-server" : "/api/question";

export const fetchGameList= async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    json: true,
    config: {
      method: "POST"
    },
    url: "/sys/getGameList"
  });
};