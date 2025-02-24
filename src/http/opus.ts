import { useFetch } from "@/http/useFetch";

//查询学生作品 /studentWork/findUserList
interface StudentOpusParams {
  page:number
  pageSize:number
  userId:number
  name?:string
  gradeId?:number
  classesId?: number
}
export const fetchStudentsOpus = async function(data:StudentOpusParams): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/findWorkList"
  });
};
export const fetchGenerateEvaluation = async function(data:{image:string, text: string}): Promise<any> {
  return await useFetch({
    data: {
      text: data.text,
      image:data.image
    },
    config: {
      method: "POST",
    },
    url: "/sys/openAIGenerateEvaluation"
  });
};
export const fetchUpdateEvaluation = async function(data:any): Promise<any> {
  return await useFetch({
    data ,
    config: {
      method: "POST",
    },
    url: "/sys/updateWork"
  });
};
export const fetchDelEvaluation = async function(data: {id:number}): Promise<any> {
  return await useFetch({
    data ,
    config: {
      method: "POST",
    },
    url: "/sys/delWork"
  });
};

//自由创作列表
export const fetchFreeCreationList = async function(data: {
  userId: number
  name?: string
  page: number
  pageSize: number
}): Promise<any> {
  return await useFetch({
    data ,
    config: {
      method: "POST",
    },
    url: "/sys/findFreeCreation"
  });
};
//主题创作列表
export const fetchThemeCreationList = async function(data: {
  userId: number
  name?: string
  page: number
  pageSize: number
}): Promise<any> {
  return await useFetch({
    data ,
    config: {
      method: "POST",
    },
    url: "/sys/findThemeCreation"
  });
};
