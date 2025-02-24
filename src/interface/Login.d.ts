
import  type {User} from "./User";

type Code = 200|500|403|501;

export declare namespace Login {
  interface LoginData {
    readonly code: Code
    readonly data: User.Data
    readonly msg: string
  }

}