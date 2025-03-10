<template>
  <div
    :class="{'layout':true, 'locale-zh': locale.locale.value === 'zh_hant', 'locale-en':locale.locale.value === 'en'}">
    <el-config-provider :locale="en">
      <el-container style="height: 100%" class="">
        <el-header style="padding-left: 0;padding-right: 0;position: relative;z-index: 101">
          <top-header v-if="requireHeader" />
        </el-header>
        <el-container>
          <el-aside class="main-menu" v-if="requireMenu">
            <Menu />
          </el-aside>
          <el-main style="height: 100%" :class="{main:true,'main-without-padding': !requireMenu}">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
      <div class="alert-wrapper" v-if="alertShow">
        <Alert :title="alertConfig['title']" :type="alertConfig['type']" :effect="alertConfig['effect']"
               @close="onAlertClose" />
      </div>
    </el-config-provider>
  </div>
</template>
<script setup lang="ts">
import { RouterView, useRoute, useRouter } from "vue-router";
import Menu from "@cs/Assign-Menu/Assign-Menu.vue";
import TopHeader from "@cs/TopHeader/Main-Header.vue";
import Alert from "@cs/Feedback/Alert-Component.vue";
import { ElConfigProvider, ElMessage } from "element-plus";
import en from "element-plus/es/locale/lang/en";
import { useAlert } from "@/libs/useAlert";
import { computed, onBeforeMount, provide, watch } from "vue";
import { cAlert, MESSAGE_BOX, NET_ERROR_TIPS, oAlert } from "@/libs/useKeys";

import pub from "@/libs/eventBus";
import { useI18n } from "vue-i18n";
import { RoutesDoNotRequireHeader, RoutesDoNotRequireMenu } from "@/router/route";
import { useUserInfo } from "@/stores/user";
import { fetchSettingGet } from "@/http/setting";
import type { Http } from "@/interface/Http";
import { transformArtlabLanguageToIquiz, useDefaultLanguage } from "@/libs/useLanguageEnum";
import { fetchGradeList } from "@/http/grade";
import { useAuth } from "@/libs/useAuth";

const userInfoData = useUserInfo();
const locale = useI18n();
const route = useRoute();
const router = useRouter();
const [onAlertOpen, onAlertClose, alertShow, alertConfig] = useAlert();
provide(oAlert, onAlertOpen);
provide(cAlert, onAlertClose);
pub.subscribe(NET_ERROR_TIPS, (err: any) => {
  ElMessage({
    message: err[0],
    icon: "Warning", // 自定义图标
    type: "info",
    duration: 3000,
    offset: 50
  });
});

pub.subscribe(MESSAGE_BOX, (message?: any) => {
  ElMessage({
    message: message,
    icon: "Warning", // 自定义图标
    type: "info",
    duration: 3000,
    offset: 50
  });
  // if (alertState.value) return;
  // alertState.value = true;
  // ElMessageBox.alert("", {
  //   confirmButtonText: t('universal.confirm'),
  //   title: t('universal.title'),
  //   message: message[0],
  //   showClose: false,
  //   autofocus: true,
  //   // center: true,
  //   lockScroll: true,
  //   callback() {
  //     alertState.value = false;
  //   }
  // });
});
const requireMenu = computed(() => !RoutesDoNotRequireMenu.includes(route?.name as string));
const requireHeader = computed(() => !RoutesDoNotRequireHeader.includes(route?.name as string));
const getSetting = (userId: number) => {
  fetchSettingGet({
    userId: userId
  }).then((res: Http.Response<any>) => {
    if (res.code === 200 && res.data?.languageCode) {
      locale.locale.value = transformArtlabLanguageToIquiz(res.data.languageCode);
      window.localStorage.setItem("locale", res.data.languageCode);
    } else {
      const _locale = window.localStorage.getItem("locale");
      locale.locale.value = _locale ? transformArtlabLanguageToIquiz(_locale) : useDefaultLanguage();
    }
  });
};
const getGradeList = async (userId: number) => {
  const data: Http.Response<any> = await fetchGradeList({
    userId: userId,
    page: 1,
    pageSize: 100
  });
  if (data.code === 200) {
    window.localStorage.setItem("grade", JSON.stringify(data.data));
  }
};
watch(() => userInfoData.getUserInfo?.user, (cb) => {
  if (cb?.id) {
    getSetting(cb.id);
    getGradeList(cb.id);
  }
}, {
  immediate: true
});
watch(() => route.path, (cb, cb2) => {
  if (cb2 === "/login" && userInfoData.getUserInfo?.user?.id) {
    getSetting(userInfoData.getUserInfo.user.id);
    getGradeList(userInfoData.getUserInfo.user.id);
  }
});
 const userInfo = useAuth()
onBeforeMount(()=>{
  setTimeout(()=>{
    if(!userInfo?.info?.token){
      router.replace("/login");
    }
  },500)

})
</script>
<style scoped lang="scss">

@use "@/theme.scss" as theme;
.layout {
  padding: 0;
  margin: 0;
  overflow-y: hidden;
  height: calc(100vh - env(safe-area-inset-bottom, 20px) - env(safe-area-inset-top, 20px));
  font-family: MicrosoftYaHei, "Noto Sans SC", Roboto, "Helvetica Neue", Agency FB, Batang, ui-serif, sans-serif,
  system-ui, monospace, fangsong;
  //background-image: url("@/assets/bg.png");
  background-color: #F0F4FF;
  background-repeat: repeat;
  background-position: left top;
  background-size: 100px 100px;
  --el-main-padding: 20px 20px 0 20px;
  --el-font-family: MicrosoftYaHei, "Noto Sans SC", Roboto, "Helvetica Neue", Agency FB, Batang, ui-serif, sans-serif,
  system-ui, monospace, fangsong;
  --el-select-input-focus-border-color: theme.$main-bg-color;
  --el-input-focus-border: theme.$main-active-font-color;
  --el-input-focus-border-color: theme.$main-active-font-color;
  --el-color-primary: theme.$main-active-font-color;
  --el-button-hover-bg-color: theme.$main-active-font-color;
  &:deep(.el-textarea) {
    --el-input-focus-border: theme.$main-active-font-color;
    --el-input-focus-border-color: theme.$main-active-font-color;
  }

  &:deep(.el-input__wrapper.is-focus) {
    box-shadow: theme.$main-box-shadow-focus !important;
  }

  &:deep(.el-select-dropdown__item.selected) {
    color: theme.$main-active-font-color !important;
  }

  &:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: theme.$main-box-shadow-focus !important;
  }
}

.layout:deep(.el-pager li.is-active) {
  border-radius: 50%;
}

.layout:deep(.el-pagination.is-background .el-pager li) {
  background-color: transparent;
}

.layout:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--el-color-primary);
}

.layout:deep(.el-pagination.is-background) {
  background-color: transparent;
}

.layout:deep(.el-pagination.is-background .btn-prev) {
  background-color: transparent;
}

.layout:deep(.el-pagination.is-background .btn-prev:disabled) {
  background-color: transparent;
}

.layout:deep(.el-pagination.is-background .btn-next) {
  background-color: transparent;
}

.layout:deep( .el-pagination.is-background .btn-next) {
  background-color: transparent;
}

.layout:deep(.el-pagination.is-background .btn-next:disabled) {
  background-color: transparent;
}

.locale-zh {
  --menu-widh: 220px;
}

.locale-en {
  --menu-widh: 275px;
}

.alert-wrapper {
  position: fixed;
  left: 40vw;
  right: 40vw;
  top: 15vh;
  z-index: 99999;
  min-width: 280px;
}

.main {
  padding: 20px 20px 0 20px;
  background-color: #F0F4FF;
}

.main-without-padding {
  padding: 0 !important;
}

.main-menu {
  width: var(--menu-widh);
  height: calc(100%);
  position: relative;
  z-index: 101;
  box-sizing: border-box;
}

</style>
