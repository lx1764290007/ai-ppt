import { useFetch } from "@/http/useFetch";
const BASE_URL = import.meta.env.DEV ? "/question-server" : "/api/question";
export const fetchTopicList = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/getSubjectList"
  });
};

export const fetchTopicAdd = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/createSubject"
  });
};

//复制
export const fetchTopicCopy = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/copySubject"
  });
};
//删除
export const fetchTopicDelete = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/deleteSubject"
  });
};
//更新
export const fetchTopicUpdate = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/updateSubject"
  });
};

export const fetchTopicTypeList = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/getSubjectTypeList"
  });
};
export const fetchTopicTypeAdd = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/createSubjectType"
  });
};
export const fetchTopicTypeUpdate = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/updateSubjectType"
  });
};
export const fetchTopicTypeDelete = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/deleteSubjectType"
  });
};
export const fetchTopicTypeCopy = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/copySubjectType"
  });
};
export const fetchTopicTypeSearch = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/searchSubjectType"
  });
};
export const fetchAreas = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/getCountries"
  });
};
