

<template>
    <div class="app-recharge-wrapper">
      <recharge-page is-component />
    </div>

</template>
<script setup lang="ts">
import RechargePage from "@vs/Subscribe/Recharge-Page.vue";
import { useRoute } from "vue-router";
import { onBeforeMount } from "vue";
import { useI18n } from "vue-i18n";

const locale = useI18n();

const route = useRoute();

onBeforeMount(()=>{
  const language = route.query.language;
  if(language === 'en'){
    locale.locale.value = 'en';
  } else if(language === 'zh_hant'){
    locale.locale.value = 'zh_hant';
  }
})
</script>
<style scoped>
.back {
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0,0,0,.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #545454;
}
.back:hover {
  background-color: rgba(0,0,0,.5);
  color: #fff;
}
.app-recharge-wrapper {
  max-height: 550px;
}
</style>