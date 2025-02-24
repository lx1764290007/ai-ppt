<template>
  <aside :class="{'assign-menu__main':true, 'assign-menu__main-show':show}">
    <div
      :class="{'assign-menu__item':true,'assign-menu__item-active':active === item.name, 'assign-menu__item-bold':!item.path}"
      v-for="(item, index) of getMenuList"
      @click="onMenuChange(item.name)"
      :key="index">
      <div class="assign-menu__item-icon">
        <img class="assign-menu__item-img"
             :src="item.icon"
             alt="icon"
             v-if="item.icon" />
        <span class="assign-menu__item-img" v-else></span>
        <span>{{ $t(item.menu || "") }}</span>
      </div>
    </div>
  </aside>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { navigationExcludedFromMenus, routes } from "@/router/route";
import { useRoute, useRouter } from "vue-router";
import { useUserInfo } from "@/stores/user";

const active = ref("");
const route = useRoute();
const router = useRouter();
const userInfo = useUserInfo();
const show = ref(false);

const onMenuChange = (item: string) => {
  active.value = item;
  router.push({
    name: item
  });
};
const getMenuList = computed(() => {
  //先排除不需要显示的菜单
  const step1 = routes.filter((item) => !navigationExcludedFromMenus.includes(item.name));
  //再根据角色排除不需要显示的菜单
  const step2 = step1.filter((item) => item.role?.includes(userInfo.getUserInfo.user?.roleId));
  if (userInfo.getUserInfo.user?.roleId === "1") return step2;
  return step2.filter((item) => !item.permissions || userInfo.getUserInfo.privileges?.some(it => item.permissions?.includes(it.sort))).filter(item => String(item.role) !== "1");
});
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
onMounted(() => {
  setTimeout(()=>{
    show.value = true;

  },500)

});
</script>
<style scoped>
.assign-menu__main {
  box-sizing: border-box;
  position: relative;
  margin: 0;
  background: linear-gradient(0deg, #3E3F6F, #3A3354);
  height: calc(100vh - 60px);
  overflow-y: auto;
  transition: all 0.3s;
  opacity: 0;
}
.assign-menu__main-show {
  opacity: 1;

}
.assign-menu__item {
  padding: 8px 20px;
  box-sizing: border-box;
  color: #fff;
  font-size: 16px;
  text-align: center;
  user-select: none;
}

.assign-menu__item:hover {
  background-color: #7869c5;
  cursor: pointer;
}

.assign-menu__item-active {
  background: linear-gradient(to right, #7155FF 20%, #6045e8) !important;
  color: #fff;
  border-left: 2px solid #ADD2FF;

}

.assign-menu__item-bold {
  font-size: 18px !important;
  font-weight: 600;
  cursor: default !important;
  background-color: transparent !important;
  color: #978AD6 !important;
  pointer-events: none;
}

.assign-menu__item-icon {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.assign-menu__item-img {
  width: 30px;
  margin-right: 10px;
  margin-top: 8px;
}
</style>