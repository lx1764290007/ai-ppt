import { useFetch } from "@/http/useFetch";
import type { Classes } from "@/interface/Classes";


export const fetchGradeAdd = async function(data:{
  institutionId: number
  grade: string
  className: number
}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/studentWork/registeredClassNew"
  });
};
export const fetchGradeList = async function(data?:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "post",
    },
    url: "/sys/getGrade"
  });
};
export const fetchUpdateGrade = async function(data?:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/updateGrade"
  });
};

export const fetchRemoveGrade = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/delGrade"
  });
};


export const fetchAddClasses = async function(data:Classes.Data): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/createClass"
  });
};
export const fetchClasses = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/findClassInfoList"
  });
};

export const fetchClassesUpdate = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/updateClass"
  });
};
export const fetchClassesDel = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "get",
    },
    url: "/sys/delClass"
  });
};
export const fetchClassesTheme = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/getThemeLable"
  });
};
export const fetchClassesThemeUpdate = async function(data:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/updateThemeLable"
  });
};

