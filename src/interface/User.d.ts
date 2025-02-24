export type Privileges = {id:number, remark:string};
export namespace User {
  interface UserInfo {
    nickname: string
    roleId: string
    sex?: number
    uequipment?:string
    institution?: string
    username: string
    id: number
    remark?: string
    member?: string
    members?: any
    num?:any
    wequipment?:string
    lastLoginTime?:string
    privileges?: Privileges[]
    expirationTime?:number
    createTime?:string
    userType?: number
  }
  interface Data {
    privileges: {id:number, remark: string}[]
    token?: string;
    user: UserInfo
  }
}