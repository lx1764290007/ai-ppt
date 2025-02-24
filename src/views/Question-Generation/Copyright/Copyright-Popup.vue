

<template>
 <popup-component v-model:modal-value="show">
   <div class="copyright-collect__wrapper" :style="{width: locale==='EN'? '460px':'420px'}">
     <div class="copyright-collect-header">
       <span class="copyright-collect-title">
         {{$t('statement.title')}}
       </span>
       <el-icon class="copyright-collect-close" @click="onClose">
         <Close />
       </el-icon>
     </div>
     <div class="form-wrapper">
       <el-form :model="formData" size="large" :label-width="locale==='EN'? 160:80" label-position="right" @submit.prevent="onSubmit">
         <el-form-item :label="$t('statement.source')" prop="origin">
           <el-input :placeholder="$t('statement.input')" maxlength="300"  v-model="formData.origin" />
         </el-form-item>
         <el-form-item :label="$t('statement.information')" prop="copyright">
           <el-input :placeholder="$t('statement.input')" maxlength="500" style="text-align: left" type="textarea" :rows="{min:2,max:3}" v-model="formData.copyright" />
         </el-form-item>
         <el-form-item label-width="0" style="padding-top: 20px">
           <el-button class="buttons-primary" style="margin: 0 auto" native-type="submit">
             {{$t('statement.confirm')}}
           </el-button>
         </el-form-item>
       </el-form>
     </div>
   </div>
 </popup-component>
</template>
<script setup lang="ts">
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { reactive, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";



interface FormData {
  origin?: string
  copyright?: string
}

const props = defineProps<{
  modelValue: boolean
  data: FormData
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value?: boolean): void
  (event: "done", value: FormData): void
}>();
const {locale} = useI18n();
const show = ref(props.modelValue);
const formData = reactive<FormData>({
  origin: "",
  copyright: ""
});
const onClose = ()=> {
  emit("update:modelValue", !show.value);
}
const onSubmit = ()=> {
  emit("done",formData);
}
watch(()=> props.modelValue, (cb) => show.value = cb);
watch(()=> props.data, (cb) => {
  formData.copyright = cb?.copyright;
  formData.origin = cb?.origin;
});

</script>
<style scoped lang="scss">
@import "@/theme.scss";
.copyright-collect__wrapper {
  width: 420px;
  height: 300px;
  border-radius: 5px;
  position: relative;
  padding: 0 20px;
  background-color: #fff;
  box-sizing: border-box;
  .form-wrapper {
    margin: 20px auto;
    padding: 0 30px;
    box-sizing: border-box;
    &:deep(.el-textarea__inner ) {
      text-align: left;
      resize: none;
    }
  }
  .copyright-collect-header {
    display: flex;
    width: 100%;

    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 20px 0;
    .copyright-collect-title {
      font-size: 18px;
      font-weight: bold;
    }
    .copyright-collect-close {
      font-size: 24px;
      color: #525252;
      &:hover {
        cursor: pointer;
        color: #494949;
      }
    }
  }

}
</style>