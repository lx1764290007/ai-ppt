import {useEnv} from "./useEnv";
import {useAuth} from "@/libs/useAuth";

class UseSocket {
  private socket;

  constructor() {

    const id = useAuth().info.id,env = useEnv();
    if(!id) return
    this.socket = new WebSocket(`${env.socketUrl}/${id}`);
    this.socket.onopen = this.onOpen;
    this.socket.onmessage = this.onMessage(this);
  }
  onOpen(this:WebSocket) {
    console.log('socket success')
    return null
  }

  onMessage(_this:any){
    return function(this:WebSocket, ev: MessageEvent<any>){
      _this.callback(JSON.parse(ev.data||"{}").handlerFalseNum)
    }
  }
  callback(n:number|string){}
  set onReceive(fn:(n:number|string)=>void){
    this.callback = fn;
  }
  send(){
    this.socket?.send('1')
  }
}

export const useSocket = function(){
  return new UseSocket();
}
