//正整数正则
const regex = /^[1-9]\d*$/;
const positiveRegex = /^(0|[1-9]\d*)(\.\d+)?$/;
const regex100 =  /^(100|[1-9]?[0-9])$/;

export const isPositiveInteger = (t:any)=> {
  return (rule: any, value: any, callback: any)=>{
    if(regex100.test(value)){
      const _value = parseInt(value);
      if(isNaN(_value)){
        callback(new Error(t("setting.invalidNumber")));
        return
      } else if(_value < 1){
        callback(new Error(t("setting.minNumber")));
        return
      } else if(_value > 100){
        callback(new Error(t("setting.maxNumber")));
        return
      }
      callback();
    } else {
      callback(new Error(t("setting.invalidNumber")));
    }
  }

};

export const isNumber= (t:any)=>{
  return (rule: any, value: any, callback: any)=>{
    if(positiveRegex.test(value)){
      const _value = parseInt(value);
      if(isNaN(_value)){
        callback(new Error(t("setting.invalidNumber")));
        return
      } else if(_value < 1){
        callback(new Error(t("setting.maxNumber")));
        return
      } else if(_value > 100){
        callback(new Error(t("setting.maxNumber")));
        return
      }
      callback();

    } else {
      callback(new Error(t("setting.invalidNumber")));
    }
  }

}