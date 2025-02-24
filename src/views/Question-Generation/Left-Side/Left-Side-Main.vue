<template>
  <div class="left-side-main-wrapper">
    <el-scrollbar class="left-side-main-content" ref="scrollbar" @scroll="onScroll">
      <span class="prev-loading-text" v-if="prevLoading">
        {{ $t("questionEditLeftSide.loading") }}
      </span>
      <div
        :class="{ 'left-side-main-content__left-side': true, active: active === index }"
        v-for="(item, index) of getList"
        :key="index"
      >
        <div class="left-side-main-content__content__title">
          <!--@ts-nocheck-->
          <span>{{ index + 1 }}. </span>
          <h3>{{ $t(getTopicTypeTitle(item) as string) }}:</h3>
        </div>
        <div class="left-side-main-content__content">
          <div class="left-side-main-content__left-side__menu">
            <el-icon class="left-side__menu__icon" @click.stop="onCopy(item, index)">
              <CopyDocument />
            </el-icon>
            <el-icon class="left-side__menu__icon" @click.stop="onRemove(index, item.id)">
              <Delete />
            </el-icon>
          </div>
          <div @click.stop="onChange(index)" style="cursor: pointer">
            <FillInTheBlanks
              :data-source="item"
              :active-item="active === index"
              v-if="getTypeVisible(item, questionType.BLANKS)"
            />
            <ThumbtackAnswer
              :data-source="item"
              :active-item="active === index"
              v-if="getTypeVisible(item, questionType.THUMBTACK)"
            />

            <MultipleChoiceQuestions
              :data-source="item"
              :active-item="active === index"
              v-if="getTypeVisible(item, questionType.SINGLE_CHOICE, questionType.MULTIPLE_CHOICE)"
            />
            <TrueOrFalseQuestionPage
              :data-source="item"
              :active-item="active === index"
              v-if="getTypeVisible(item, questionType.JUDGEMENT)"
            />
          </div>
        </div>

      </div>
      <span class="next-loading-text" v-if="nextLoading">
        {{ $t("questionEditLeftSide.loading") }}
      </span>
      <div style="text-align: center; margin: 0 auto" class="footer-add">
        <el-button class="buttons-primary" size="large" @click="onAddTopicHandler">
          {{ $t("questionEditLeftSide.add") }}
        </el-button>
        <TopicSetting  />
      </div>

    </el-scrollbar>
  </div>
</template>
<script setup lang="ts">
import MultipleChoiceQuestions
  from "@vs/Question-Generation/Left-Side/Multiple-Choice-Questions/Multiple-Choice-Questions.vue";
import FillInTheBlanks from "@vs/Question-Generation/Left-Side/Fill-In-The-Blanks/Fill-In-The-Blanks.vue";
import TrueOrFalseQuestionPage
  from "@vs/Question-Generation/Left-Side/True-Or-False-Question/True-Or-False-Question.vue";
import ThumbtackAnswer from "@vs/Question-Generation/Left-Side/Thumbtack-Answer/Thumbtack-Answer.vue";

import { CopyDocument, Delete } from "@element-plus/icons-vue";
import { computed, nextTick, ref, watch } from "vue";
import { useTopicStore } from "@/libs/usePinia";
import type { QuestionAnswer, QuestionItem } from "@/interface/Topic";
import { useRoute } from "vue-router";
import { useQuestionType } from "@/libs/useQuestionType";
import { covertQuestionAnswer2QuestionItem } from "@/libs/tools";
import { fetchDeleteItem, fetchQuestionList } from "@/http/question";
import type { Http } from "@/interface/Http";
import { useDebounce } from "@/libs/useDebounce";
import { useTopicDict } from "@/libs/useTopicDict";
import TopicSetting from "@cs/TopHeader/Topic-Setting/Topic-Setting.vue";

const route = useRoute();
const topicStore = useTopicStore();
const emit = defineEmits<{
  (event: "create"): void
}>();
const questionType = useQuestionType();
const prevLoading = ref(false);
const nextLoading = ref(false);
const prev_threshold = 30, next_threshold = 30;
let currentScrollTop = 0;
let queryParams = route.query;
let _page = parseInt(String(queryParams?.page)), _pageSize = parseInt(String(queryParams?.pageSize)),
  _subjectTypeId = queryParams?.subjectTypeId, _subjectId = queryParams?.subjectId, _pagePrev = _page,
  _pageNext = _page;
let total = 0, canLoadMore = true;
const DEFAULT_QUESTION: QuestionItem = {
  answer: [],
  images: [{ image: "", title: "" }],
  image_keywords: [],
  options: ["", "", "", ""],
  question: "",
  type: questionType.SINGLE_CHOICE,
  maxTime: 10
};
let shouldScroll = true;
const topicTypeTitle = useTopicDict();

//   {
//   choice: "选择题",
//   thumbtack: "图钉答案",
//   true_or_false: "判断题",
//   blanks: "填空题"
// };
const getTopicTypeTitle = (target: QuestionItem) => topicTypeTitle.find(it => it.value === target.type)?.label;
const getList = computed(() => topicStore.get());
const active = computed(() => topicStore.getActive());
const getTypeVisible = (item: QuestionItem, key: number, key2?: number) => item.type === key || item.type === key2;
const scrollbar = ref();
const onChange = (item: number) => topicStore.setActive(item);

const onCopy = (topic: QuestionItem, index: number) => {
  const _topic = Object.assign({}, topic, { id: undefined });
  topicStore.insert(_topic, index);
};
const onScroll = (event: any) => {
  if (event.scrollTop < prev_threshold && event.scrollTop < currentScrollTop) {
    shouldScroll = false;
    usePrevLoadDebounce();
  } else if ((scrollbar.value.wrapRef as HTMLElement).firstElementChild) {
    const { height } = (scrollbar.value.wrapRef as HTMLElement).firstElementChild?.getBoundingClientRect() || { height: 0 };
    const wrapperHeight = (scrollbar.value.wrapRef as HTMLElement).getBoundingClientRect() || { height: 0 };
    if (event.scrollTop + wrapperHeight.height > height - next_threshold) {
      useNextLoadDebounce();
    }
  }
  currentScrollTop = event.scrollTop;
};
const onPrevLoad = () => {
  if (prevLoading.value || isNaN(_page) || _pagePrev <= 1) return;
  prevLoading.value = true;

  fetchQuestionList({
    page: _pagePrev - 1,
    pageSize: _pageSize,
    subjectTypeId: _subjectTypeId,
    subjectId: _subjectId
  }).then((res: Http.Response<QuestionAnswer[]>) => {
    const _data = res.data.map(it => covertQuestionAnswer2QuestionItem(it));
    topicStore.unshift(_data);

    _pagePrev -= 1;
    scrollbar.value.setScrollTop(40);
  }).finally(() => {
    setTimeout(()=>{
      shouldScroll = true;
    }, 500)
    prevLoading.value = false;
  });
};
const onNextLoad = () => {
  if (nextLoading.value || isNaN(_page) || !canLoadMore) return;
  nextLoading.value = true;
  fetchQuestionList({
    page: _pageNext + 1,
    pageSize: _pageSize,
    subjectTypeId: _subjectTypeId,
    subjectId: _subjectId
  }).then((res: Http.Response<QuestionAnswer[]>) => {
    const _data = res.data.map(it => covertQuestionAnswer2QuestionItem(it));
    if (_data.length > 0) {
      topicStore.merge(_data);
      _pageNext += 1;
      total = res.total || 0;
    }

    //@ts-ignore
    canLoadMore = total > _pageNext * _pageSize - (topicStore.get() || []).filter(it => !it.id).length;
  }).finally(() => nextLoading.value = false);
};
const usePrevLoadDebounce = useDebounce(onPrevLoad, 500);
const useNextLoadDebounce = useDebounce(onNextLoad, 500);
const onRemove = (index: number, id: number) => {
  if (!id) {
    topicStore.remove(index);
    return;
  }
  fetchDeleteItem({
    id
  }).then((res: Http.Response<any>) => {
    if (res.code === 200) {
      topicStore.remove(index);
      if((topicStore.get() as QuestionItem[]).length < 6) {
        onNextLoad();
      }
    }
  });
};
const onAddTopicHandler = () => {
  topicStore.add(structuredClone(DEFAULT_QUESTION));
  nextTick(() => {
    topicStore.setActive((topicStore.get() as Array<QuestionItem>).length - 1);
  });
};
const ITEM_HEIGHT = 170;
//(createTopicByAi.showModal = true);
const setItemToScrollView = (pos: number) => {

  if (scrollbar.value) {
    const scrollView = (scrollbar.value.wrapRef as HTMLElement);
    const scrollTop = scrollView.scrollTop, scrollViewHeight = scrollView.getBoundingClientRect().height,
      viewHeight = ITEM_HEIGHT * pos;
    if (viewHeight > scrollViewHeight + scrollTop) {
      nextTick(() => {
        console.log(viewHeight);
        scrollView.scrollTo({
          top: viewHeight,
          behavior: "smooth"
        });
      });
    }
  }
};
watch(() => topicStore.get(), cb => {
  if (route.query.id && cb) {
    const _id = route.query.id;
    //@ts-ignore
    const index = topicStore.get()?.findIndex((it: QuestionItem) => String(it.id) === String(_id));

    if (index < 0 || topicStore.getActive()) return;
    topicStore.setActive(index);
    //@ts-ignore
    if (topicStore.get()?.length < 5 && _page > 1) {

       onPrevLoad();
    }
  }
} );
watch(() => topicStore.getActive(), (cb: number) => {
  //@ts-ignore
  if (!isNaN(cb) && topicStore.get().length > 4) {
     shouldScroll && setItemToScrollView(cb);
  }
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.left-side-main-wrapper {
  overflow-y: hidden;
}

.prev-loading-text {
  display: inline-block;
  width: 100%;
  text-align: center;
  color: #989898;
  font-size: 14px;
  position: sticky;
  top: 0;
}

.next-loading-text {

  font-size: 14px;
  display: inline-block;
  width: 100%;
  text-align: center;
  color: #989898;
}

.left-side-main-content {
  height: $question-generation-aside-height;
}

.left-side-main-content-demo {
  height: 120px;
  background-color: #2c3e50;
  margin-bottom: 10px;
}

.left-side-main-content__left-side__menu {
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  height: 50px;
  position: relative;
  margin-bottom: 12px;
  padding-right: 5px;
}

.left-side-main-content__left-side {
  border-bottom: 1px solid #e8e8e8;
  position: relative;
}

.active {
  background-color: rgba(232, 232, 232, 0.1);
}

.left-side-main-content__content {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: flex-end;
}

.left-side__menu__icon {
  cursor: pointer;
  color: #505050;

  &:hover {
    color: #151515;
  }
}

h3 {
  margin-block-start: 0;
  margin-block-end: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  padding-left: 5px;
  display: inline-block;
}

.left-side-main-content__content__title {
  letter-spacing: 1px;
  padding: 0 22px;
  margin: 10px 0 5px 0;

  span {
    font-size: smaller;
  }
}

.btn-add-ppt {
  color: #333;
  box-shadow: rgba(0, 0, 0, 0.25) 0px -4px inset;
  background: rgb(242, 242, 242);
  width: 66%;
  margin-left: 0;
  margin-top: 14px;
}

.footer-add {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 244, .3);
  padding: 20px 0;
  backdrop-filter: blur(5px);
}
</style>
