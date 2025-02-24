import { useFetch } from "@/http/useFetch";

const BASE_URL = import.meta.env.DEV ? "/question-server" : "/api/question";
export const fetchAnalysis = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    json: true,
    config: {
      method: "POST"
    },
    url: "/sys/dataAnalysis"
  });
};
export const fetchAnalysisQuestion = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    json: true,
    config: {
      method: "POST"
    },
    url: "/sys/getQuestionListByTypeId"
  });
};

