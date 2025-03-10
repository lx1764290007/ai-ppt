<template>
  <div class="home-wrapper">
    <div class="header">
      <el-form inline size="large" @submit.prevent="fetchData">
        <el-form-item label="" label-width="0">
          <el-input clearable class="default__input"
                    style="width: 250px"
                    v-model="search.name"
                    :placeholder="$t('header.header_item_line1')+$t('header.topicName')" />
        </el-form-item>
        <!--      <el-form-item :label="$t('header.header_item_line2')">-->
        <!--        <el-select clearable class="default__select" v-model="search.grade" style="width: 180px" :placeholder="$t('universal.select')">-->
        <!--          <el-option v-for="(item, i) of gradeList" :key="i"-->
        <!--                     :value="item.id"-->
        <!--                     :label="item.id===0? $t(item.label):locale==='en'? $t('grade.grade') + item.label:item.label + $t('grade.grade')"></el-option>-->
        <!--        </el-select>-->
        <!--      </el-form-item>-->
        <el-form-item label-width="0" label="">
          <el-button class="default__button-primary" type="primary" native-type="submit">
            {{ $t("header.header_item_line1") }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tools">
        <el-button type="primary" class="button default__button-primary" @click.stop="onAddTopic">
          <el-image :src="createTopicIcon" alt="icon" fit="contain" class="button-icon"  />
          {{$t("home.home_item_line4")}}
        </el-button>
<!--        <el-button type="primary" class="button default__button-primary" @click.stop="()=> toGenerate()">-->
<!--          <el-image :src="createGenerateIcon" alt="icon" fit="contain" class="button-icon" style="width: 16px" />-->
<!--          {{$t("header.header_item_line4")}}-->
<!--        </el-button>-->
      </div>
    </div>
    <el-scrollbar style="height: auto" ref="scroll" @scroll="onScrollEnd" >
      <div class="tab__component-wrapper-header" v-show="gradeList.length>0">
        <el-icon class="tab__component-icon-left" @click="onScrollHandle(-1, $event)" >
          <ArrowLeft />
        </el-icon>
        <el-icon class="tab__component-icon-right" @click="onScrollHandle(1,$event)" >
          <ArrowRight />
        </el-icon>
        <div :class="{'tab__component-wrapper-header-item':true,'default__button-active':activeValue === item.id}"
             v-for="(item) of gradeList" :key="item.id" @click="onSelect(item.id)">
          <!-- @dblclick="onEdit(index, item.label)" -->
          <!--          <el-icon class="tab__component-icon-delete" @click.stop="onDelete(item.label)" v-if="enableRemove">-->
          <!--            <Delete />-->
          <!--          </el-icon>-->

          <span>
            {{ locale === "en" ? $t("grade.grade") + item.label : item.label + $t("grade.grade") }}
            <!--            {{index === 0? $t(item.label) : locale === 'en'? $t('grade.grade') + item.label : item.label + $t('grade.grade')}}-->
          </span>

        </div>
      </div>
    </el-scrollbar>
    <el-skeleton style="display: grid;justify-content: space-between;grid-auto-flow: dense; grid-template-columns:repeat(auto-fill, 210px); overflow-y: hidden" loading animated
                 v-if="loading">
      <template #template>
        <el-skeleton-item variant="rect" class="item" style="width: 210px;height: 306px;margin: 15px 15px;"
                          v-for="_item of 30" :key="_item" />
      </template>
    </el-skeleton>
    <el-scrollbar class="home-container" v-else-if="!loading && dataSource.length >= 0" :always="false">
      <div class="home-items--wrapper" :style="{'justify-content':dataSource.length<4? 'flex-start':'space-between'}">
      <div class="item-wrapper" v-for="(item,i) of dataSource" :key="i" v-loading="item.loading">
        <div class="item" @click="toSubjectPage(item)">
          <el-image class="img-content" :src="item.subjectImg" fit="cover" />
          <div class="item__content">
            <h3 class="item__title" :title="item.subjectName">
              {{ item.subjectName || (locale === "en" ? item.subjectNameEn : locale === "zh_hant" ? item.subjectNameHk : item.subjectCn) }}</h3>
<!--            <p class="item__type"><span-->
<!--              style="font-weight: 600;">{{ locale === "en" ? "K" : "" }}{{ getCurrentGrade(item.gradeId)-->
<!--              }}{{ locale !== "en" ? $t("grade.grade") : "" }}</span>-->
<!--            </p>-->
<!--            <p class="item__type"><span style="font-weight: 600">{{ item.subjectTypeSize || 0 }}</span>-->
<!--              {{ $t("home.home_item_line1") }}</p>-->
<!--            <p class="item__total"><span style="font-weight: 600">{{ item.questionSize || 0 }}</span>-->
<!--              {{ $t("home.home_item_line2") }}</p>-->
<!--            <p class="item__description"><span style="font-weight: 600">{{ item.answersNum || 0 }}</span>-->
<!--              {{ $t("home.home_item_line3") }}</p>-->
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
  <el-empty description="empty" style="display: none" class="empty" image-size="120"
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
import { ArrowLeft, ArrowRight, Warning } from "@element-plus/icons-vue";
import { fetchGradeList } from "@/http/grade";
import { ElScrollbar } from "element-plus";
import createTopicIcon from "@/assets/create-topic.png";
import createGenerateIcon from "@/assets/generate-icon.png";

const showConfirm = ref(false);
const scroll = ref<InstanceType<typeof ElScrollbar>>();
const userInfoStore = useUserInfo();
const search = reactive({ name: "", grade: "" });
const dataSource = ref<(TopicOverview & { loading: boolean })[]>([]);
const router = useRouter();
const gradeList = ref<{ label: string, id: number }[]>([]);
const showTopicEdit = ref(false);
const loading = ref(false);
const { locale, t } = useI18n();
let activeItem = ref<TopicOverview | undefined>();
let currentScrollLeft: number = 0;
const onScrollEnd = (value: { scrollLeft: number }) => {
  currentScrollLeft = value.scrollLeft;
};
const onScrollHandle = (value: number, event: Event) => {
  if (scroll.value) {
    if (value > 0) {
      scroll.value.setScrollLeft(currentScrollLeft + 81);
    } else {
      scroll.value.setScrollLeft(currentScrollLeft - 81);
    }
  }
  event.stopPropagation();
};
const activeValue = ref();

const onSelect = (item: number) => {
  activeValue.value = item;
  fetchData();
};
const toSubjectPage = (item: TopicOverview) => {

  router.push({
    name: "multimedia-subject",
    query: {
      id: item.id,
      title: item.subjectName || (locale.value === "en" ? item.subjectNameEn : locale.value === "zh_hant" ? item.subjectNameHk : item.subjectNameCn)
    }
  });
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

const getGradeList = async () => {
  loading.value = true;
  const data: Http.Response<any> = await fetchGradeList({
    userId: userInfoStore.getUserInfo?.user?.id,
    page: 1,
    pageSize: 100
  });
  if (data.code === 200) {
    //{id:0 ,label:'grade.no_restrictions'}
    gradeList.value = [].concat(data.data.map((it: any) => {
      return {
        id: it.id,
        label: it.gradeName
      };
    }));
    activeValue.value = gradeList.value[0]?.id;
    fetchData();
  }
};
const toGenerate = ()=> {

  router.push({
    path: '/question-add'
  })
}
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
const fetchData = () => {
  loading.value = true;
  fetchTopicList({
    userId: userInfoStore?.getUserInfo?.user?.id,
    gradeId: activeValue.value || search.grade || undefined,
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
    fetchData();
  }
  showTopicEdit.value = false;
};

const onAddTopic = () => {
  activeItem.value = undefined;
  showTopicEdit.value = true;
};
onBeforeMount(() => {

  getGradeList();
});


</script>

<style scoped lang="scss">
@import "@/theme.scss";

.home-wrapper {
  overflow-y: hidden;
  background-color: transparent;
  height: calc(100vh - $header-bar-height - 20px);
  position: relative;
  .header {
    display: flex;
    flex-flow: row nowrap;
    align-items: flex-start;
    justify-content: space-between;
    .tools {
      position: relative;
      .button-icon {
        width: 18px;
        margin-right: 5px;
      }
    }
  }
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
  width: 380px;
  height: 180px;
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
