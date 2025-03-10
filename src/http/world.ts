import { useFetch } from "@/http/useFetch";


/**
 * 創建word文檔
 * @param data
 */
export const fetchWorldListAdd = async function(data?: { subjectId:number, userId:number, gradeIds?:string}) {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/saveNewWord"
  });
};
/**
 * world 文檔上傳
 * @param data
 */
export const fetchWorldUpload = async function(data?: FormData) {
  return await useFetch({
    data,
    json: true,
    config: {
      method: "POST",
      multipart: true
    },
    url: "/sys/uploadTextFile"
  });
};
/**
 * 生成world文檔
 * @param data
 */
export const fetchWorldGenerate = async function(data?: any) {
  return await useFetch({
    data,
    config: {
      method: "POST"
    },
    url: "/sys/generateReading"
  });
};

