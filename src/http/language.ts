import { useFetch } from "@/http/useFetch";

export const fetchUpdateLanguage = async function(data?: any) {
  return await useFetch({
    data,

    config: {
      method: "POST"
    },
    url: "/sys/updateLanguage"
  });
};