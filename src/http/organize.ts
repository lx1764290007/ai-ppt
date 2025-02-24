import { useFetch } from "@/http/useFetch";

export const fetchOrganize = async function(): Promise<any> {
  return await useFetch({

    config: {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }

    },
    url: "/account/getInstitution"
  });
};