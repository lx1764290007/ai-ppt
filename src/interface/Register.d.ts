
type Sex  = 0|1|number;
export declare namespace Register {
  interface Form {

    password: string
    repeatPassword: string

    sex: Sex
    username: string

    nickname: string
    institution?:string
  }
}