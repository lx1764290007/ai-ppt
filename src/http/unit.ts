import { useFetch } from "@/http/useFetch";

export const fetchUnit = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'get'
    },
    url: "/user/unit/list"
  })
}
export const fetchUnitSearch = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'get'
    },
    url: "/user/unit/search"
  })
}

export const fetchUnitAdd = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'post'
    },
    url: "/user/unit/add"
  })
}

export const fetchUnitUpdate = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'post'
    },
    url: "/user/unit/update"
  })
}
export const fetchUnitRemove = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'post'
    },
    url: "/user/unit/remove"
  })
}
