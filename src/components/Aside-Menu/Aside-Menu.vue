<template>
  <div class="aside-menu">
    <div
      :class="{ 'aside-menu-item': true, 'aside-menu-item-active': item.link === active }"
      v-for="(item, i) of list"
      :key="i"
      @click.stop="onChange(item.link)"
    >
      <img class="aside-menu-item-img"  :src="item.icon" alt="icon" />
      <span>
        {{ $t(item.title) }}
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import type { Menu } from "@/interface/Menu";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const list = ref<Menu[]>([
  {
    title: "menu.menu_item_line1",
    link: "/",
    icon: new URL("@/assets/menu/0.webp", import.meta.url).href
  },
  {
    title: "menu.menu_item_line2",
    link: "/question-add",
    icon: new URL("@/assets/menu/1.webp", import.meta.url).href
  },
  {
    title: "menu.analysis",
    link: "/analysis",
    icon: new URL("@/assets/menu/analysis.svg", import.meta.url).href
  },
  {
    title: "menu.menu_item_line3",
    link: "/information",
    icon: new URL("@/assets/menu/4.webp", import.meta.url).href
  },
  {
    title: "menu.menu_item_line4",
    link: "/setting",
    width: 28,
    icon: new URL("@/assets/menu/setting.svg", import.meta.url).href
  },
  // {
  //   title: "生成PPT",
  //   link: "a",
  //   icon: new URL("@/assets/menu/2.webp", import.meta.url).href
  // },
  // {
  //   title: "数据分析",
  //   link: "b",
  //   icon: new URL("@/assets/menu/3.webp", import.meta.url).href
  // },

]);
const active = ref<string>("/");

const onChange = (link: string) => {
  active.value = link;
  if (link) {
    router.push({
      path: link
    });
  }
};
watch(
  () => route.fullPath,
  (newPath) => {
    active.value = newPath;
  }
);
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.aside-menu {
  width: $menu-width;
  height: $menu-height;
  background-color: $menu-bg;
  font-size: $menu-font-size;
  color: $menu-font-color;
  font-weight: $menu-font-weight;
  padding: 14px 20px;
  box-sizing: border-box;
}

.aside-menu-item {
  padding: 8px 6px;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-flow: row nowrap;
  box-sizing: border-box;
  margin: 5px 0;
  transition: background-color 0.2s linear;

  &:hover {
    background-color: $menu-item-hover-bg;
    cursor: pointer;
    border-radius: 5px;
    overflow: hidden;
  }

  .aside-menu-item-img {
    width: $menu-font-size * 2;
    margin-right: 8px;
    margin-top: 6px;
  }
}

.aside-menu-item-active {
  color: $menu-item-active-font-color;
  background-color: $menu-item-active-bg !important;
  font-weight: $menu-item-active-font-weight;
  border-radius: 5px;
  overflow: hidden;
}
</style>
