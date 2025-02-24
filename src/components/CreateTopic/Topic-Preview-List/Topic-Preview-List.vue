<template>
  <div class="topic--preview">
    <el-scrollbar>
      <div class="topic--preview-content" :style="{height: isFullScreen? 'calc(100vh - 240px)':'500px'}">
        <div class="topic--preview-content__item" v-for="(item, index) of dataSource" :key="index">
          <img
            src="@/assets/select_less.png"
            v-if="!selectedList.includes(index)"
            alt="select"
            class="select"
            @click="onSelect(index)"
          />
          <img
            src="@/assets/select.png"
            v-else
            alt="select"
            class="select"
            @click="onSelect(index)"
          />
          <MultipleChoiceQuestionContent
            preview
            @loadImage="(event:string)=> onLoadImage(event,index)"
            :data-source="item"
            v-if="item.type === questionType.SINGLE_CHOICE || item.type === questionType.MULTIPLE_CHOICE"
          />
          <TrueOrFalseQuestionPage
            preview
            @loadImage="(event:string)=> onLoadImage(event,index)"
            :data-source="item"
            v-if="item.type === questionType.JUDGEMENT"
          />
<!--          <FillInTheBlanks preview :data-source="item" v-if="item.type === questionType.BLANKS" />-->
<!--          <ThumbtackAnswerPage preview :data-source="item" v-if="item.type === questionType.THUMBTACK" />-->
        </div>
        <slot></slot>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup lang="ts">
import MultipleChoiceQuestionContent from "@vs/Question-Generation/Main/Multiple-Choice-Question-Content/Multiple-Choice-Question-Content.vue";
import TrueOrFalseQuestionPage from "@vs/Question-Generation/Main/True-Or-False-Question/True-Or-False-Question-Page.vue";
// import FillInTheBlanks from "@vs/Question-Generation/Main/Fill-In-The-Blanks/Fill-In-The-Blanks.vue";
// import ThumbtackAnswerPage from "@vs/Question-Generation/Main/Thumbtack-Answer/Thunbtack-Answer-Page.vue";
import { ref, watch } from "vue";
import type { QuestionItem } from "@/interface/Topic";
import { useQuestionType } from "@/libs/useQuestionType";

const props = withDefaults(
  defineProps<{
    indexList: number[];
    dataSource: QuestionItem[];
    isFullScreen?: boolean;
  }>(),
  {
    indexList() {
      return [];
    },
    dataSource() {
      return [];
    }
  }
);
const emit = defineEmits<{
  (ev: "update:indexList", value: number[]): void;
  (ev: "loadImage", value: {index:number, url:string}): void;
}>();
const questionType = useQuestionType();
const selectedList = ref<number[]>([]);

const onSelect = (index: number) => {
  if (selectedList.value.includes(index)) {
    selectedList.value.splice(
      selectedList.value.findIndex((it) => it === index),
      1
    );
    return;
  }
  selectedList.value.push(index);
  emit("update:indexList", selectedList.value);
};
const onLoadImage = (url:string, index:number)=> {
  emit("loadImage", {url, index})
}
const getSelectedList = () => {
  return selectedList.value.map(it=> props.dataSource[it])
}
const onReset = ()=> {
  selectedList.value = [];
}
watch(()=> props.indexList, (newValue) => {
  selectedList.value = newValue;
});
defineExpose<{
  getSelectedList: ()=> QuestionItem[];
  onReset: ()=> void
}>({
  getSelectedList,
  onReset
})
</script>
<style scoped lang="scss">
.topic--preview-content {
  display: flex;
  flex-flow: column nowrap;
  height: 500px;

  .topic--preview-content__item {
    flex-shrink: 0;
    width: 100%;
    margin: 10px auto;
    box-sizing: border-box;
    padding: 30px;
    border: 3px solid #553fc5;
    border-radius: 5px;
    position: relative;
    background-image: url("@/assets/bg.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;

    .scale {
      transform: scale(0.9);
    }
  }
}

.select {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
  width: 35px;
  cursor: pointer;
  transition: width 0.2s linear;

  &:hover {
    width: 38px;
  }
}
</style>
