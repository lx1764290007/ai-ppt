<template>
  <el-dialog
    class="dialog-body"
    v-model="show"
    append-to-body
    title="创建题目"
    width="1000"
    style="margin-top: 6vh"
    @close="onClose"
    show-close
  >
    <div class="create-topic-container">
      <div class="create-topic-content-left">
        <el-scrollbar style="padding-bottom: 15px" always>
          <div class="tag-wrapper">
            <div class="tag-item" v-for="(item, index) of tagsList" :key="index">
              <el-tag
                class="tag"
                @click.stop="onChooseTag(item.label)"
                @close="onRemoveTag(index)"
                size="large"
                @dblclick.stop="onEditableChange(index)"
                closable
                type="info"
                v-if="!item.editable"
              >
                {{ item.label }}
              </el-tag>
              <el-input
                v-model="item.label"
                ref="tagRefInput"
                placeholder="输入"
                v-else
                size="large"
                @blur="onEditableChange(index)"
                class="tag-input"
              />
            </div>
          </div>
        </el-scrollbar>
        <el-input
          clearable
          placeholder="输入"
          size="large"
          v-model="inputTitle"
          class="title-input"
        >
          <template #prefix>
            <el-select
              v-model="themeValue"
              placeholder="选择主题"
              size="large"
              class="selector"
              style="width: 100px"
            >
              <el-option
                v-for="item in themeDemo"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <span class="selector-option">{{ item.label }}</span>
              </el-option>
            </el-select>
          </template>
          <template #append>
            <el-button class="buttons-generate" @click.stop="onSubmit" :loading="loading" style="width: 120px">生成</el-button>
          </template>
        </el-input>
        <p class="generating" v-if="loading">正在生成题目</p>
        <el-empty description="还没有题目"
                  v-if="!loading && dataSource.length<1 && generateTypeValue === GENERATE_TYPE[0].value"
                  image-size="120" style="margin-top: 100px" />
        <TopicPreviewList
          is-full-screen
          ref="previewRef"
          :data-source="dataSource"
          v-model:index-list="indexList"
          v-if="generateTypeValue === GENERATE_TYPE[0].value"
        >
          <div class="dashboard-loading" v-if="loading">
            <el-progress type="dashboard" :percentage="loadingPercent" color="#553fc5" />
          </div>

        </TopicPreviewList>
        <file-upload v-else />

      </div>
      <div class="create-topic-content-right">
        <CreateTopicController
          @select-all="onSelectAll"
          :index-list="indexList"
          ref="controllerRef"
          @done="onDone"
          is-full-screen
          v-model:tag-list="tagsList"
          v-model:generate-type="generateTypeValue"
        />
      </div>
    </div>
  </el-dialog>

</template>
<script setup lang="ts">
import { nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from "vue";
import TopicPreviewList from "@cs/CreateTopic/Topic-Preview-List/Topic-Preview-List.vue";
import { useCreateAiTopic, useTopicDict } from "@/libs/useTopicDict";
import CreateTopicController from "@cs/CreateTopic/Create-Topic-Controller/Create-Topic-Controller.vue";
import type { Question, QuestionAnswer, QuestionGeneral, QuestionItem } from "@/interface/Topic";
import FileUpload from "@cs/CreateTopic/File-Upload/File-Upload.vue";
import { AI_GENERAL_KEY } from "@/libs/KEY";

import { ElMessage } from "element-plus";
import { fetchQuestionGenerate } from "@/http/question";
import type { Http } from "@/interface/Http";
import { useRouter } from "vue-router";
import { useUserInfoStore } from "@/stores/user";
import { covertQuestionItem2QuestionAnswer } from "@/libs/tools";


const tagRefInput = ref(null);

const showNext = ref(false);
const loading = ref(false);
const dataSource = ref<QuestionItem[]>([]);
const tagsList = ref<{ label: string; id: number; editable: boolean }[]>([]);
const useUserInfo = useUserInfoStore();
const result: QuestionGeneral = {
  text: "",
  questionType: 1,
  grade: 1,
  subject: 1,
  count: "1-10",
  language: "zh"
};

const props = withDefaults(
  defineProps<{
    visible: boolean;
    pictureUrl?: string;
    data: QuestionAnswer[]
  }>(),
  {
    visible: false
  }
);

const inputTitle = ref<string>("");
const selectedQuestions = ref<QuestionItem[]>([]);
const topicDict = useTopicDict();
const themeDemo = ref<{ value: string; label: string, icon: string }[]>(topicDict);
const themeValue = ref<number | undefined>();
const loadingPercent = ref<number>(0);
const router = useRouter();
setTimeout(() => {
  themeValue.value = topicDict[0].value;
}, 50);
const indexList = ref<number[]>([]);
const show = ref(props.visible);
const previewRef = ref();
const GENERATE_TYPE = useCreateAiTopic();
const generateTypeValue = ref<number>(GENERATE_TYPE[0].value);
const emit = defineEmits<{
  (event: "update:visible", value?: boolean): void;
  (event: "done", value: QuestionAnswer[]): void;
}>();

watch(() => props.visible, (value) => {
  show.value = value;
});

const onClose = () => {
  emit("update:visible");
};
const onSubmit = () => {
  const target = Object.assign({
    text: inputTitle.value,
    questionType: themeValue.value
  }, controllerRef.value?.getValues());
  if (inputTitle.value.trim()) {
    loading.value = true;
    fetchQuestionGenerate(target).then((res: Http.Response<Question>) => {
      if (res.code === 200) {
        dataSource.value = res.data.questions.map(it => {
          return {
            ...it,
            options: typeof it.options === "object" ? it.options : (it.options as string).split(","),
            //@ts-ignore
            answer: typeof it.options === "object" ? it.answer : (it.answer as string).split(",")
          };
        });
        previewRef.value?.onRest?.();
      }
    }).finally(() => loading.value = false);
  } else {
    ElMessage({
      message: "请输入内容",
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
  }
};

const controllerRef = ref();
const onDone = (event: { count: string, language: string, grade: number }) => {
  selectedQuestions.value = previewRef.value?.getSelectedList() || [];
  if (selectedQuestions.value.length < 1) {
    ElMessage({
      message: "请先选择题目",
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  // if (!themeValue.value ) {
  //   ElMessage({
  //     message: "未选择主题",
  //     icon: "Warning", // 自定义图标
  //     type: "info",
  //     duration: 3000,
  //     offset: 50
  //   });
  //
  // } else
 if (!inputTitle.value.trim()) {
    ElMessage({
      message: "未填入内容",
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50

    });

  } else {
    /**
     *   text: "",
     *   questionType: 1,
     *   grade:1,
     *   subject: 1,
     *   count: 1,
     *   language: "zh"
     */
    result.text = inputTitle.value;
    result.questionType = themeValue.value;
    result.grade = event.grade;
    result.count = event.count;
    result.language = event.language;
    setDataTopic();
  }
};
const setDataTopic = () => {
  const target: Array<QuestionAnswer> = selectedQuestions.value.map(it => {
    return covertQuestionItem2QuestionAnswer({
      ...it,
      type: it.type,
      question: it.question,  //问题
      questionImg: it.images[0].image,
      maxTime: 10,  //答题时间限制 秒
      answers: it.options,
      correctAnswer: it.answer.join(","),
      userId: useUserInfo.userInfo.user.id,
      gradeId: props.data?.[0]?.gradeId,
      subjectId: props.data?.[0]?.subjectId,
      subjectTypeId: props.data?.[0]?.subjectTypeId
    });
  });
  emit("done", target);
  selectedQuestions.value = [];
  indexList.value = [];
};
const onChooseTag = (value: string) => {
  inputTitle.value += value;
};
const onEditableChange = (index: number) => {
  tagsList.value[index].editable = !tagsList.value[index].editable;
  nextTick(() => {
    if (tagsList.value[index].editable && tagRefInput.value) {
      tagRefInput.value[0] && (tagRefInput.value[0] as HTMLInputElement).focus();
    }
    tagsList.value = tagsList.value.filter((item) => item.label);
  });
};
const onRemoveTag = (index: number) => {
  tagsList.value.splice(index, 1);
};
const onSelectAll = () => {
  indexList.value = dataSource.value.map((_, index) => index);
};
let t: any;
const startLoading = () => {
  if (loading.value) {
    const step = Math.floor(Math.random() * 8);
    t = setTimeout(() => {
      if (loadingPercent.value + step < 100) {
        loadingPercent.value += step;
      } else {
        loadingPercent.value = 99;
      }
      startLoading();
    }, Math.floor(Math.random() * (2200 - 1100 + 1)) + 800);
  } else {
    clearTimeout(t);
  }
};
const onClassificationClose = (result: QuestionAnswer[]) => {
  showNext.value = false;
  if (result) {
    const _result = encodeURIComponent(JSON.stringify(result));
    router.push({
      name: "question-generation",
      query: {
        createData: _result
      }
    });
  }
};
onBeforeMount(() => {
  const tags = window.localStorage.getItem(AI_GENERAL_KEY);
  if (tags) {
    tagsList.value = JSON.parse(tags);
  }
});
onBeforeUnmount(() => {
  window.localStorage.setItem(AI_GENERAL_KEY, JSON.stringify(tagsList.value));
});
watch(loading, () => {
  startLoading();
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.dialog-body {

}
.create-topic-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  padding: 20px;
  background-color: #fff;
  box-sizing: border-box;
  height: calc(100vh - 200px);
  overflow-y: hidden;

  .create-topic-content-left {
    width: 80%;
    background-color: #fff;

    :deep(.el-input__wrapper) {
      border: 1px solid $main-confirm-bg-color;
      box-shadow: none;
      padding-left: 0;
      outline: none !important;
    }

    :deep(.el-input__prefix .el-input__wrapper) {
      border: none;
    }

    .tag-wrapper {
      display: flex;
      min-height: 35px;

      .tag-item {
        margin-right: 10px;

        &:last-of-type {
          margin-right: 0;
        }
      }

      .tag-input {
        width: 80px;

        text-align: center;

        border-radius: 5px;
        height: 40px;

        &:deep(.el-input__wrapper) {
          border: 1px solid $main-confirm-bg-color;
          padding-left: 10px;
        }
      }
    }

    .tag {
      background-color: $main-confirm-bg-color;
      color: #fff;
      flex-shrink: 0;
      cursor: pointer;
      height: 40px;
    }

    .selector {
      outline: none !important;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        padding-right: 0;
        padding-left: 0;
        text-align: center;
        outline: none !important;
      }

      :deep(.el-input__inner) {
        text-align: center;
      }

      :deep(.el-input__wrapper.is-focus) {
        box-shadow: none !important;
        outline: none !important;
      }

      :deep(.el-select .el-input:focus) {
        outline: none;
        box-shadow: none;
        border-color: inherit;
      }
    }

    .title-input {
      box-shadow: $main-box-shadow;
      margin-bottom: 20px;
    }
  }

  .create-topic-content-right {
    flex: 1;
    height: 100%;
  }
}

.selector-option {
  &:hover {
    color: $main-confirm-bg-color;
  }
}

.buttons-generate {
  background-color: $main-confirm-bg-color !important;
  color: #fff !important;
  height: 100%;
  border-radius: 0 5px 5px 0;
  width: 80px;

  &:active {
    background-color: $main-confirm-bg-color-active-opacity !important;
  }
}

.generating {
  color: rgb(159, 159, 159);
  margin-block-start: 0.1em;
  margin-block-end: 0.3em;
}

.dashboard-loading {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(0, 0, 0, .2);
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 5;
}
</style>
