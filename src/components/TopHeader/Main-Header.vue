<template>
  <div class="container">
    <div class="left">
      <el-image :src="logoPng" fit="contain" class="logo" @click="()=> router.push('/')" />
<!--      <TopicSetting v-if="isTopicGeneratePage" />-->
    </div>
<!--    <span class="title">-->
<!--      <img src="@/assets/logo.png" alt="LOGO" />-->
<!--    </span>-->
    <div class="right">
<!--      <div class="search">-->
<!--        <el-input-->
<!--          v-if="isHomePage"-->
<!--          class="custom-input input__default_theme"-->
<!--          v-model="headerInput.subjectName"-->
<!--          :placeholder="$t('header.header_item_line1')"-->
<!--          :clearable="false"-->
<!--          size="large"-->
<!--          @change="onChange"-->
<!--        >-->
<!--          &lt;!&ndash; 使用 suffix 插槽追加图标 &ndash;&gt;-->
<!--          <template #suffix>-->
<!--            <el-icon>-->
<!--              <Search />-->
<!--            </el-icon>-->
<!--          </template>-->
<!--        </el-input>-->
<!--      </div>-->
<!--      <div class="select" v-if="isHomePage" style="margin-left: 15px">-->
<!--        <div style="display: flex; align-items: center">-->
<!--          <span class="select-label">{{$t('header.header_item_line2')}}</span>-->
<!--          <div class="select-wrapper">-->
<!--            <el-select v-model="headerInput.grade"-->
<!--                       size="large"-->
<!--                       clearable-->
<!--                       @change="onChange"-->
<!--                       :placeholder="$t('header.header_item_line3')"-->
<!--                       class="input__default_theme defaultSelectTheme"-->
<!--                       style="border-radius: 10px">-->
<!--              <el-option-->
<!--                v-for="item in options"-->
<!--                :key="item.grade"-->
<!--                :label="item.grade === 0? $t(item.gradeName) : locale === 'EN'? 'K' + item.gradeName : item.gradeName + $t('grade.grade')"-->
<!--                :value="item.grade"-->
<!--              />-->
<!--            </el-select>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
      <el-button class="buttons-default header-preview" size="large" v-if="isTopicGeneratePage" icon="view" @click="onPreview">
        {{$t('header.header_item_line5')}}
      </el-button>
      <div class="lang">
        <context-menu :lang="locale"  language  @language-change="onContextSelect($event)" vertical >

        </context-menu>
      </div>
      <div class="right--user">

<!--        <div class="lang">-->
<!--          <el-popover-->
<!--            placement="bottom"-->
<!--            :width="100"-->
<!--            trigger="hover"-->
<!--          >-->
<!--            <template #reference>-->
<!--              <img src="@/assets/language.svg" alt="language" />-->
<!--            </template>-->
<!--            <div class="button-group">-->
<!--              <div :class="{'button-lang-item':true, 'button-lang-item-active':useLanguage.locale===item.value}"-->
<!--                   v-for="(item,index) of language" :key="index" @click="onLanguageChange(item.value)">-->
<!--                {{ item.label }}-->
<!--              </div>-->
<!--            </div>-->
<!--          </el-popover>-->
<!--        </div>-->
        <el-popover
          placement="bottom"
          :width="280"
          trigger="hover"
          ref="popover"
          v-if="String(userInfo.getUserInfo.user?.roleId) !== '1'"
        >
          <template #reference>
            <div class="user-avatar">
              <el-image size="default"
                        style="width:50px;height: 50px;border-radius: 50%;"
                        :class="{unBackground: getIcon?.endsWith('default.png')}"
                        :src="getIcon"
                        @error="handleAvatarError" fit="contain" />
            </div>
          </template>
          <el-button
            @click="onShowEdit"
            type="primary"
            size="small"
            :style="{width: i18n.locale.value==='en'? '120px':'100px',right: i18n.locale.value==='en'? 'calc(50% - 60px)':'calc(50% - 50px)'}"
            class="default__button-primary edit-handler">
            {{ $t("signUp.change_info") }}
          </el-button>
          <info-com />
        </el-popover>
        <div class="user-avatar" v-else>
          <el-image size="default"
                    :src="getIcon"
                    fit="contain"
                    style="width:50px;height: 50px;border-radius: 50%;
                        background-color: rgba(0, 0, 0, 0.3);"
                    :class="{unBackground: getIcon?.endsWith('default.png')}"
                    @error="handleAvatarError" />
        </div>
        <span class="user-name" :title="userInfo?.getUserInfo.user?.nickname">
          {{ userInfo?.getUserInfo.user?.nickname }}
        </span>

        <el-image v-if="String(userInfo?.getUserInfo?.user?.roleId) !== '1'"
                  :src="i18n.locale.value === 'zh_hant'? vipIcon:vipIcon_en"
                  @click="toRecharge"
                  alt="vip-icon"
                  title="vip"
                  fit="cover"
                  class="vip-icon" mode="aspectFill"></el-image>
      </div>
      <div class="split"></div>
      <el-image :src="logoutIcon" @click="onLogout"
                title="logout"
                class="logout-icon"></el-image>
    </div>
  </div>
  <MessageBox v-model:visible="visible" height="466px" width="420px">
    <SignUp :show-back="false"
            is-update
            hide-password
            :data-source="userInfo.getUserInfo?.user"
            @finish="onUpdateDone" />
  </MessageBox>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
// import { enumLanguage } from "@/enum";
// import { useLanguageStore } from "@/stores/language";
import { useI18n } from "vue-i18n";
import { useUserInfo } from "@/stores/user";

import { useRoute, useRouter } from "vue-router";

import defaultIcon from "@/assets/default-user-icon.png";
import logoutIcon from "@/assets/logout.png";
import vipIcon from "@/assets/vip.png";
import vipIcon_en from "@/assets/vip_en.png";
import { useAuth } from "@/libs/useAuth";
import InfoCom from "@cs/Info-Com/Info-Com.vue";
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import SignUp from "@vs/Sign-up/Sign-Up.vue";
import type { User } from "@/interface/User";
// import TopicSetting from "@cs/TopHeader/Topic-Setting/Topic-Setting.vue";
import logoPng from "@/assets/logo.png";
import { useHeaderInputStore } from "@/stores/headerInput";
import type { HeaderInput } from "@/interface/HeaderInput";
import ContextMenu from "@cs/Context-Menu/Context-Menu.vue";
import { fetchUpdateLanguage } from "@/http/language";
import { transformIquizLanguageToArtlab, useLanguageEnum } from "@/libs/useLanguageEnum";
import type { Http } from "@/interface/Http";


//const useLanguage = useLanguageStore();
const userInfo = useUserInfo();
const i18n = useI18n();
const visible = ref(false);
const router = useRouter();
const auth = useAuth();
const languageEnum = useLanguageEnum();
const isTopicGeneratePage = ref(false);
const route = useRoute();
const isHomePage = ref(true);
const headerInputStore = useHeaderInputStore();

//const showPopover = ref(true);
//const userInfoStore = useUserInfoStore();
const options = ref<{grade: number, gradeName:string}[]>([]);

const {locale} = useI18n();
const headerInput = reactive<HeaderInput.Data>({
  grade: headerInputStore.inputData?.grade || 0,
  subjectName: headerInputStore.inputData.subjectName
});


const onChange = ()=> {
  headerInputStore.setData(headerInput);
}
// const organizationList = ref<{ name: string, id: number }[]>([]);
//const language = reactive<{ label: string, value: string }[]>(enumLanguage);
const avatarUrl = ref();
const loading = ref(false);
// const showMessage = ref(false);
// const onLanguageChange = (value: string) => {
//   i18n.locale.value = value;
//   useLanguage.changeLanguage(value);
// };
const logoutLoading = ref(false);
const popover = ref();
const onLogout = () => {
  auth.logout();
  router.push(({
    path: "/login"
  }));
};
const handleAvatarError = () => {
  // 如果图片加载失败，切换到默认头像
  avatarUrl.value = defaultIcon;
};
const getIcon = computed(() => {
  console.log(userInfo.getUserInfo.user?.remark)
  return userInfo.getUserInfo.user?.remark || defaultIcon
});
watch(logoutLoading, (newValue) => {
  if (newValue) {
    setTimeout(() => logoutLoading.value = false, 2000);
  }
});

const toRecharge = () => {
  router.push("/recharge");
};
const onShowEdit = () => {
  popover.value?.hide();
  visible.value = true;
};
const onUpdateDone = (loginName: string, password: string, res: User.UserInfo) => {
  /**
   *   formData.username = props.dataSource?.username as string;
   *   formData.sex = props.dataSource?.sex as number;
   *   formData.nickname = props.dataSource?.nickname as string;
   *   formData.institution = props.dataSource?.institution;
   *   avatarUrl.value = props.dataSource?.remark;
   *
   */
  userInfo.setUserInfo("username", res.username);
  userInfo.setUserInfo("sex", res.sex);
  userInfo.setUserInfo("nickname", res.nickname);
  userInfo.setUserInfo("institution", res.institution);
  userInfo.setUserInfo("remark", res.remark);
  setTimeout(() => {
    visible.value = false;
  }, 800);
};
const onContextSelect = (event:any)=> {
 const targetLanguage = transformIquizLanguageToArtlab(event);
  fetchUpdateLanguage({
    userId: userInfo.getUserInfo?.user?.id,
    languageCode: targetLanguage,
    languageName: languageEnum.find(it=> it.value === targetLanguage)?.label
  }).then((res:Http.Response<any>)=>{
    if(res.code === 200){
      locale.value = event;
      window.localStorage.setItem("locale",targetLanguage);
    }
  })
}
// watch(userInfo?.getUserInfo, (newValue) => {
//   if (newValue?.roleId && newValue.nickname) {
//   //  getOrganize();
//   }
// }, {
//   immediate: true
// });

watch(loading, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      loading.value = false;
    }, 5000);
  }
});
watch(route, (newValue) => {
  isHomePage.value = newValue.path === "/question-home";
  isTopicGeneratePage.value = newValue.path === "/question-generation";
  // if(newValue.name === "home" && userInfoStore.userInfo?.grade) {
  //   options.value = userInfoStore.userInfo.grade.map((it:Grade.Item)=> {
  //     return {
  //       gradeName: it.gradeName,
  //       grade: it.id
  //     }
  //   })
  //   options.value.unshift({
  //     gradeName: 'grade.no_restrictions',
  //     grade: 0
  //   })
  // }
});
</script>

<style scoped  lang="scss">
@import "@/theme";

.user-info {
  position: relative;
  .user-name {
    position: relative;
    text-align: center;
    padding: 5px 10px;
    font-weight: 600;
    .user-icon {
      transform: translateY(5px);
      color: #4f8dd5;
      font-size: 18px;
      display: none;
    }
  }
  .logout {
    text-align: center;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 50px;
  }
}
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  position: relative;
  z-index: 100;
  height: $header-bar-height;
  box-sizing: border-box;

  .left {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    width: 24%;
    min-width: 140px;
    max-width: 465px;
  }
}
.search {
  background: #f0f3f6;
}
.header-preview {
  position: absolute;
  right: 405px;
  width: 130px;
  display: none;
  .preview-item {
    display: flex;
    justify-content: space-around;
    width: 80px;
    align-items: center;
    img {
      width: 24px;

    }
  }
}

.logo {
  width: 200px;
  height: auto;
  cursor: pointer;
}
.select {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
}
.select-label {

  font-weight: 600;
  color: #43536c;

  font-size: 16px;
  min-width: 90px;
  text-align: right;
  padding-right: 8px;
}


.select-wrapper {
  width: 130px;
  background: #eeeeee;
}
.users {
  position: relative;
  img[alt="renewal"] {
    position: absolute;
    bottom: 0;
    width: 80%;
    right: 0;
    transform: translate(8px, 5px);
  }
}
.container {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  background-size: cover;
  box-shadow: 0px 4px 8px 1px rgba(180, 180, 180, 0.2);
  padding: 0 20px;
  box-sizing: border-box;
  color: #f1f1f1;
  background-color: #fff;
  z-index: 10;
}
.logo {
  width: 240px;
  height: auto;
  cursor: pointer;
}
.title {
  font-size: 24px;
  user-select: none;
}

.title img {
  width: 200px;
  margin-top: 6px;
}

.unBackground {
  background-color: transparent !important;
}

.right {
  display: flex;
  justify-content: flex-end;
  color: #43536C;
  font-weight: 600;
  text-align: center;
  align-items: center;
  min-width: max(420px, 20%);
  max-width: max(800px, 24%);
}

.button-lang-item {
  margin: 5px 0;
  cursor: pointer;

}

.button-lang-item:hover {
  color: #337ab2;
  cursor: pointer;
}

.lang img {
  width: 25px;
  height: 25px;
  margin-top: 5px;
}

.right--user {
  display: grid;
  grid-template-columns:  60px auto auto;
  color: #43536C;
  font-weight: 600;
  align-items: center;
  margin-left: 20px;
  min-width: 250px;
  .lang {
    width: 50px;
    display: flex;
    align-items: center;
    margin-left: 10px;
  }
}

.user-avatar {
  justify-self: end;
  overflow: hidden;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logout-icon {
  width: 24px;
  min-width: 24px;
  padding-left: 15px;
  justify-self: end;
  cursor: pointer;
}
.split {
  height: 15px;
  width: 2px;
  background-color: #c5c5c5;
  transform: translateX(3px);
}
.vip-icon {
  width: 70px;
  margin-top: 5px;
  cursor: pointer;
}

.user-name {
  justify-self: center;
  padding-left: 8px;
  padding-right: 8px;
  max-width: 120px;
  white-space: nowrap; /* 禁止文本换行 */
  overflow: hidden; /* 隐藏溢出的内容 */
  text-overflow: ellipsis; /* 超出显示省略号 */
}

.button-lang-item-active {
  color: #337ecc;
}

.edit-handler {
  position: absolute;
  z-index: 1;
  right: calc(50% - 50px);
  bottom: 18px;
  height: 34px;
  width: 100px;
}

.edit-handler:hover {
  color: #ececec;
  cursor: pointer;
  background-color: #076ce8;
}
</style>
