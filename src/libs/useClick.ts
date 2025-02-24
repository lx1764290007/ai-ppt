
export const useClick = ({click, dbClick, duration}:{click:(args?:any)=>void, dbClick:(args?:any)=>void, duration?:number}) => {
  let t:any;
  let down = false;
  return (...args:any[])=>{
    if(down) {
      dbClick && dbClick(...args);
      clearTimeout(t);
      down = false;
    } else {
      down = true;
      t = setTimeout(()=>{
        click && click(...args);
        down = false;
      }, duration || 200)
    }
  }
}