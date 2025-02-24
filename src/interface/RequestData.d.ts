declare interface RequestData {
  method?: "GET" | "POST",
  url?: string
  data?: any
  config?: RequestInit & {multipart?:boolean}
  json?: boolean
  baseURL?: string
}
