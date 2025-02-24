<template>

    <el-form :model="userParams" label-position="left" label-width="88" ref="formRef">
      <el-form-item label="旧密码" v-if="needOldPassword" prop="oldPassword" :rules="[
        { required: true, message: '此项必填' }
      ]">
        <el-input v-model="userParams.oldPassword" autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="password"  :rules="[
        { required: true, message: '此项必填'},{ validator: passwordValidation, trigger: ['change', 'blur','input'] }
      ]">
        <el-input v-model="userParams.password" autocomplete="off" />
      </el-form-item>
    </el-form>

      <div class="dialog-footer">
        <el-button @click="onDialogCancel" text>取消</el-button>
        <el-button type="primary" @click="onDialogConfirm">
          确认
        </el-button>
      </div>


</template>

<script setup lang="ts">
import { reactive,  ref } from "vue";
import type { FormInstance } from "element-plus";

import { passwordValidation } from "@/libs/register-rule";

const dialog = defineProps<
  {
    needOldPassword: boolean,
    info?:ItemType
  }>();
const formRef = ref<FormInstance>();
const emit = defineEmits<{
  (e: "finish", value:boolean): void
}>();

const userParams = reactive({
  oldPassword: undefined,
  password: undefined
});

const onDialogCancel = () => {

  emit("finish", false);
};
const onDialogConfirm = () => {
  formRef.value?.validate((valid: any) => {
    if (userParams.password && valid) {
      fetchUserModifyPasswordByRoot({
        userId: dialog.info?.id,
        ...userParams
      }).then(()=>{
        emit("finish", true);
      }).finally(()=>{
        formRef.value?.resetFields()
      })

    }
  });
};
</script>
<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
