/**
 * 此项必填 - This item is required
 * 账号不能存在特殊字符 - Account cannot contain special characters
 * 密码不能存在_和?之外的特殊字符 - Password cannot contain special characters except _ and ?
 * 长度需要不小于6 - Length must be at least 6
 * 长度需要小于50 - Length must be less than 50
 * 未填写账号 - Account not filled in
 * 未输入密码 - Password not entered
 */

const zh_hant = {
  change_pwd: "修改密碼",
  old_pwd: "舊密碼",
  new_pwd: "新密碼",
  repeat_pwd: "重復密碼",
  confirm: "確認修改",
  required: "此項必填",
  account_cannot_contain_special_characters: "賬號不能存在特殊字符",
  password_cannot_contain_special_characters_except: "密碼不能存在_和?以外的特殊字符",
  at_least_6: "長度需要不小於6",
  less_than_50: "長度需要小於50",
  account_not_filled_in: "賬號未填寫",
  password_not_entered: "密碼未輸入",
  success: "已修改",
  password_error: "重複密碼不匹配",
  following_way: "您可以通過以下方式獲得我們的支持",
  mail: "信箱",
  phone_number: "電話"
}
const en = {
  change_pwd: "Change Password",
  old_pwd: "Old Password",
  new_pwd: "New Password",
  repeat_pwd: "Repeat Password",
  confirm: "Confirm Change",
  password_error: "Duplicate passwords do not match",
  required: "This item is required",
  account_cannot_contain_special_characters: "Account cannot contain special characters",
  password_cannot_contain_special_characters_except: "Password cannot contain special characters except _ and ?",
  at_least_6: "Length must be at least 6",
  less_than_50: "Length must be less than 50",
  account_not_filled_in: "Account not filled in",
  password_not_entered: "Password not entered",
  success: "Successfully",
  following_way: "You can get our support through the following ways",
  mail: "Mail",
  phone_number: "Telephone",
}

export default {en, zh_hant}