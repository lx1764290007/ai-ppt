<template>
  <el-icon class="back-icon" @click="onBack" v-if="showBack">
    <ArrowLeft />
  </el-icon>
  <div class="forgot-password-wrapper">
    <div class="forgot-password-content">
      <div class="forget-title">
        {{$t('valid.following_way')}}
      </div>
      <div class="forgot-password-item">
        <span>{{$t('valid.mail')}}:</span><a href="mailto:support@ifinteractive.com">
        support@ifinteractive.com
      </a>
      </div>
<!--      <div class="forgot-password-item">-->
<!--        <span>{{$t('valid.phone_number')}}:</span><a href="tel:10086" >-->
<!--        12345678910-->
<!--      </a>-->
<!--      </div>-->
    </div>
  </div>
</template>
<script setup lang="ts">

import { ArrowLeft } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const i18n = useI18n();
const showBack = ref(true);
const onBack = ()=> {
  router.back();
}
const route = useRoute();
onMounted(()=>{
  showBack.value = !route.query.iframe;
  const language = route.query.language;
  if(language === 'en'){
    i18n.locale.value = 'en';
  } else if(language === 'zh_hant'){
    i18n.locale.value = 'zh_hant';
  }
})

</script>
<style scoped>
.forgot-password-wrapper {
  display: flex;
  height: 80vh;
  width: 100%;
  flex-direction: column;
  justify-content: center;
}
.forgot-password-content, .forgot-password-item {
  font-size: 18px;
  width: 44vw;
  margin: 0 auto;
}
.forgot-password-item {
  margin-top: 50px;
  font-size: 20px;
}
.forgot-password-item + .forgot-password-item {
  margin-top: 20px;
}
.forgot-password-item a {
  color: #337ecc;
  margin-left: 10px;
}
.back-icon {
  position: absolute;
  left: 26px;
  top: 26px;
  z-index: 1;
  padding: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .3);
  color: #fff;
  font-size: 26px;
  font-weight: bold;
}
.back-icon:hover {
  background: rgba(0, 0, 0, .5);
  color: #fff;
  cursor: pointer;
}
.forget-title {
  font-size: 22px;
  font-weight: 500;
}
</style>