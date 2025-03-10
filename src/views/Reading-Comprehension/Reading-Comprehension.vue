<template>
  <div class="wrapper">
    <div v-show="currentState===STATE.HOME">
      <subject-list @select="onSelect" reading />
    </div>
    <div v-if="currentState===STATE.WORLD">
      <work-list :data-prop="currentItem"
                 :grade-list="gradeList"
                 @create="onCreate"
                 :type="2"
                 @back="()=> currentState = STATE.HOME" />
    </div>
    <div v-if="currentState === STATE.AI">
      <world-editor :grade="worldItem?.gradeId"
                    :grades="gradeList"
                    :subject-id="worldItem?.subjectId"
                    :doc-id="worldItem?.docId"
                    :subject-name="currentItem?.subjectName||locale==='en'? currentItem?.subjectNameEn:locale==='zh'?currentItem?.subjectNameCn:currentItem?.subjectNameHk"
                    :user-id="userStore.getUserInfo?.user?.id"
                    @back="()=> currentState = STATE.WORLD" />
    </div>
  </div>
  <loading-component :show="addWorldLoading" />
</template>
<script setup lang="ts">
import SubjectList from "@cs/Subject-List/Subject-List.vue";
import WorkList from "@vs/Reading-Comprehension/Word-List/Work-List.vue";
import { onBeforeMount, ref, watch } from "vue";
import { activeGrade } from "@vs/Reading-Comprehension/activeGrade";
import type { TopicOverview } from "@/interface/TopicOverview";
import type { Grade } from "@/interface/Grade";
import WorldEditor from "@cs/World-Editor/World-Editor.vue";
import { fetchWorldListAdd } from "@/http/world";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";

import { useI18n } from "vue-i18n";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";


interface WordItem {
  gradeId: number;
  subjectId: number;
  subjectName: string;
  subjectNameCn: string;
  subjectNameEn: string;
  subjectNameHk: string;
  id: number;
  docId: string;
}

const STATE = {
  HOME: 1,
  WORLD: 2,
  AI: 3
};
const gradeList = ref<Grade.Item[]>([]);
const userStore = useUserInfo();
const worldItem = ref<WordItem>();
const currentState = ref<number>(STATE.HOME);
const currentItem = ref<TopicOverview>();
const addWorldLoading = ref(false);
const { locale } = useI18n();
const onSelect = (evt: TopicOverview) => {
  currentItem.value = evt;
  currentState.value = STATE.WORLD;
};
const onCreate = () => {
  const subjectId = currentItem.value?.id;
  if (!subjectId) return;
  addWorldLoading.value = true;
  fetchWorldListAdd({
    subjectId,
    userId: userStore.getUserInfo?.user?.id
  }).then((res: Http.Response<WordItem>) => {
    if (res?.code === 200) {
      currentState.value = STATE.AI;
      worldItem.value = res.data;
    }
  }).finally(() => {
    addWorldLoading.value = false;
  });
};
onBeforeMount(() => {
  const _gradeList = window.localStorage.getItem("grade");
  if (_gradeList) {
    gradeList.value = JSON.parse(_gradeList) as Grade.Item[];
  }
});
watch(() => activeGrade, (cb) => console.log(cb));
</script>
<style scoped lang="scss">

</style>