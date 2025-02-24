type UserType = "SKILL_LEVEL" | "IDENTITY" | null
type RoleType = "ROOT" | "ALL_DATA" | "ME_DATA"
type EnumType = {
  name: string;
  id: number;
}
export type EnumSelection = {label:string,value:number}
type SexKey = "M" | "F"
type RoleFunctionItem = {
  code: string
  name: string
}

export interface RoleFunctions extends RoleFunctionItem {
  functions: RoleFunctionItem[];
}


export const useDataType = function(value: RoleType): string {
  const _ROLE = {
    ROOT: "管理员",
    ALL_DATA: "超级用户",
    ME_DATA: "普通用户"
  };
  return _ROLE[value];
};
export const useGender = function(key: SexKey): string {
  const _SEX = {
    M: "男",
    F: "女"
  };
  return _SEX[key];
};

export const useFunctions = function(value: RoleFunctions[]): any {
  const target = {};
  value.forEach(it => {
    Object.assign(target, {
      [it.code]: it.name
    });
    it.functions?.forEach(k => {
      Object.assign(target, {
        [k.code]: k.name
      });
    });
  });
  return target;
};

export const useEnumSelection = function(values: EnumType[],includes = false):EnumSelection[] {
  const value = [
    {
    label: "待定",
    value: -1
  },
    {
      label: "无",
      value: -2
    }
  ];
  const v = values.map(it=> {
    return {
      label: it.name,
      value: it.id
    }
  })
  if(includes){
    return [...v,...value]
  } else {
    return [...v]
  }

};
