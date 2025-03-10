<template>
  <el-scrollbar class="main-wrapper">
    <div v-for="(item, index) of topicStore.get()" :key="index">
      <div v-show="getVisible(questionType.SINGLE_CHOICE , questionType.MULTIPLE_CHOICE) && topicStore.getActive() === index">
        <MultipleChoiceQuestionContent :data-source="item" @load-image="(event:any)=>onLoadImage(event, index, item)" />
      </div>
      <div v-show="getVisible(questionType.JUDGEMENT) && topicStore.getActive() === index">
        <TrueOrFalseQuestionPage :data-source="item" @load-image="(event:any)=>onLoadImage(event, index, item)" />
      </div>
      <div v-show="getVisible(questionType.BLANKS) && topicStore.getActive() === index">
        <FillInTheBlanks :data-source="item" />
      </div>
      <div v-show="getVisible(questionType.THUMBTACK) && topicStore.getActive() === index">
        <ThunbtackAnswerPage :data-source="item" />
      </div>
      <div v-show="(getVisible(questionType.READING1) ||getVisible(questionType.READING2))  && topicStore.getActive() === index">
        <reading-question :data-source="item" />
      </div>
    </div>

    <el-empty :description="$t('universal.empty')" style="color: #dcdcdc;transform: translateY(60%)" v-if="topicStore.get().length<1 " />
  </el-scrollbar>
</template>
<script setup lang="ts">
import { useTopicStore } from "@/libs/usePinia";
import MultipleChoiceQuestionContent from "@vs/Question-Generation/Main/Multiple-Choice-Question-Content/Multiple-Choice-Question-Content.vue";
import TrueOrFalseQuestionPage from "./True-Or-False-Question/True-Or-False-Question-Page.vue";
import FillInTheBlanks from "@vs/Question-Generation/Main/Fill-In-The-Blanks/Fill-In-The-Blanks.vue";
import ThunbtackAnswerPage from "@vs/Question-Generation/Main/Thumbtack-Answer/Thunbtack-Answer-Page.vue";
import { useQuestionType } from "@/libs/useQuestionType";
import { watch } from "vue";
import type { QuestionItem } from "@/interface/Topic";
import ReadingQuestion from "@vs/Question-Generation/Main/Reading/Reading-Question.vue";

const topicStore = useTopicStore();

const questionType = useQuestionType();
const getVisible = (key: number, key2?:number) => {
  return topicStore.getActiveItem()?.type === key || topicStore.getActiveItem()?.type === key2;
};
const onLoadImage = (event: string, i:number, item: QuestionItem)=> {
  console.log("圖片無法加載: ", item, i, event);
}
watch(()=> topicStore.get(), cb=> {
  //console.log(cb)
})

</script>

<style scoped lang="scss">
@import "@/theme.scss";

.main-wrapper {
  height: $full-screen-height;
  background-image: url("@/assets/bg.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
}
</style>
