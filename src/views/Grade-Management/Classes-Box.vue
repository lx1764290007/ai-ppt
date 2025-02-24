<template>

  <div class="classes-form">
    <p class="classes-add--title">{{props.editItem?.id? $t('universal.edit'):$t('universal.add')}} {{$t('grade.class')}}</p>
    <el-form label-width="80" :model="formData" @submit.prevent.capture="onSubmit(formRef as FormInstance)"
             ref="formRef" size="large" label-position="right">
      <el-form-item prop="gradeId" :label="$t('grade.grade')" :rules="[{
          required: true,
          message: $t('universal.required')
          }]">
        <el-select class="default__select selector" style="border-radius: 10px" v-model="formData.gradeId" :placeholder="$t('grade.grade')">
          <el-option :value="item.id" :label="item.label" :key="item.id" v-for="item of gradeList">
            {{ item.label }}
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="classes" :label="$t('grade.class')" :rules="[{
          required: true,
          message: $t('universal.required')
          }]">
        <el-input class="default__input" v-model="formData.classes" :placeholder="$t('universal.placeholder')" />
      </el-form-item>
      <el-form-item label-width="90">
        <el-button :loading="loading" size="large" type="primary" class="default__button-primary" native-type="submit"
                   style="width: 120px;margin-top: 15px;">
          {{$t('universal.confirm')}}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance } from "element-plus";
import type { Classes } from "@/interface/Classes";
import { useUserInfo } from "@/stores/user";
import { fetchAddClasses, fetchClassesUpdate } from "@/http/grade";
import type { Http } from "@/interface/Http";

const userInfo = useUserInfo();
const formRef = ref<FormInstance>();
const formData = reactive<Partial<Classes.Data>>({
  classes: "",
  className: "",

  grade: "",
  gradeId: undefined,
  userId: userInfo.getUserInfo?.user?.id
});
const loading = ref(false);
const emit = defineEmits<{
  (ev: "close", gradeId?: number):void
}>();
const props = withDefaults(defineProps<{
  gradeList: Classes.Grade[]
  editItem?: Classes.Data
}>(), {

});

const onSubmit = (form: FormInstance) => {
  form.validate((result: boolean) => {
    if (result) {
      formData.grade = props.gradeList.find(it => it.id === formData.gradeId)?.label;
      formData.className = formData.grade + formData.classes;
      loading.value = true;

      if (props.editItem?.id) {
        fetchClassesUpdate(Object.assign({ classId: props.editItem.id }, formData)).then((res: Http.PPTListData<any>) => {
          if(res && res.code === 200) {
            emit("close", formData.gradeId);
          }
        }).finally(() => loading.value = false);
        return;
      }
      fetchAddClasses(formData as Classes.Data).then((res: Http.PPTListData<any>) => {
        if (res.code === 200) {
          emit("close", formData.gradeId);
        }
      }).finally(() => loading.value = false);
    }
  });
};

watch(()=>props.editItem, (value) => {
  if (value) {
    formData.gradeId = value.gradeId;
    formData.classes = value.classes;
    formData.className = value.className;
    formData.grade = value.grade;
  } else {
    formData.classes = "";
    formData.gradeId = undefined;
    formData.className = "";
    formData.grade = "";
  }
});
</script>
<style scoped>
.classes-add--title {
  padding: 10px 0;
  font-size: 20px;
  text-align: center;
  transform: translateY(-20px);
}
.selector:deep(.el-input__wrapper) {
  border-radius: 10px;
}
</style>