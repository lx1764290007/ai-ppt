<template>
  <div class="container">

<!--    <el-popover-->
<!--      placement="bottom"-->
<!--      :width="80"-->
<!--      trigger="hover"-->
<!--    >-->
<!--      <template #reference>-->
<!--        <img src="@/assets/language.svg" class="filter-item" alt="language" />-->
<!--      </template>-->
<!--      <div class="button-group">-->
<!--        <div :class="{'button-lang-item':true, 'button-lang-item-active':useLanguage.locale === item.value}"-->
<!--             v-for="(item,index) of languageOptions" :key="index" @click="onChange(item.value)">-->
<!--          <span style="cursor: pointer;">{{ item.label }}</span>-->
<!--        </div>-->
<!--      </div>-->
<!--    </el-popover>-->
    <div class="wrapper">
      <el-image :src="logoIcon" alt="logo" class="login-logo" mode="aspectFill"></el-image>
      <p class="login-title">
        {{$t('login.title')}}
      </p>
      <LoginView :reg-value="regValue" />
    </div>
  </div>
</template>
<script setup lang="ts">
import LoginView from "@vs/Login/Login-View.vue";
import { reactive } from "vue";
import {useI18n} from "vue-i18n";
import {useLanguageStore} from "@/stores/language";
import {enumLanguage} from "@/enum";
import logoIcon from "@/assets/logo.png";

const i18n = useI18n();
const useLanguage = useLanguageStore();

const regValue = reactive<{ loginName: string, password: string }>({
  loginName: "",
  password: ""
});
const languageOptions = reactive<{label:string, value:string}[]>(enumLanguage);
const onChange = (value:string)=> {
  i18n.locale.value = value;
  useLanguage.changeLanguage(value);
}

</script>

<style scoped >
.container {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1;
  background: transparent;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.wrapper {
  width: 720px;
  height: 510px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.filter-item {
  position: absolute;
  right: 50px;
  top: 20px;
  z-index: 1;
  width: 25px;
  cursor: pointer;
}

.left-side img {
  max-width: 100%;
  width: 90%;
}
.line1 img {
  width: 60%;
}
.line2 img {
  width: 100%;
}

.footer img {
  max-width: 100%;
}
.footer img[alt="ii"] {
  width: 200px;
  margin-left: 10px;
}
.footer img[alt="ti"] {
  width: 130px;
}
.footer div {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: #fff;
  text-align: center;
}
.button-lang-item {
  margin: 5px 0;
  cursor: pointer;

}
.button-lang-item:hover {
  color: #337ab2;
  cursor: pointer;
}
.button-lang-item-active {
  color: #308cd5;
  font-weight: 600;
}
.login-logo {
  width: 74%;
}
.login-title {
  color: #fff;
  background-color: #0095FF;
  padding: 3px 15px;
  border-radius: 5px;
  font-size: 18px;
}
</style>
