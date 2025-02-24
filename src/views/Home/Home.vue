<template>
  <div class="home-container" v-loading="true">
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/libs/useAuth";
import { useUserInfo } from "@/stores/user";
import { navigationExcludedFromMenus, routes } from "@/router/route";

const router = useRouter();
const auth = useAuth();
onMounted(()=>{
    setTimeout(()=>{
      if(!auth.info.token) {
        router.push("/login");
      }
    }, 500)
})
const active = ref("");
const route = useRoute();

const userInfo = useUserInfo();


const getMenus = () => {
  //先排除不需要显示的菜单
  const step1 = routes.filter((item) => !navigationExcludedFromMenus.includes(item.name));
  //再根据角色排除不需要显示的菜单
  const step2 = step1.filter((item) => item.role?.includes(userInfo.getUserInfo.user?.roleId));

  if (String(userInfo.getUserInfo.user?.roleId) === "1") return step2;
  return step2.filter((item) => !item.permissions || userInfo.getUserInfo.privileges?.some(it => item.permissions?.includes(it.id))).filter(item => String(item.role) !== "1");
};
watch(route, (newVal) => {
  active.value = newVal.name as string;
}, {
  immediate: true
});
onBeforeMount(() => {
  setTimeout(()=>{
    if (getMenus()[0]?.path) {
      router.push(String(getMenus()[0].path));
    } else if (getMenus()[1]?.path) {
      router.push(String(getMenus()[1].path));
    }
  },600)
});
</script>

<style scoped lang="scss">
.home-container {
  //background-image: url("@/assets/bg.png");
  background-repeat: repeat;
  background-position: left top;
  background-size: 100px 100px;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}
</style>
