
import type { Privileges, User } from "@/interface/User";

class UseAuth {
  public KEY: string = "personal-info";
  private _INFO: string | null = window.localStorage.getItem(this.KEY);
  get info(): User.Data {
    return JSON.parse(this._INFO || "{}");
  }
  set info(value: User.Data) {
    window.localStorage.setItem(this.KEY, JSON.stringify(value));
  }
  removeData(){
    window.localStorage.removeItem(this.KEY);
  }
  get privileges(){
    return this.info.privileges
  }
  set privileges(value:Privileges[]){
    const originData = this.info;
    originData.privileges = value;
    this.info = originData;
  }
  setUserData(_user: User.UserInfo) {
    const data = this.info;
    if(data) {
      this.info = {
        ...data,
        user: _user
      }
    }
  }
  logout(): void {
    window.localStorage.removeItem(this.KEY);
    window.localStorage.removeItem("ai-editor");
  }
}
export const useAuth = function() {
  return new UseAuth();
};
class UseController {
  // private _FUNCTIONS = useAuth().info.functions || {};
  // hasAuth(value?: string): boolean {
  //   if (!value) return false
  //   const keys:string[] = Object.keys(this._FUNCTIONS);
  //   return keys.includes(value) || value === 'any'
  //
  // }
}

export const useController = function() {
  return new UseController();
};
