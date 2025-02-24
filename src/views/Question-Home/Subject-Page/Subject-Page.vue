<template>
  <div class="subject-page-wrapper">
    <header class="subject-page-header" ref="header">
      <el-button class="go-back-btn buttons-default" size="large" @click="()=> onBack()">
        <el-image :src="backIcon" fit="contain" alt="back" style="width: 20px" />
      </el-button>
      <span style="color: #43536C">{{ backTitle }}</span>
      <el-form @submit.prevent="onSearch" class="search-form" inline>

        <el-input type="text"
                  :placeholder="$t('subject.search')"
                  size="large"
                  prefix-icon="search"
                  @change="onSearch"
                  v-model="searchValue"
                  clearable class="input__default_theme search" />
        <el-button type="primary" native-type="submit" class="default__button-primary" style="margin-left: 5px;margin-right: 10px">
          {{$t('universal.search')}}
        </el-button>
        <el-button type="primary" class="default__button-primary" @click.stop="onTopicTypeAdd" style="margin-left: 5px;margin-right: 10px">
          <el-image :src="addIcon" alt="icon" fit="contain" style="width:16px;margin-right: 5px" />
          {{$t('subject.add')}}{{$t('subject.questionBank')}}
        </el-button>
      </el-form>

    </header>
    <div style="position: relative; box-sizing: border-box" ref="main">
      <el-icon class="icon-arrow--left" @click="onHandleScroll(-1)" v-if="topicTypeDataSource.length >=3">
        <ArrowLeft />
      </el-icon>
      <el-icon class="icon-arrow--right" @click="onHandleScroll(1)" v-if="topicTypeDataSource.length >= 3">
        <ArrowRight />
      </el-icon>
      <el-scrollbar native ref="scrollRef" @scroll="onScroll" class="scrollbar-hidden">
        <main class="subject-item-wrapper" v-if="topicTypeLoading">
          <el-skeleton style="width:100vw;display: flex;justify-content: space-around" loading animated>
            <template #template>
              <el-skeleton-item variant="rect" style="width: 180px; height: 110px;margin-left: 20px" v-for="_item of 5"
                                :key="_item" />
            </template>
          </el-skeleton>
        </main>
        <main class="subject-item-wrapper" v-if="!topicTypeLoading && topicTypeDataSource.length > 0">
          <div
            :class="{'subject-item':true}"
            v-for="(item,i) of topicTypeDataSource"
            :key="i"
            @click="onSelect(item.id)"
            :data-content="item.typeName"
          >
            <div class="content-menu" @click.stop>
              <ContextMenu vertical color="#444" @select="onContextSelect($event, item)">
              </ContextMenu>
            </div>
            <div :class="{'subject-item-img':true,'subject-item__active': activeId === item.id}" :title="item.typeName">
              <el-image
                class="preview--image"
                :scroll-container="scrollRef"
                :src="item.typeImg"
                fit="cover"
                crossorigin-="anonymous"
              />
            </div>
          </div>
        </main>
        <main class="subject-item-wrapper" v-if="!topicTypeLoading && topicTypeDataSource.length === 0">
             <span class="empty">
               {{ $t("subject.noQuestionBank") }}
             </span>
        </main>
      </el-scrollbar>
    </div>
    <el-scrollbar :style="{ height: sectionHeight }">
      <section class="section-wrapper">
        <el-skeleton loading animated v-if="loading || topicTypeLoading">
          <template #template>
            <el-skeleton-item variant="rect" style="width: 100%; height: 40px; margin-top: 20px;display: block"
                              v-for="_item of 6" :key="_item" />
          </template>
        </el-skeleton>
        <p class="empty_" v-if="!loading && dataSource.length<1 && !topicTypeLoading">
          {{ $t("subject.noTopic") }}
        </p>
        <div class="section-item" v-for="(item, index) of dataSource" :key="index"
             v-show="!loading && !topicTypeLoading">
          <span class="title-type">{{ page * PAGE_SIZE - PAGE_SIZE + index + 1
            }}-{{ $t(getQuestType(item.type) as string) }}</span>
          <span class="question">{{ item.question }}</span>
          <div class="handler">
            <el-icon class="icon" @click="toGenerateQuestion(item.id)">
              <Edit />
            </el-icon>
            <el-icon class="icon" @click="onDeleteItem(item.id,index)" v-loading="item.deleteLoading">
              <Delete />
            </el-icon>
          </div>
        </div>
      </section>
      <div style="height: 85px;"></div>
    </el-scrollbar>
    <div class="pagination" v-if="dataSource.length > 0">
      <el-button type="primary" size="large"
                 :class="{'buttons-primary':true, 'start-game-button':true, 'start-game-button-en':locale==='EN'}"
                 @click="()=>openGame(0)">
        {{ $t("subject.startGame") }}
      </el-button>
      <el-button type="primary" size="large"
                 :class="{'buttons-primary':true, 'start-game-button2':true, 'start-game-button-en2':locale==='EN'}"
                 @click="()=>openGame(1)">
        {{ $t("subject.shareGame") }}
      </el-button>
      <el-pagination
        v-model:current-page="page"
        background

        layout="prev, pager, next"
        @current-change="onPageChange"
        :total="total"
        :page-size="PAGE_SIZE"
        @change="onPageChange"
      />
    </div>
  </div>
  <subject-editor :visible="subjectEditShow"
                  @close="onEditClose"
                  :data="activeItem"
                  :subject-id="route.query.id" />
  <popup-component v-model:modalValue="showGame">
    <start-game :subject-type-id="activeId" @close="showGame = false" :action="action" />
  </popup-component>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { ArrowLeft, ArrowRight, Delete, Edit } from "@element-plus/icons-vue";
import addIcon from "@/assets/question-bank-icon.png";
import { useRoute, useRouter } from "vue-router";
import ContextMenu from "@cs/Context-Menu/Context-Menu.vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import StartGame from "@cs/Start-Game/Start-Game.vue";
import { useTopicDict } from "@/libs/useTopicDict";
import SubjectEditor from "@cs/Subject-Editor/Subject-Editor.vue";
import { MENU_TYPE } from "@cs/Context-Menu/ENUM";
import { fetchTopicTypeCopy, fetchTopicTypeDelete, fetchTopicTypeList } from "@/http/topic";
import { fetchDeleteItem, fetchQuestionList } from "@/http/question";
import type { TopicType } from "@/interface/TopicOverview";

import type { Http } from "@/interface/Http";
import { useUserInfo } from "@/stores/user";
import type { QuestionAnswer } from "@/interface/Topic";
import { ElMessage, type ElScrollbar } from "element-plus";
import { useI18n } from "vue-i18n";
import backIcon from "@/assets/back.png";

const PAGE_SIZE = 12;

interface DataItem extends QuestionAnswer {
  deleteLoading: boolean;
}

const userInfoStore = useUserInfo();
const action = ref<0 | 1>(0);
const scrollRef = ref<typeof ElScrollbar>();
const topicTypeDataSource = ref<TopicType[]>([]);
const searchValue = ref<string>();
const router = useRouter(),
  showGame = ref(false),
  route = useRoute();
const header = ref(),
  topicTypeLoading = ref(false),
  main = ref();
const page = ref(1);
const activeId = ref<number>();
let scrollLeft: number = 0;
const ITEM_WIDTH = 200;

let backTitle = "";
const { locale,t } = useI18n();
const total = ref(0);
const topicDict = useTopicDict();
const loading = ref(false);
const subjectEditShow = ref(false);

const activeItem = ref<TopicType | undefined>();

const onHandleScroll = (event: number) => {
  if (scrollRef.value) {
    if (event < 0) {
      if (scrollLeft < ITEM_WIDTH) {
        scrollRef.value.setScrollLeft(0);
      } else {
        scrollRef.value.setScrollLeft(
          Math.floor(scrollLeft / ITEM_WIDTH) * ITEM_WIDTH - ITEM_WIDTH < 0
            ? 0
            : Math.floor(scrollLeft / ITEM_WIDTH) * ITEM_WIDTH - ITEM_WIDTH
        );
      }
    } else if (event > 0) {
      scrollRef.value.setScrollLeft(Math.ceil(scrollLeft / ITEM_WIDTH) * ITEM_WIDTH + ITEM_WIDTH);
    }
  }
};
const dataSource = ref<DataItem[]>([]);
const onScroll = (event: { scrollLeft: number }) => {
  scrollLeft = event.scrollLeft;
};
const onEditClose = (result?: boolean, data?: TopicType) => {

  if (data && result) {
    topicTypeDataSource.value.push(data);
    if(topicTypeDataSource.value.length === 1) {
      activeId.value = topicTypeDataSource.value[0].id;
    }

  } else if (data && !result) {
    const index = topicTypeDataSource.value.findIndex((item) => item.id === data.id);
    if (index > -1) {
      topicTypeDataSource.value[index] = data;
    }
  }
  subjectEditShow.value = false;
};
const onSelect = (id: number) => {
  if (activeId.value === id) {
    return;
  } else activeId.value = id;
  page.value = 1;
  getDataSource();
};
const onSearch = () => {
  getDataSource();
};

const onTopicTypeAdd = () => {
  activeItem.value = undefined;
  subjectEditShow.value = true;
};
const onTopicTypeDelete = () => {
  fetchTopicTypeDelete({
    subjectTypeId: activeItem.value?.id
  }).then((res: Http.Response<any>) => {
    if (res.code === 200) {
      const index = topicTypeDataSource.value.findIndex(it => it.id === activeItem.value?.id);
      if (index > -1) {
        topicTypeDataSource.value.splice(index, 1);
        if (activeItem.value?.id === activeId.value) {
          activeId.value = undefined;
          if (topicTypeDataSource.value.length === 0) {
            dataSource.value.length = 0;
          } else {
            activeId.value = topicTypeDataSource.value[0].id;
            getDataSource();
          }
          // getDataSource();
        }
      }
    }
  });
};
onBeforeMount(() => {
  backTitle = route.query.title;
  const userId = route.query.userId;
  if(userId && String(userId) !== String(userInfoStore.getUserInfo?.user?.id)) {
    ElMessage({
      message: t("universal.userError"),
      icon: "Warning", // 自定义图标
      type: "error",
      duration: 4000,
      offset: 50
    });
    router.replace("/");
  }
  if(route.query.subjectTypeId){
    activeId.value = parseInt(route.query.subjectTypeId)
  }
});
const messageListener = (data: any) => {
  console.log("----Received message from parent:----", data);
  if (data && data.data?.type === "close") {
    showGame.value = false;
  }

};
onMounted(() => {
  window.addEventListener("message", messageListener);
});
onBeforeUnmount(() => {
  window.removeEventListener("message", messageListener);
});
const onBack = () => {
  router.push("/question-home");
};
const openGame = (ac: 0 | 1) => {
  action.value = ac;
  showGame.value = true;
};
const getQuestType = (type: number) => {
  return topicDict.find((item) => item.value === type)?.label;
};
const toGenerateQuestion = (id: number) => {

  router.push({
    name: "question-generation",
    query: {
      page: page.value,
      pageSize: PAGE_SIZE,
      subjectTypeId: activeId.value,
      subjectId: route.query.id,
      id
    }
  });
};
const getDataSource = () => {
  if (!activeId.value) return;
  loading.value = true;
  fetchQuestionList({
    subjectTypeId: activeId.value,
    subjectId: route.query.id,
    page: page.value,
    pageSize: PAGE_SIZE,
    questionText: searchValue.value
  }).then((res: Http.Response<QuestionAnswer[]>) => {
    if (res.code === 200) {
      dataSource.value = res.data.map(it => {
        return {
          ...it,
          deleteLoading: false
        };
      });
      total.value = res.total || 0;
    }
  }).finally(() => loading.value = false);
};
const onCopy = () => {
  fetchTopicTypeCopy({
    subjectTypeId: activeItem.value?.id
  }).then((res: Http.Response<TopicType>) => {
    if (res.code === 200) {
      topicTypeDataSource.value.push(res.data);
    }
  });
};
const onContextSelect = (type: number, item: TopicType) => {
  activeItem.value = item;
  switch (type) {
    case MENU_TYPE.EDIT:
      subjectEditShow.value = true;
      break;
    case MENU_TYPE.COPY:
      onCopy();
      break;
    case MENU_TYPE.DELETE:
      onTopicTypeDelete();
      break;
  }
};
const sectionHeight = computed(() => {
  let headerHeight = 0,
    mainHeight = 0;
  if (header.value && main.value) {
    headerHeight = header.value.getBoundingClientRect().height;
    mainHeight = main.value.getBoundingClientRect().height;
  }
  return `calc(100vh - 75px - ${headerHeight}px - ${mainHeight}px - 20px - 20px)`;
});
const getData = (refreshTopic = true) => {
  topicTypeLoading.value = true;
  fetchTopicTypeList({
    subjectId: route.query?.id,
    userId: userInfoStore?.getUserInfo?.user?.id
  }).then((res: Http.Response<TopicType[]>) => {
    if (res.code === 200) {
      topicTypeDataSource.value = res.data;
      activeId.value = activeId.value || res.data[0]?.id;
      refreshTopic && getDataSource();
    }
  }).finally(() => topicTypeLoading.value = false);
};
const onPageChange = () => {
  getDataSource();
};
const onDeleteItem = (id: number, index: number) => {
  dataSource.value[index].deleteLoading = true;
  fetchDeleteItem({
    id
  }).then((res: Http.Response<undefined>) => {
    if (res.code === 200) {
      dataSource.value.splice(index, 1);
      if (dataSource.value.length < 1) {
         page.value = 1;
         onPageChange();
      }
      // ElMessage({
      //   message: "已删除",
      //   icon: "Select", // 自定义图标
      //   type: "success",
      //   duration: 2000,
      //   offset: 50
      // });
    }
  }).finally(() => {
    if (dataSource.value[index]) {
      dataSource.value[index].deleteLoading = false;
    }
  });
};
watch(loading, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      loading.value = false;
    }, 8000);
  }
});
onBeforeMount(() => {
  getData();

});
</script>
<style scoped lang="scss">
@import "@/theme";

$width: 180px;
$height: calc($width / 4 * 3);
.scrollbar-hidden {
  border-bottom: 1px solid #e7e7e7;

  &:deep(.el-scrollbar__wrap) {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */
    &::-webkit-scrollbar {
      width: 0; /* 对于水平滚动条 */
      height: 0; /* 对于垂直滚动条 */
    }
  }
}

.subject-page-wrapper {
  position: relative;
  box-sizing: border-box;

  .empty {
    --el-empty-padding: 0;
    margin: 0 auto;
    color: #adadad;
    font-size: 14px;
  }

  .subject-item-wrapper {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    position: relative;
    margin-top: 10px;
    overflow: visible;
    min-height: 150px;

    .subject-item__active {
      box-shadow: 0 0 0 4px $main-confirm-bg-color !important;
    }

    .subject-item {
      flex-shrink: 0;
      width: $width;
      height: $height;
      background-color: #f0f2f5;
      color: #fff;
      position: relative;
      display: flex;
      flex-flow: column nowrap;
      justify-content: space-around;
      align-items: center;
      box-sizing: content-box;
      padding-bottom: 35px;
      margin: 0 15px;

      &::after {
        content: attr(data-content);
        position: absolute;
        color: #333;
        font-weight: 600;
        transform: translateY(87px);
        white-space: nowrap;
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 170px;
      }

      .subject-item-img {
        box-shadow: 0 0 0 2px #b6b6b6;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-around;
        align-items: center;
        box-sizing: border-box;
        border-radius: 10px;
        overflow: hidden;
        width: 100%;
        height: 100%;
        margin: 0 10px;


        &:hover {
          box-shadow: 0 0 0 2px $main-active-font-hover-color;
          cursor: pointer;
        }

        .preview--image {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .subject-page-header {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    padding: 0 10px;
    height: 50px;
    box-sizing: border-box;
    .search-form {
      position: absolute;
      right: 0;
      display: flex;
      align-items: center;
      margin-right: 10px;
      .add-icon {
        width: 40px;
        margin-left: 20px;

        &:hover {
          cursor: pointer;
          box-sizing: border-box;
        }
      }

      .search {
        width: 220px;
      }
    }

    .back {
      width: 20px;
      margin-right: 5px;

      img[alt="back"] {
        width: 100%;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
}

.content-menu {
  position: absolute;
  z-index: 1;
  right: 0;
  top: 0;
  transform: translateX(20px) translateY(-10px);
}

.section-wrapper {
  position: relative;
  padding: 10px;
  overflow-y: auto;
  min-height: 300px;

  .empty_ {
    text-align: center;
    color: #adadad;
    font-size: 14px;
    transform: translateY(100px);
  }

  .section-item {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    box-sizing: border-box;
    background-color: #f6f6f6;
    margin-bottom: 12px;
    box-shadow: 0 3px 2px 0 rgba(119, 122, 255, 0.1);
    border-radius: 10px;
    padding: 0 15px 0 0;

    .title-type {
      flex: 1;
      background-color: $main-bg-color;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-width: 155px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: 10px 0 0 10px;
    }

    .question {
      flex: 8;
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      justify-content: flex-start;
      padding: 0 30px;
      height: 100%;
      box-sizing: border-box;
    }

    .handler {
      flex: 1;
      min-width: 70px;
      max-width: 70px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .icon {
        font-size: 22px;
        color: #5e5e5e;
        cursor: pointer;

        &:hover {
          color: #3d3d3d;
        }
      }
    }
  }
}

.icon-arrow--left {
  position: absolute;
  left: 2px;
  top: calc($height / 2);
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(3px);
  color: #333;
  border-radius: 50%;
  height: 34px;
  width: 34px;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.8);
  }
}

.icon-arrow--right {
  @extend .icon-arrow--left;
  left: auto;
  right: 2px;
}

.pagination {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-top: 5px;
  height: 85px;
  position: absolute;
  top: calc(100% - 71px);
  left: 0;
  right: 0;
  z-index: 99;
  padding-bottom: 7px;

  background-color: rgba(240, 244, 245, 0.6);
  backdrop-filter: blur(8px);
  box-sizing: border-box;

  .start-game-button {
    position: absolute;
    right: 200px;
    top: 5px;
    width: 140px;
  }

  .start-game-button-en {
    right: 200px;
    width: 160px;
  }

  .start-game-button2 {
    position: absolute;
    right: 40px;
    top: 5px;
    width: 140px;
  }

  .start-game-button-en2 {
    right: 20px;
    width: 160px;
  }

  :deep(.is-active) {
    background-color: $main-bg-color !important;
    color: #f1f1f1;
  }

  :deep(.el-pager li) {
    border-radius: 50%;;
  }

  :deep(.el-pagination) {
    --el-pagination-hover-color: $main-bg-color;
  }
}
.go-back-btn {
  margin-right: 20px;
  background-color: #fff;
  width: 40px;
}
</style>
