<template>
  <div class="change-word-title">
    {{$t("valid.change_pwd")}}
  </div>
  <div class="change-word-wrapper" >
    <el-form :model="userParams" label-position="right"
             :label-width="locale.locale?.value === 'zh_hant'? 80:160"
             size="large" ref="formRef">
      <el-form-item :label="$t('valid.old_pwd')" prop="oldPwd"  :rules="[
        { required: true, message: $t('valid.required') }
      ]">
        <el-input show-password :placeholder="$t('universal.placeholder')"
                  class="default__input"
                  v-model="userParams.oldPwd"
                  autocomplete="off" />
      </el-form-item>
      <el-form-item :label="$t('valid.new_pwd')" prop="newPwd" :rules="[
        { required: true, message: $t('valid.required')},{min: 6, message:$t('valid.at_least_6')}, {validator: passwordValidation(t), trigger: ['change', 'blur','input'] },{
    max: 50,
    message: $t('valid.less_than_50')}
      ]">
        <el-input show-password
                  :placeholder="$t('universal.placeholder')"
                  class="default__input"
                  v-model="userParams.newPwd" autocomplete="off" />
      </el-form-item>
      <el-form-item :label="$t('valid.repeat_pwd')" prop="newAgain" :rules="[
        { required: true, message: $t('valid.required')}, {validator: validRepeatPassword, trigger: ['change', 'blur','input'] }
      ]">
        <el-input show-password :placeholder="$t('universal.placeholder')"
                  class="default__input"
                  v-model="userParams.newAgain" autocomplete="off" />
      </el-form-item>
    </el-form>

    <div class="dialog-footer">

      <el-button size="large"
                 class="default__button-active"
                 type="primary" @click="onDialogConfirm">
        {{$t('valid.confirm')}}
      </el-button>
    </div>
  </div>
<loading-component :show="show" />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import { passwordValidation } from "@/libs/register-rule";
import { useUserInfo } from "@/stores/user";
import { fetchModifyPwd } from "@/http/user";
import { useI18n } from "vue-i18n";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";

const formRef = ref<FormInstance>();

const {t} = useI18n();
const locale = useI18n();
const show = ref(false);

const emit = defineEmits<{
  (e: "finish", value: boolean): void
}>();
const userInfo = useUserInfo();

const userParams = reactive({
  oldPwd: undefined,
  newPwd: undefined,
  newAgain: undefined,
  username: userInfo.getUserInfo.user?.username
});

const onDialogConfirm = () => {
  console.log(formRef.value?.validate)
  formRef.value?.validate((valid: any ) => {
    if (valid) {
      show.value = true;
      fetchModifyPwd(userParams).then((res:any)=>{
        if (res && res.code === 200) {
          ElMessage({
            message: t('valid.success'),
            type: "success"
          });
          userParams.oldPwd = undefined;
          userParams.newPwd = undefined;
          userParams.newAgain = undefined;
          formRef.value!.resetFields();
        }
      }).finally(()=> show.value = false)
    }
  });
};
const validRepeatPassword = (field: any, value: string, callback: any) => {
  if (value !== userParams.newPwd) {
    callback(new Error(t('valid.password_error')));
  } else {
    callback();
  }
};
</script>
<style scoped>
.dialog-footer {
  text-align: right;
}

.change-word-wrapper {
  width: 30vw;
  padding: 20px;
}

.change-word-title {
  font-size: 22px;
  color: #222;
  font-weight: 600;
  padding: 0 20px 20px 20px;
}
</style>
