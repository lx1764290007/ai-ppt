const spStr:RegExp =  /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
const regex = /^[A-Za-z0-9_?]+$/;

const phoneNum:RegExp = /^1[34578]\d{9}$/
export const accountValidation = (t:any) => {
  return (rule: any, value: any, callback: any)=> {
    if (spStr.test(value)) {
      callback();
    } else {
      callback(new Error(t("valid.account_cannot_contain_special_characters")));
    }
  }
};

export const passwordValidation = (t:any) => {
  return (rule: any, value: any, callback: any)=>{
    if (!regex.test(value)) {
      callback(new Error(t("valid.password_cannot_contain_special_characters_except")));
    } else {
      callback();
    }
  }
};
export const passwordValidationWithUpdate = (t:any) => {
  return (rule: any, value: any, callback: any) => {
    if (value && !regex.test(value)) {
      callback(new Error(t("valid.password_cannot_contain_special_characters_except")));
    } else {
      callback();
    }
  }
};

export const phoneNumberValidation = (rule: any, value: any, callback: any) => {
  if (value && value.length !== 11) {
    callback(new Error("手机号格式错误"));
  } else if (!(phoneNum.test(value)) ) {
    callback(new Error("手机号格式错误"));
  } else {
    callback();
  }
};
export const phoneNumberValidationForPre = (rule: any, value: any, callback: any) => {
  if (value && value.length !== 11) {
    callback(new Error("手机号格式错误"));
  } else if (!(phoneNum.test(value)) ) {
    callback( );
  } else {
    callback();
  }
};
