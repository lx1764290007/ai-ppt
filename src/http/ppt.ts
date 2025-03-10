import { useFetch } from "@/http/useFetch";


export const fetchPPTAndThemeList = async function(data?:{gradeId:number, userId:number, themeName?:string, pptName?:string, themeId: number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/getGradePPTList"
  });
};
//Language-Code
export const fetchGeneratePPTOutline = async function(data?:{gradeId:number, userId:number, themeName?:string, pptName?:string, themeId: number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/generatePPTOutline"
  });
};
export const fetchGeneratePPT2 = async function(data?:any): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/generatePPT"
  });
};

export const fetchAddTheme = async function(data: {
  themeName: string;
  gradeId: number;
  grade: number;
  userId: number | undefined
}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  });
};
export const fetchUpdateTheme = async function(data:{id:number, themeName:string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  });
};
//delTheme
export const fetchRemoveTheme = async function(data:{id:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  });
};

export const fetchAddPPT = async function(data:{themeId:number, userId:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewPPT"
  });
};
//updatePPT
export const fetchUpdatePPT = async function(data:{id:string, pptName:string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  });
};
export const fetchUpdatePPT2 = async function(data:{id:number, pptName:string, pptImg:string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/updatePPT"
  });
};
export const fetchRemovePPT = async function(data:{id:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/delPPT"
  });
};

export const fetchCreatePPT = async function(data:{pptId:number, query:string, type?:number, template?:number,classes: number, num:number, language: string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/getPPTContent"
  })
}
export const fetchTagList = async function(): Promise<any> {
  return await useFetch({

    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  })
}
export const fetchTagAddAndEdit = async function(data: {id?:number, lable: string}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys//sys/updateTheme"
  })
}
export const fetchTagUpdate = async function(data: {id:number, themeName: string, userId:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/updateTheme"
  })
}

export const fetchRemoveTag = async function(data: {id:number}): Promise<any> {
  return await useFetch({
    data,
    config: {
      method: "POST",
    },
    url: "/sys/saveNewTheme"
  })
}
export const fetchThemeList = async function():Promise<any> {
  return await useFetch({
    data: {
      page: 1,
      pageSize: 100
    },
    config: {
      method: "GET",
    },
    url: "/sys/getStencil"
  })
}
export const fetchCountries = async function():Promise<any> {
  return await useFetch({

    config: {
      method: "POST",
    },
    url: "/sys/getCountries"
  })
}
export const fetchDelTheme = async function(data:{id:number}): Promise<any> {
  return await useFetch({
      data,
      config: {
        method: "POST",
      },
      url: "/sys/delTheme"
    })

}