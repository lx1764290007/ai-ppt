<template>
  <div class="wrapper">
    <h1>Permission Denied</h1>
    <h3>无权限访问</h3>
    <p style="font-size: small"> <span style="color: #e78664">{{ counter }}s</span> 后自动返回上一级...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// import { useLinkToHome } from "@/libs/useRoute";

const counter = ref<number>(5);
let t: any;
const fn = function() {
  t = setTimeout(() => {
    if (counter.value <= 0) {
      clearTimeout(t);
      // window.location.href = useLinkToHome();
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
