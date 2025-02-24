<template>
  <el-icon class="sign-up--back" @click="onBack" v-if="showBack && !isIframe">
    <ArrowLeft />
  </el-icon>
  <div class="wrapper-form" :style="{width: i18n.locale.value === 'en'? '380px':'350px'}">
    <h3 style="color: #505d70;font-size: 20px" v-if="!isUpdate">
      {{$t('signUp.title')}}
    </h3>
    <el-image class="user--avatar"
              fit="contain"

              :style="{'margin-bottom': '20px','margin-top': '20px','background-color':avatarUrl? 'rgba(0, 0, 0, 0.3)':'transparent'}"
              :src="avatarUrl || defaultAvatar" />
    <input type="file" class="sign-up--input_file"

           :style="{transform: isUpdate? i18n.locale.value === 'zh_hant'? 'translate(135px, 20px)' : 'translate(130px, 20px)': isIframe? 'translate(135px, 50px)': i18n.locale.value === 'zh_hant'? 'translate(135px, 50px)': 'translate(150px, 48px)'}"
           ref="file" accept="image/*" @change="onImageChange"
           @mouseenter="showDeleteIcon = true" @mouseleave="showDeleteIcon = false" />
    <el-icon class="sign-up--icon_delete"
             :style="{transform: isUpdate ? i18n.locale.value === 'zh_hant'? 'translate(162px, 75px)' : 'translate(177px, 75px)' : isIframe? 'translate(162px, 100px)' :  i18n.locale.value === 'zh_hant'? 'translate(162px, 100px)':'translate(177px, 105px)'}"
             @click="avatarUrl = ''"
             v-if="showDeleteIcon && avatarUrl"
             @mouseenter="showDeleteIcon = true">
      <Delete />
    </el-icon>
    <div class="change-icon-tips"
         v-if="showDeleteIcon"
         :style="{transform: isUpdate? i18n.locale.value === 'zh_hant'? 'translate(135px, 20px)' : 'translate(150px, 20px)': isIframe? 'translate(135px, 50px)': i18n.locale.value === 'zh_hant'? 'translate(135px, 50px)': 'translate(150px, 48px)'}">
      {{$t('signUp.change_avatar')}}
    </div>
    <el-form ref="form"
             :model="formData"
             size="large"
             @submit.prevent.capture="onSubmit(form as FormInstance)"
             :rules="rules"
             label-position="right"
             :label-width="i18n.locale.value === 'en'? hidePassword? '90' : isUpdate? '80' : '138':'80'">
      <el-form-item prop="username" :label="$t('signUp.account')">
        <el-input name="username" autocomplete="off"
                  :disabled="isUpdate"
                  class="default__input"
                  v-model="formData.username"
                  :placeholder="$t('universal.placeholder')" />
      </el-form-item>
      <el-form-item prop="nickname" :label="$t('signUp.username')">
        <el-input name="nickname" autocomplete="off"  class="default__input" v-model="formData.nickname" :placeholder="$t('universal.placeholder')" />
      </el-form-item>
      <el-form-item prop="institution"  :label="$t('signUp.school')">
        <el-input name="institution" autocomplete="off"  class="default__input" v-model="formData.institution" minlength="1" :placeholder="$t('universal.placeholder')" />
      </el-form-item>
<!--      <el-form-item prop="sex" :label="$t('signUp.sex')">-->
<!--        <el-select v-model="formData.sex" style="width: 100%" class="default__select">-->
<!--          <el-option :value="1" :label="$t('signUp.man')" />-->
<!--          <el-option :value="0" :label="$t('signUp.woman')" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item prop="password" :label="$t('signUp.password')" v-if="!hidePassword">
        <el-input name="password" autocomplete="off"  class="default__input" v-model="formData.password" show-password :placeholder="$t('universal.placeholder')" />
      </el-form-item>
      <el-form-item prop="repeatPassword" :label="$t('signUp.repeatPassword')" v-if="!isUpdate">
        <el-input name="repeatPassword" autocomplete="off"  class="default__input" v-model="formData.repeatPassword" show-password
                  :placeholder="$t('universal.placeholder')" />
      </el-form-item>
      <el-form-item  label-width="0">
        <button type="submit" class="sign-up-confirm--button default__button-active">
          {{$t('signUp.confirm')}}
        </button>
      </el-form-item>
    </el-form>
  </div>
<LoadingComponent :show="loading" />
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { accountValidation, passwordValidation, passwordValidationWithUpdate } from "@/libs/register-rule";
import type { Register } from "@/interface/Register";
import { useRoute, useRouter } from "vue-router";
import defaultAvatar from "@/assets/default-user-icon.png";
import { ArrowLeft, Delete } from "@element-plus/icons-vue";
import { fetchRegister, fetchUserUpdate } from "@/http/user";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import { useI18n } from "vue-i18n";

interface UserData {
  id: number;
  username: string;
  createTime: number;
  nickname: string;
  remark?: string;
  institution: string;
  expirationTime: number;
  lastLoginTime?: number;
  num: number;
  userType: number;
  member?: any[];
  privileges?: string[];
  sex: number;
  members?: any[];
  uequipment?: string;
  wequipment?: string;
}

const i18n = useI18n();

const route = useRoute();
const router = useRouter();
const form = ref<FormInstance>();
const showDeleteIcon = ref(false);
const avatarUrl = ref<string>();
const file = ref<HTMLInputElement>();
const loading = ref(false);
const isIframe = ref(!!route.query.iframe);
const showTips = ref(false);

const formData = reactive<Register.Form>({
  username: "",
  password: "",
  repeatPassword: "",
  sex: 1,
  institution: "",
  nickname: ""
});
const props = withDefaults(defineProps<{
  showBack?: boolean
  isUpdate?: boolean
  dataSource?: UserData
  hidePassword?: boolean
}>(), {
  showBack: true,
  isUpdate: false,
  hidePassword: false
})

const onSubmit = function(event: FormInstance) {
  if (!event) return;
  event.validate((result: boolean) => {
    if (!result) return;
    const _formData = new FormData();
    Object.keys(formData).forEach((key) => {
      //@ts-ignore
      _formData.append(key, formData[key]);
    })
    if(avatarUrl.value && file.value?.files && file.value.files.length > 0){
      _formData.append('file', file.value.files[0]);
    } else {
      _formData.append('file', "");
    }
    loading.value = true;
    if(props.isUpdate){
      //@ts-ignore
      _formData.append("id", props.dataSource?.id);
      fetchUserUpdate(_formData).then(response => {
        if(response && response.code===200){
          ElMessage({
            message: i18n.t("universal.complete"),
            type: "info"
          });
          props.showBack && router.back();
          !props.showBack && emit('finish',"", "", Object.assign({},{...formData},{remark: response.data.remark}));
        }
      }).finally(()=> loading.value = false);
    } else {
      fetchRegister(_formData).then(response => {
        if(response && response.code===200){
          ElMessage({
            message: i18n.t("universal.complete"),
            type: "info"
          });
          props.showBack && !isIframe.value && router.back();
          !props.showBack && emit('finish');
          if(isIframe.value){
            window.parent.postMessage("finish", "*");
          }
        }
      }).finally(()=> loading.value = false);
    }
  });
};

const emit = defineEmits<{
  (e: "finish", loginName?: string | number, password?: string | number, formData?: Register.Form): void
}>();


const repeatPasswordValidation = (rule: any, value: any, callback: any) => {
  if (value === formData.password) {
    callback();
  } else callback(new Error(i18n.t('valid.password_error')));
};
const rules = reactive<FormRules>({
  nickname: [{ required: true, message: i18n.t('valid.required') }, { max: 50, message: i18n.t('valid.less_than_50') }],
  username: [{ validator: accountValidation(i18n.t), trigger: ["change", "blur"] }, {
    required: true,
    message: i18n.t('valid.required')
  }, { max: 50, message: i18n.t('valid.less_than_50') }, { min: 6, message: i18n.t('valid.at_least_6') }],
  password: [{ validator: props.isUpdate? passwordValidationWithUpdate(i18n.t) : passwordValidation(i18n.t), trigger: ["change", "blur"] }, {
    required: !props.isUpdate,
    message:  i18n.t('valid.required')
  }, { min: 6, message: i18n.t('valid.at_least_6') }, {
    max: 50,
    message: i18n.t('valid.less_than_50'),
    trigger: ["change", "blur", "input"]
  }],
  institution: [{ required: false, message: i18n.t('valid.required') }, { max: 50, message: i18n.t('valid.less_than_50') }],
  sex: [{ required: true, message: i18n.t('valid.required') }],
  repeatPassword: [{ validator: repeatPasswordValidation, trigger: ["change", "blur"] }, {
    required: true,
    message: i18n.t('valid.required')
  }]
});

const onImageChange = (event: InputEvent) => {
  const reader = new FileReader();
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    // 监听FileReader加载事件，当加载完成后执行
    reader.onload = function(e) {
      // e.target.result 是图片的Base64数据
      const base64String = e.target!.result;

      // 设置预览图像的src为Base64数据
      avatarUrl.value = base64String as string;

    };

    // 读取文件并将其转换为Base64
    reader.readAsDataURL(files[0]);
  }
};

const onBack = () => {
  window.history.back();
};
onBeforeMount(()=>{
  const language = route.query.language;
  if(language === 'en'){
    i18n.locale.value = 'en';
  } else if(language === 'zh_hant'){
    i18n.locale.value = 'zh_hant';
  }
})
watch(()=> props.dataSource, value=>{

  if(value){
    formData.username = value.username;
    formData.sex = value.sex;
    formData.nickname = value.nickname;
    formData.institution = value.institution;
    avatarUrl.value = value.remark;
  }
})
onBeforeMount(()=>{
  if(props.dataSource){
    formData.username = props.dataSource.username as string;
    formData.sex = props.dataSource.sex as number;
    formData.nickname = props.dataSource.nickname as string;
    formData.institution = props.dataSource.institution;
    avatarUrl.value = props.dataSource.remark;
  }

})
</script>

<style scoped>

.wrapper-form {
  width: 350px;
  overflow-y: auto;
  margin: 15px auto;
  text-align: center;
  position: relative;
}

.wrapper-form::-webkit-scrollbar {
  display: none;
}

.wrapper-form::-moz-viewport-scroll {
  display: none;
}

.sign-up-confirm--button {
  border-radius: 5px;
  width: 120px;
  padding: 10px 0;
  border: none;
  outline: none;
  margin: 20px auto;
  cursor: pointer;
  display: block;
}

.sign-up--input_file {
  position: absolute;
  left: 0;
  top: 0;
  width: 80px;
  height: 80px;
  z-index: 1;
  margin: 0 auto;
  display: block;
  transform: translate(170px, 20px);
  cursor: pointer;
  opacity: 0;
}

.sign-up--icon_delete {
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  color: red;
  font-size: 18px;
  transform: translate(197px, 75px);
  border-radius: 50%;
  padding: 5px;
}

.sign-up--icon_delete:hover {
  background-color: rgba(0, 0, 0, .2);
  cursor: pointer;
}

.sign-up--back {
  font-size: 26px;
  position: absolute;
  left: 26px;
  top: 26px;
  padding: 8px;
  cursor: pointer;
  color: #fff;
  background-color: rgba(0, 0, 0, .3);
  z-index: 1;
  border-radius: 50%;
}

.sign-up--back:hover {
  background-color: rgba(0, 0, 0, .4);
}
.user--avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, .3);
}
.change-icon-tips {
  width: 80px;
  height: 80px;
  position: absolute;
  left: 0;
  top: 0;
  background-color: rgba(0,0,0,.5);
  color: #fff;
  box-sizing: border-box;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: smaller;
  pointer-events: none;
}
</style>
