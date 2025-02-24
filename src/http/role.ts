import { useFetch } from "@/http/useFetch";

export const fetchRole = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'get'
    },
    url: "/role/list"
  })
}
export const fetchRoleAdd = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'post'
    },
    url: "/role/add"
  })
}
export const fetchRoleSearch = async function(data? : any):Promise<any> {
  return await useFetch({
    data,
    config: {
      method: 'get'
    },
    url: "/role/search"
  })
}

export const fetchRoleFunction= async function(data?:any):Promise<any> {
  return await  useFetch({
    data,
    config: {
      method : 'get'
    },
    url: "/role/functions"
  })
}

export const fetchRoleUpdate = async function(data:any):Promise<any> {
  return await  useFetch({
    data,
    config: {
      method : 'post'
    },
    url: "/role/update"
  })
}
export const fetchRoleRemove = async function(data:any):Promise<any> {
  return await  useFetch({
    data,
    config: {
      method : 'post'
    },
    url: "/role/remove"
  })
}
