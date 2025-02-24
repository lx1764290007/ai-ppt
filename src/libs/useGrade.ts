import { fetchGradeList } from "@/http/grade";

import type { Http } from "@/interface/Http";
import type { Grade } from "@/interface/Grade";
import { useAuth } from "@/libs/useAuth";

export const getGradeList = async ():Promise<Grade.Item[]>=> {
  const gradeListJSON = window.localStorage.getItem("grade");
  try {
    if(gradeListJSON) {
      return Promise.resolve(JSON.parse(gradeListJSON));
    }
    const user = useAuth();

    if(user.info.user?.id){
      return new Promise((resolve)=>{
        fetchGradeList({
          userId: user.info.user.id,
          page: 1,
          pageSize: 100
        }).then((res:Http.Response<Grade.Item[]>)=>{
          if(res.code===200){
            resolve(res.data);
          }
          resolve([]);
        });
      })
    }
   return Promise.resolve([])
  } catch(e){
    return Promise.resolve([])
  }

}