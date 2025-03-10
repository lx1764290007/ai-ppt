<template>
  <div class="home-wrapper">
   <subject-toolbar @search="(value:any)=> dataSource = value" :grade-id="gradeId" />
    <grades-bar @change="(id:number)=> fetchData(id)" :show-question="false" />
    <el-skeleton style="display: grid;justify-content: space-between;grid-auto-flow: dense; grid-template-columns:repeat(auto-fill, 210px); overflow-y: hidden" loading animated
                 v-if="loading">
      <template #template>
        <el-skeleton-item variant="rect" :class="['item',reading? 'un-min-height-ske':'']" style="width: 210px;height: 306px;margin: 15px 15px;"
                          v-for="_item of 30" :key="_item" />
      </template>
    </el-skeleton>
    <el-scrollbar class="home-container" v-else-if="!loading && dataSource.length >= 0" :always="false">
      <div class="home-items--wrapper" :style="{'justify-content':dataSource.length<4? 'flex-start':'space-between'}">
        <div :class="['item-wrapper',reading? 'un-min-height':'']" v-for="(item,i) of dataSource" :key="i" v-loading="item.loading">
          <div :class="['item', reading? 'un-min-height':'']" @click="onItemClick(item)">
            <el-image class="img-content" :src="item.subjectImg" fit="cover" />
            <div :class="['item__content',reading? 'un-min-height':'']">
              <h3 class="item__title" :title="item.subjectName">
                {{ item.subjectName || (locale === "en" ? item.subjectNameEn : locale === "zh_hant" ? item.subjectNameHk : item.subjectCn) }}</h3>
              <p class="item__type" v-if="!reading"><span
                style="font-weight: 600;">{{ locale === "en" ? "K" : "" }}{{ getCurrentGrade(item.gradeId)
                }}{{ locale !== "en" ? $t("grade.grade") : "" }}</span>
              </p>
              <p class="item__type" v-if="!reading"><span style="font-weight: 600">{{ item.subjectTypeSize || 0 }}</span>
                {{ $t("home.home_item_line1") }}</p>
              <p class="item__total" v-if="!reading"><span style="font-weight: 600">{{ item.questionSize || 0 }}</span>
                {{ $t("home.home_item_line2") }}</p>
              <p class="item__description" v-if="!reading"><span style="font-weight: 600">{{ item.answersNum || 0 }}</span>
                {{ $t("home.home_item_line3") }}</p>
            </div>
          </div>
          <div class="context-btn" @click.stop>
            <ContextMenu @select="onContextSelect($event, item)" />
          </div>
        </div>
        <!--      <div class="item-wrapper">-->
        <!--        <div class="item-add-last" @click="onAddTopic">-->
        <!--          <img src="@/assets/add.webp" type="image/png" class="item-add-last&#45;&#45;icon" alt="add" />-->
        <!--          <span class="item-add-last&#45;&#45;text">-->
        <!--          {{ $t("home.home_item_line4") }}-->
        <!--        </span>-->
        <!--        </div>-->
        <!--      </div>-->
      </div>
      <div style="height: 25px"></div>
    </el-scrollbar>

  </div>
  <classification-component :current-grade="search.grade"
                            :grade-list="gradeList"
                            :visible="showTopicEdit"
                            @close="onClose" :data="activeItem" />
  <el-empty :description="$t('universal.empty')" style="left: 55%" class="empty" image-size="120"
            v-if="!loading && dataSource.length < 1"></el-empty>
  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("home.tips") }}
         </span>
      <span class="confirm-title">{{ $t("home.beforeDeleted") }}?</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary" style="width: 90px" @click="()=>onDelete()">
          {{ $t("home.confirm") }}
        </el-button>
        <el-button class="buttons-default" @click="showConfirm = false" style="width: 90px;margin-right: 0">
          {{ $t("home.cancel") }}
        </el-button>
      </el-space>
    </div>
  </popup-component>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from "vue";
import type { TopicOverview } from "@/interface/TopicOverview";
import ContextMenu from "@cs/Context-Menu/Context-Menu.vue";
import { useRouter } from "vue-router";
import { MENU_TYPE } from "@cs/Context-Menu/ENUM";
import ClassificationComponent from "@cs/Classification/Classification-Component.vue";
import { fetchTopicCopy, fetchTopicDelete, fetchTopicList } from "@/http/topic";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import { useI18n } from "vue-i18n";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { Warning } from "@element-plus/icons-vue";
import { ElScrollbar } from "element-plus";
import SubjectToolbar from "@cs/Subject-Toolbar/Subject-Toolbar.vue";
import GradesBar from "@cs/Grade/Grades-Bar.vue";
import { setActiveGrade } from "@vs/Reading-Comprehension/activeGrade";


const emit = defineEmits<{
  (ev: "select", value: TopicOverview):void
}>()
const props = defineProps<{
  reading?: boolean
}>()
const showConfirm = ref(false);

const userInfoStore = useUserInfo();
const search = reactive({ name: "", grade: "" });
const dataSource = ref<(TopicOverview & { loading: boolean })[]>([]);
const router = useRouter();
const gradeList = ref<{ label: string, id: number }[]>([]);
const showTopicEdit = ref(false);
const loading = ref(false);
const gradeId = ref<number>();
const { locale, t } = useI18n();
let activeItem = ref<TopicOverview | undefined>();


const activeValue = ref();


const onItemClick = (item: TopicOverview) => {
  // router.push({
  //   name: "subject-page",
  //   query: {
  //     id: item.id,
  //     title: item.subjectName || (locale.value === "en" ? item.subjectNameEn : locale.value === "zh_hant" ? item.subjectNameHk : item.subjectNameCn)
  //   }
  // });
  emit("select", item);
};
const onCopy = () => {
  const index = dataSource.value.findIndex(it => it.id === activeItem.value?.id);
  if (index > -1) {
    dataSource.value[index].loading = true;
  }
  fetchTopicCopy({
    subjectId: activeItem.value?.id
  }).then((res: Http.Response<TopicOverview>) => {
    if (res.code === 200) {
      dataSource.value.push({
        ...res.data,
        loading: false
      });
    }
  }).finally(() => {
    index > -1 && (dataSource.value[index].loading = false);
  });
};

const onConfirmDelete = () => {
  showConfirm.value = true;
};



const getCurrentGrade = (id: number) => gradeList.value.find(it => it.id === id)?.label;
const onContextSelect = (type: number, item: TopicOverview) => {
  activeItem.value = item;
  switch (type) {
    case MENU_TYPE.EDIT:
      showTopicEdit.value = true;
      break;
    case MENU_TYPE.COPY:
      onCopy();
      break;
    case MENU_TYPE.DELETE:
      onConfirmDelete();
      break;
  }
};
const fetchData = (id:number) => {
  gradeId.value = id;
  setActiveGrade(id);
  loading.value = true;
  fetchTopicList({
    userId: userInfoStore?.getUserInfo?.user?.id,
    gradeId: id,
    subjectName: search.name
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.data) {
      dataSource.value = res.data.map(it => {
        return {
          ...it,
          loading: false
        };
      });
    }
  }).finally(() => {
    loading.value = false;
  });
};
const onDelete = () => {
  showConfirm.value = false;
  const index = dataSource.value.findIndex(it => it.id === activeItem.value?.id);
  if (index > -1) {
    dataSource.value[index].loading = true;
  }

  fetchTopicDelete({
    subjectId: activeItem.value?.id
  }).then((res: Http.Response<undefined>) => {
    if (res.code === 200) {
      if (index > -1) {
        dataSource.value.splice(index, 1);
      }
    }
  }).catch(() => {
    if (index > -1) {
      dataSource.value[index].loading = false;
    }
  });
};
const onClose = (refresh: boolean) => {
  if (!refresh) {
    activeItem.value = undefined;
  }
  if (refresh) {
    fetchData(gradeId.value as number);
  }
  showTopicEdit.value = false;
};

onBeforeMount(() => {


});


</script>

<style scoped lang="scss">
@import "@/theme.scss";

.un-min-height {
  min-height: auto !important;
}
.un-min-height-ske {
  min-height: auto !important;
  height: 229px !important;
}
.home-wrapper {
  overflow-y: hidden;
  background-color: transparent;
  height: calc(100vh - $header-bar-height - 20px);
  position: relative;

  .home-container {
    position: relative;
    height: calc(100vh - 60px - 62px - 70px);
    padding-top: 10px;
    box-sizing: border-box;
    :deep(.el-scrollbar__wrap) {
      width: 100%;
      box-sizing: border-box;
    }
    .home-items--wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fill, 260px);
      row-gap: 25px;
      justify-content: space-between;
      grid-auto-flow: dense;
      justify-items: center;
    }
  }
}

.item-add-last--icon {
  margin: 0 auto;
  max-width: 50%;
  position: absolute;
  left: 25%;
  top: 50px;
}

.item-add-last--text {
  width: 100%;
  text-align: center;
  top: 180px;
  position: absolute;
}

.item-wrapper,
.item-wrapper-add {
  box-sizing: border-box;
  border-radius: 10px;
  width: 240px;
  min-height: 310px;
  position: relative;
  transition: all 0.2s ease-in-out;
  box-shadow: 14px 14px 30px 0px #BDC3D3;
  display: inline-block;
  overflow-y: hidden;

  &:hover {
    // box-shadow: $main-box-shadow2;
    cursor: pointer;
  }

  .item-add-last {
    height: 100%;
    background-color: #fff;
    position: absolute;
    width: 240px;
    box-sizing: border-box;
    border-radius: 10px;
    transition: all 0.2s ease-in-out;
    box-shadow: 14px 14px 30px 0px #BDC3D3;
    z-index: 1;
  }

  .item {
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 10px;
    overflow: hidden;
    min-height: 256px;

    .img-content {
      width: 240px;
      height: calc(240px * 3 / 4);
      overflow: hidden;
    }

    p,
    h3 {
      margin-block-end: 0;
      margin-block-start: 0;
      font-size: smaller;
    }

    p {
      color: #43536c;
      font-size: 14px;
    }

    h3 {
      font-size: larger;
      padding: 0;
    }
  }
}

.item-add {

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.item__content {
  padding: 10px 15px;
  border-top: 1px solid #efefef;
  font-size: 16px;
  min-height: 109px;
  .item__description {
    width: 80%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.item-wrapper-add {

  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  img {
    width: 40%;
    transition: width 0.2s ease-in-out;
    object-fit: cover;

    &:not(:last-of-type):hover {
      width: 72%;
    }
  }

  p {
    font-size: smaller;
    font-weight: 600;
  }
}

.context-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
}

.item__title {
  color: #43536C;
  width: 210px;
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  position: fixed;
  top: 30%;
  left: 50%;
}

.confirm-wrapper {
  width: 330px;
  height: 160px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  position: relative;

  .confirm-tip {
    position: absolute;
    left: 20px;
    top: 10px;
    font-size: 16px;
    font-weight: 600;
  }

  .confirm-title {
    font-weight: normal;
    padding: 30px 0 0 0;
    font-size: 16px;
  }
}

.tab__component-wrapper-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  box-sizing: border-box;
  padding-bottom: 12px;
}

.tab__component-wrapper-header-item {
  flex-shrink: 0;
  background-color: #fff;
  color: #43536C;
  font-size: 15px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  min-width: 100px;
  transition: all .2s;
  position: relative;
  overflow: visible;
  text-align: center;
  border: 1px solid #DBE0ED;
}

.tab__component-wrapper-header-item:hover {
  background-color: $main-active-font-hover-color;
  color: #f1f1f1;
}

.tab__component-wrapper-header-item + .tab__component-wrapper-header-item {
  margin-left: 12px;
}

.tab__component-icon-left {
  position: absolute;
  left: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}

.tab__component-icon-right {
  position: absolute;
  right: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}

.tab__component-icon-delete {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  font-size: 14px;
  cursor: pointer;
  color: red;
}
</style>
