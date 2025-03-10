<template>

    <div class="header">
      <el-form inline size="large" @submit.prevent="fetchData">
        <el-form-item label="" label-width="0">
          <el-input clearable class="default__input"
                    style="width: 250px"
                    v-model="search.name"
                    :placeholder="$t('header.header_item_line1')+$t('header.topicName')" />
        </el-form-item>
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
        <el-button type="primary" class="button default__button-primary" @click.stop="()=> toGenerate()" v-if="showQuestion">
          <el-image :src="createGenerateIcon" alt="icon" fit="contain" class="button-icon" style="width: 16px" />
          {{$t("header.header_item_line4")}}
        </el-button>
      </div>
    </div>

  <classification-component :current-grade="gradeId"
                            :grade-list="gradeList"
                            :visible="showTopicEdit"
                            @close="onClose" :data="activeItem" />
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from "vue";
import type { TopicOverview } from "@/interface/TopicOverview";
import { useRouter } from "vue-router";
import ClassificationComponent from "@cs/Classification/Classification-Component.vue";

import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";

import createTopicIcon from "@/assets/create-topic.png";
import createGenerateIcon from "@/assets/generate-icon.png";
import { fetchTopicList } from "@/http/topic";

const userInfoStore = useUserInfo();
const search = reactive({ name: "", grade: "" });
const dataSource = ref<(TopicOverview & { loading: boolean })[]>([]);
const router = useRouter();
const gradeList = ref<{ label: string, id: number }[]>([]);
const showTopicEdit = ref(false);
const loading = ref(false);
let activeItem = ref<TopicOverview | undefined>();

const props = defineProps<{
  gradeId: number
  showQuestion?: boolean
}>()

const emit = defineEmits<{
  (ev:"search", value: (TopicOverview & { loading: boolean })[]):void
}>()
const fetchData = () => {
  loading.value = true;
  fetchTopicList({
    userId: userInfoStore?.getUserInfo?.user?.id,
    gradeId: props.gradeId,
    subjectName: search.name
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.data) {
      dataSource.value = res.data.map(it => {
        return {
          ...it,
          loading: false
        };
      });
      emit("search", dataSource.value);
    }
  }).finally(() => {
    loading.value = false;
  });
};

const toGenerate = ()=> {

  router.push({
    path: '/question-add'
  })
}
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
const getGradeList = ()=> {
  const _gradeList = window.localStorage.getItem("grade");
  gradeList.value = JSON.parse(_gradeList).map((it:any) => {
    return {
      label: it.grade,
      id: it.id
    };
  });
}
onBeforeMount(() => {

  getGradeList();
});


</script>

<style scoped lang="scss">
@import "@/theme.scss";

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

</style>
