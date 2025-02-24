

export declare namespace Menu {
  interface Data {
    name: string;
    icon?: string;
    path?: string;
    auth: string[];
    redirect?: string
    component?: ()=> Promise<any>
    children?: Menu.Data[]
    permissions?: number[]
    role?: string[],
    menu?: string
  }
}