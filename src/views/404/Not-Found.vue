<template>
  <div class="wrapper">
    <h1>404</h1>
    <h3>{{$t('universal.notFound')}}</h3>
    <p style="font-size: small"> <span style="color: #e78664">{{i18n.locale.value === 'en'? $t('universal.automatically') + counter+'s': counter+'s' +  $t('universal.automatically')}}</span></p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
//import { useLinkToHome } from "@/libs/useRoute";
const router = useRouter();
const counter = ref<number>(5);
let t: any;
const i18n = useI18n()
const fn = function() {
  t = setTimeout(() => {
    if (counter.value <= 0) {
      clearTimeout(t);
    //  window.location.href = useLinkToHome();
      router.push("/")
      return;
    }
    counter.value--;
    fn();
  }, 1000);
};
onMounted(fn);
</script>

<style scoped>
.wrapper {
  text-align: center;
  margin-top: 15vh;
}
</style>
