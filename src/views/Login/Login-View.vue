<template>
  <div class="main">
    <el-form :model="formData" @submit.prevent.capture="onSubmit(formRef)" ref="formRef" size="large">
      <el-form-item prop="username" :rules="[
        {
          required: true,
          message: $t('login.account_tips'),
          trigger: 'blur',
        }
      ]">
        <div class="login__input-wrapper">
        <img src="@/assets/user-icon.png" alt="user-icon" />
        <input name="loginName"
               autocomplete="off"
               v-model="formData.username"
               type="text"
               class="login__input"
               :placeholder="$t('login.aria_account_placeholder')" />
        </div>
      </el-form-item>
      <el-form-item prop="password" :rules="[
        {
          required: true,
          message: $t('login.password_tips'),
          trigger: 'blur',
        }
      ]">
        <div class="login__input-wrapper">
          <img src="@/assets/password-icon.png" alt="password-icon" />
        <input name="password"
               autocomplete="off"
               :placeholder="$t('login.aria_password_placeholder')"
               v-model="formData.password"
               type="password"
               class="login__input" />
        </div>
      </el-form-item>
      <el-form-item>
        <div class="login__tools">
          <el-checkbox :checked="checked" @change="onRememberYourPassword"  >
            <el-icon style="position: absolute;transform: translateX(-22px);z-index: 1;color: #4273a4" v-if="checked"><Check /></el-icon>

            {{$t('login.remember')}}
          </el-checkbox>
          <span class="to-sign--up" @click="toSignUp">
            {{$t('login.signUp')}}
          </span>
          <a @click.prevent="toForgetPassword">{{$t('login.forgot')}}</a>

        </div>
      </el-form-item>
      <el-form-item>
        <el-button native-type="submit"
                   loading-icon="loading"
                   type="primary" size="large"
                   class="default__button-active"
                   style="width:50%; margin: 0 auto; margin-top: 10px;height: 45px"
                   :loading="loading">{{ $t("login.btn") }}
        </el-button>
      </el-form-item>

    </el-form>
  </div>
  <p class="copyright">Copyright © {{ copyrightYear }} IF Interactive Limited</p>
  <LoadingComponent :show="loading" />
  <MessageBox v-model:visible="showMessageBox"
              :cancel-text="$t('recharge.recharge')"
              @confirm="onNav"
              @cancel="onNav('cancel')"
              :confirm-text="$t('recharge.free_trial')">
    <span style="padding:0 15px">{{$t('recharge.free_7_day_text')}}</span>
  </MessageBox>
  <div v-if="showRechargeMessageBox">

  <MessageBox v-model:visible="showRechargeMessageBox" width="1000px" height="650px">
      <div style="transform: scale(0.8)">
        <recharge-page is-component @done="onTopUpDone" />
      </div>
  </MessageBox>
  </div>
</template>
<script setup lang="ts">
import { ENCRYPT_KEY, oAlert } from "@/libs/useKeys";
import { inject, onBeforeMount, onMounted, reactive, ref, watch, watchEffect } from "vue";
import type { FormInstance } from "element-plus";
import { fetchFreeTrial, fetchLogin } from "@/http/user";
import MessageBox from "@/components/MessageBox/Message-Box.vue";
import RechargePage from "@vs/Subscribe/Recharge-Page.vue";

// import { useLinkToHome } from "@/libs/useRoute";
import { useI18n } from "vue-i18n";
import { useUserInfo } from "@/stores/user";
import { useAuth } from "@/libs/useAuth";
import { type Attrs } from "@cs/Feedback/Alert-Component.vue";
import { useRouter } from "vue-router";
import type { Login } from "@/interface/Login";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { USER_TYPE } from "@/enum";
import { Check } from "@element-plus/icons-vue";
import { decryptAES, encryptAES, xorDecrypt, xorEncrypt } from "@/libs/encrypt";

const { t } = useI18n();
const REMEMBER_KEY = "remember_password_mark", REMEMBER_PASSWORD = "remember_password", REMEMBER_NAME = "remember_login_name";
const userInfo = useUserInfo();
const showMessageBox = ref(false);
const formData = reactive<{
  username: string
  password: string
}>({
  username: window.localStorage.getItem(REMEMBER_NAME) || "",
  password: "",
});

const prop = defineProps(["regValue"]);
const loading = ref(false);
const formRef = ref<FormInstance>();

const router = useRouter();
const onAlert = inject(oAlert) as (conf: Attrs) => void;
const user = useAuth();
const showRechargeMessageBox = ref(false);
const checked = ref(Boolean(window.localStorage.getItem(REMEMBER_KEY)));

const toSignUp = ()=> {
  router.push({
    path: "/sign-up",
    query: {
      url: '/login'
    }
  });
}
const onSubmit = function(formEl: FormInstance | undefined, path?:string="/") {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      loading.value = true;
      loading.value = true;
      //@ts-ignore
      fetchLogin(Object.assign(formData)).then(async (res: Login.LoginData) => {

        if (res.code === 200) {
          // const path = useLinkToHome();
          userInfo.setUserInfo("nickname", res.data.user.nickname);
          userInfo.setUserInfo("roleId", res.data.user.roleId);
          userInfo.setUserInfo("username", res.data.user.username);
          userInfo.setUserInfo("id", res.data.user.id);
          userInfo.setUserInfo("userType", String(res.data.user.userType));
          userInfo.setUserInfo("createTime", res.data.user.createTime);
          userInfo.setUserInfo("expirationTime", res.data.user.expirationTime);
          userInfo.setUserInfo("uequipment", String(res.data.user.uequipment));
          userInfo.setUserInfo("wequipment", String(res.data.user.wequipment));
          userInfo.setUserInfo("userType", res.data.user.userType);
          userInfo.setUserInfo("privileges", res.data.user.privileges);
          //@ts-ignore
          userInfo.setUserInfo("remark", res.data.user.remark);
          userInfo.setPrivileges(res.data.privileges);
          user.info = res.data;
          if(checked.value) {
            const _pwdEncrypt  = await encryptAES(formData.password, ENCRYPT_KEY);
            window.localStorage.setItem(REMEMBER_PASSWORD, _pwdEncrypt);
          } else {
            window.localStorage.removeItem(REMEMBER_PASSWORD);
          }
          window.localStorage.setItem(REMEMBER_NAME, formData.username);
          if(res.data.user.userType ===  USER_TYPE.FIRST_TIMES) {
            doFirstTimesLogin();
          }  else if(res.data.user.userType === USER_TYPE.MEMBER || res.data.user.userType === USER_TYPE.VISITOR) {
            router.replace({
              path: path
            });
          } else {
            showRechargeMessageBox.value = true;
          }
        } else if(res.code === 501){

          showRechargeMessageBox.value = true;
        } else {
          onAlert({
            type: "error",
            title: t("login.error")
          });
        }
      }).catch((res:any)=> {
        if(res && res.code === 501) {
          userInfo.setUserInfo("nickname", res.data.user.nickname);
          userInfo.setUserInfo("roleId", res.data.user.roleId);
          userInfo.setUserInfo("username", res.data.user.username);
          userInfo.setUserInfo("id",  res.data.user.id);
          userInfo.setUserInfo("userType", String(res.data.user.userType));
          userInfo.setUserInfo("createTime", res.data.user.createTime);
          userInfo.setUserInfo("expirationTime", res.data.user.expirationTime);
          userInfo.setUserInfo("uequipment", String(res.data.user.uequipment));
          userInfo.setUserInfo("wequipment", String(res.data.user.wequipment));
          userInfo.setUserInfo("userType", res.data.user.userType);
          userInfo.setUserInfo("privileges", res.data.user.privileges);
          //@ts-ignore
          userInfo.setUserInfo("remark", res.data.user.remark);
          userInfo.setPrivileges(res.data.privileges);
          user.info = res.data;
          showRechargeMessageBox.value = true;
        }
      }).finally(() => loading.value = false);
    } else {
      onAlert({
        type: "error",
        title: t("login.error")
      });
    }
  });
};
const toForgetPassword = ()=> {
  router.push({
    path: '/forget-password'
  })
}
const onRememberYourPassword = (event:boolean)=>{
  checked.value = event;
  if(event) {
    window.localStorage.setItem(REMEMBER_KEY, String(event));
  } else {
    window.localStorage.removeItem(REMEMBER_KEY);
  }
}
const onNav = (event:string)=> {
  loading.value = true;
  showMessageBox.value = false;
  fetchFreeTrial({
    userId: userInfo.getUserInfo.user?.id
  }).then((res:any)=>{
    if(res.code === 200) {
      if(event === 'cancel') {
        onSubmit(formRef.value, "/recharge")
      } else {
        onSubmit(formRef.value);
      }
    }
  })
}
const doFirstTimesLogin = ()=> {
  showMessageBox.value = true;
}
const onTopUpDone = ()=> {
  showRechargeMessageBox.value = false;
  onSubmit(formRef.value);
}
const copyrightYear = new Date().getFullYear();
watchEffect(() => {
  formData.username = prop.regValue.username;
  formData.password = prop.regValue.password;
});
watch(loading, (newValue) => {
  if (newValue) {
    setTimeout(() => loading.value = false, 8000);
  }
});
onMounted(async ()=>{
  formData.username = window.localStorage.getItem(REMEMBER_NAME) || "";
  const _pwdEncryptStr = window.localStorage.getItem(REMEMBER_PASSWORD) || "";
  if(_pwdEncryptStr) {
    formData.password = await decryptAES(_pwdEncryptStr, ENCRYPT_KEY);
  }
})
onBeforeMount(()=> {
  user.removeData()
})
</script>

<style scoped lang="scss">
@import "@/theme";
.main {
  width: 330px;
  height: 330px;
  transform: translateY(24px);
}
.copyright {
  position: fixed;
  bottom: 30px;
  text-align: center;
  color: #565656;
  font-size: smaller;
}
.login__input {
  border: 0;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 15px 6px 36px;
  font-size: 16px;
  height: 44px;
  border-radius: 8px;
  color: #657387;
  position: relative;
  box-shadow:  3px 2px #BDC3D3 inset;
}
.login__input::placeholder {
  color: #bbbbbb;
}
.login__input:focus {
  box-shadow:  3px 2px #939393 inset;
}
.login__input-wrapper {
  width: 100%;
  position: relative;
}
.login__input-wrapper img {
  width: 16px;
  position: absolute;
  left: 10px;
  top: 12px;
  z-index: 1;
  pointer-events: none;
}
.login__tools {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;

}
.login__tools:deep(.el-checkbox ) {
  --el-checkbox-checked-text-color: #333 !important;

}
.login__tools:deep(.el-checkbox__inner) {
  box-shadow: 2px 3px #ccc inset;
}
.login__tools:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  box-shadow: none;
}
.login__tools a {
  color: #FF6600;
  text-decoration-line: underline;
  font-size: 14px;
  cursor: pointer;
}
.login__tools a:hover {
  color: #e7955e;
}
.to-sign--up {
  padding: 2px 5px;

  height: 30px;
  color: #4f8dd5;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}
.to-sign--up:hover {
  color: #2562a2;
}
</style>
