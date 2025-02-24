import { defineStore } from "pinia";
import { computed, reactive, ref } from "vue";
import { useAuth } from "@/libs/useAuth";
import type {User} from "@/interface/User";

// 第一个参数是应用程序中 store 的唯一 id
export const useUserInfo = defineStore("user", ()=>{
  const user = useAuth();
  const userInfo = reactive(user.info);

  const token = ref(user.info.token);
  const getUserInfo = computed(()=> userInfo);
  const organize = ref();

  const setUserInfo = (key:Partial<keyof User.UserInfo>, value:any)=> {

    if(userInfo){
      if(!userInfo.user) userInfo.user = {} as User.UserInfo;
      //@ts-ignore
      userInfo.user[key] = value;
    }
  }
  const setPrivileges = (value:{id:number, remark: string}[])=> {
    userInfo.privileges = value;
  }
  return {
    getUserInfo, setUserInfo, organize, token,setPrivileges
  }
});


export const useUserInfoStore = defineStore("loginUser", () => {
  const _user = useUserInfo();
  //const userInfo = ref(_user.value);
  const setUserInfo = (user:User.Data)=> {
   // userInfo.value = user;
   //_user.value = user;
  }

  return {setUserInfo }
});