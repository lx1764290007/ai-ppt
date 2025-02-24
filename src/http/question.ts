import { useFetch } from "@/http/useFetch";

//题目列表
const BASE_URL = import.meta.env.DEV ? "/question-server" : "/api/question";
export const fetchQuestionList = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/getSubjectQuestionList"
  });
};
export const fetchQuestionUpdate = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/updateQuestion"
  });
};
//标签列表
export const fetchTagList = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url:  "/sys/generateAIQuestions"
  });
};

export const fetchQuestionGenerate = async function(data?: any) {
  return await useFetch({
    data,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/generateAIQuestions"
  });
};
export const fetchQuestionAdd = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/createQuestion"
  });
};
export const fetchFileUpload = async function(data: FormData) {
  if (data) {
    const supportedExtensions = ["jpg", "jpeg", "png", "webp", "bmp", "svg", "blob"];
    //@ts-ignore
    const file: File | null = data.get("file");
    if (file) {
      // 提取文件名
      const fileName = file.name;
      if (fileName) {
        // 提取文件扩展名
        const extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

        if (!supportedExtensions.includes(extension)) {
          return Promise.reject("setting.invalidFile");
        }
      }
    }
  }
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST",
      multipart: true
    },
    url: "/sys/uploadFile"
  });
};
//AI 图片

export const fetchAIPhoto = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/searchImages"
  });
};
export const fetchUpdateQuestionSubjectAndType = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url: "/sys/updateQuestionSubjectAndTpye"
  });
};
export const fetchDownloadRemotePhoto = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url:  "/sys/uploadImages"
  });
};
export const fetchDeleteItem = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url:  "/sys/deleteQuestion"
  });
};
export const fetchSearchTopic = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url:  "/sys/getOrCreateSubject"
  });
};
export const fetchCreateTopicByName = async function(data?: any) {
  return await useFetch({
    data,
    json: true,
    baseURL: BASE_URL,
    config: {
      method: "POST"
    },
    url:   "/sys/searchSubjectType"
  });
};

