export declare namespace Http {
  interface RequestOptions {
    data: any;
    config?: Config;
  }

  interface Config {
    headers?: any;
    method?: "GET" | "POST";
    credentials?: "same-origin" | "include" | "omit";
    mode?: "cors" | "no-cors" | "same-origin";
    redirect?: "follow" | "manual";
    referrer?: "no-referrer" | "client" | String;
  }

  interface SearchConfig extends RequestOptions {
    data: {
      currentPage: Number;
      size: Number;
      isAsc?: Boolean;
    };
  }
  interface Response<T> {
    code: number
    data: T
    List: T
    msg?:string
    total?:number
  }
}
