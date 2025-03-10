<template>
  <el-container>
    <el-aside class="left-side" v-if="show">
      <LeftSideMain  />
    </el-aside>
    <el-main class="el-main">
      <MainContent />
    </el-main>
    <el-aside :class="{ 'right-side': true, 'aside-right-none': !expand }">
      <div class="right-side-arrow">
        <el-icon class="arrow-wrapper" v-if="expand" @click.stop="expand = false"
          ><ArrowRightBold
        /></el-icon>
        <el-icon class="arrow-wrapper" v-else @click.stop="expand = true"
          ><ArrowLeftBold
        /></el-icon>
      </div>
      <RightSideMain />
    </el-aside>
  </el-container>
<!--  <CreateTopic v-model:visible="createTopicByAi.showModal" :data="questions" @done="onCreateDone" />-->
  <LoadingComponent :show="loading" />
  <popup-component v-model:modalValue="showGame">
    <start-game :subject-type-id="subjectTypeIdValue" @close="showGame = false" :action="0" :word="type === 2" />
  </popup-component>
</template>
<script setup lang="ts">
import LeftSideMain from "@vs/Question-Generation/Left-Side/Left-Side-Main.vue";
import MainContent from "@vs/Question-Generation/Main/Main-Content.vue";
import RightSideMain from "@vs/Question-Generation/Right-Side/Right-Side-Main.vue";
// import CreateTopic from "@cs/CreateTopic/CreateTopic.vue";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";

import { useCreateTopicByAi, useTopicStore } from "@/libs/usePinia";

import { nextTick, onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowLeftBold, ArrowRightBold } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router";
import { fetchQuestionList } from "@/http/question";
import type { Http } from "@/interface/Http";
import type { QuestionAnswer } from "@/interface/Topic";
import {covertQuestionAnswer2QuestionItem } from "@/libs/tools";
import StartGame from "@cs/Start-Game/Start-Game.vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
//@ts-ignore
import pub from "vc-subscribe-publish"

const createTopicByAi = useCreateTopicByAi();

const expand = ref(true);
const show = ref(true);
const loading = ref(false);
const route = useRoute();
const topicStore = useTopicStore();
const showGame = ref(false);
const questions = ref<QuestionAnswer[]>([]);
const subjectTypeIdValue = ref();
const router = useRouter();
/**
 *       page: page.value,
 *       pageSize: PAGE_SIZE,
 *       subjectId: activeId.value,
 */

const {page, pageSize, subjectId, subjectTypeId, key, type=1} = route.query;

const getDataSource = ()=> {
  loading.value = true;
  fetchQuestionList({
    subjectTypeId,
    subjectId,
    page,
    pageSize
  }).then((res:Http.Response<QuestionAnswer[]>)=>{
    if(res.code === 200){
      const _data = res.data.map(it=> {
        return covertQuestionAnswer2QuestionItem(it);
      })
      topicStore.set(_data);
    }
  }).catch(e=> console.log(e)).finally(()=> loading.value = false);
}
const onCreateDone = (data:QuestionAnswer[])=> {
 data.map(it=> {
    topicStore.add(covertQuestionAnswer2QuestionItem(it));
  })
  createTopicByAi.showModal = false;
}
onBeforeMount(() => {


  if(key){
    const createData =   window.sessionStorage.getItem(key as string);
    //@ts-ignore
    const _data = JSON.parse(decodeURIComponent(createData)) as QuestionAnswer[];

    questions.value = _data;
    const _result = _data.map(it=> {
      return covertQuestionAnswer2QuestionItem(it);
    })
    topicStore.set(_result);
    nextTick(()=>{
      topicStore.setActive(0);
    })
  } else {
    getDataSource()
  }
});
const messageListener = (data:any)=> {

  if(data.data.type === "close"){
    showGame.value = false;
  }

}
onMounted(()=> {
  pub.subscribe("on-preview", ()=> {
    showGame.value = true
    subjectTypeIdValue.value = topicStore.get(0)?.subjectTypeId;
  });
  window.addEventListener("message", messageListener );
  if(subjectId && subjectTypeId){
    subjectTypeIdValue.value = subjectTypeId;
  } else if(key){
    const createData = window.sessionStorage.getItem(key as string);
    if(!createData){
    //  router.push("/");
    }
    subjectTypeIdValue.value = JSON.parse(decodeURIComponent(createData as string))?.[0]?.subjectTypeId
  } else {
   // router.push("/");

  }
})

watch(loading, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      loading.value = false;
    }, 3000);
  }
});
onBeforeUnmount(()=> {
  show.value = false;
  topicStore.setActive(0);
  topicStore.set([]);
  pub.unsubscribe("on-preview");
  window.removeEventListener("message", messageListener );
})
watch(()=> createTopicByAi.showModal, (newValue) => {
  console.log(newValue)
})
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.left-side {
  width: $question-generation-left-side-width;
  background-color: $question-generation-aside-bg;
}
.right-side {
  width: $question-generation-right-side-width;
  background-color: $question-generation-aside-bg;
  position: relative;
  transition: width 0.3s ease-in-out;

}

.el-main {
  padding: 0;
}
.right-side-arrow {
  top: calc(50% - 12px);
  position: fixed;
  z-index: 1;
  font-size: 24px;
  transform: translateX(-24px);
  color: #333;
  .arrow-wrapper {
    background-color: #fff;
    cursor: pointer;
    padding: 10px 3px;
    &:hover {
      color: #626262;
      background-color: #eeeeee;
    }
  }
}
.aside-right-none {
  width: 0;
  overflow: hidden;
  position: relative;
}
</style>
