<template>

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
              @dblclick.stop="onEditableChange(index, $event)"
              closable
              type="info"
              v-if="!item.editable"
            >
              {{ item.label }}
            </el-tag>

            <el-input
              v-model="item.label"
              ref="tagRefInput"
              :style="{width: currentTagWidth + 'px'}"
              :placeholder="$t('createQuestion.input')"
              v-else
              size="large"
              @blur="onEditableChange(index, $event)"
              class="tag-input"
            />

          </div>
        </div>
      </el-scrollbar>
      <el-form @submit.prevent="onSubmit">

          <el-input
            clearable
            :placeholder="$t('createQuestion.input')"
            size="large"
            v-model="inputTitle"
            class="title-input"
          >
            <template #prefix>
              <el-select
                v-model="themeValue"
                @change="onChange"
                placeholder="选择主题"
                size="large"
                class="selector"
                :style="{width: i18n.locale.value === 'EN'? '130px':'100px'}"
              >
                <el-option
                  v-for="item in themeDemo"
                  :key="item.value"
                  :label="$t(item.label)"
                  :value="item.value"
                >
                  <div class="option-item">
                    <el-image :src="item.icon" fit="contain" :class="{'theme-icon':true, 'icon-fix': item.value === useQuestionType().JUDGEMENT}"></el-image>
                    <span class="selector-option">{{ $t(item.label) }}</span>
                  </div>

                </el-option>
              </el-select>
            </template>
            <template #append>
              <el-button native-type="submit" class="buttons-generate" @click.stop="onSubmit" :loading="loading" style="width: 120px">
                {{ $t("header.header_item_line4") }}
              </el-button>
            </template>
          </el-input>

      </el-form>
      <!--      <p class="generating" v-if="loading">-->
      <!--        {{$t("createQuestion.working")}}-->
      <!--      </p>-->
      <el-empty :description="$t('createQuestion.empty')"
                v-if="!loading && dataSource.length<1 && generateTypeValue === GENERATE_TYPE[0].value" image-size="120"
                style="margin-top: 100px" />
      <TopicPreviewList
        is-full-screen
        ref="previewRef"
        @load-image="onLoadImageSuccess"
        :data-source="dataSource"
        v-model:index-list="indexList"
        v-if="generateTypeValue === GENERATE_TYPE[0].value"
      >
        <div class="dashboard-loading" v-if="loading">
          <el-progress type="dashboard" :percentage="loadingPercent" color="#553fc5" />
          <span class="dashboard-tip">{{ $t("createQuestion.generationTip") }}</span>
        </div>

      </TopicPreviewList>
      <file-upload v-else />

    </div>
    <div class="create-topic-content-right">
      <CreateTopicController
        @select-all="onSelectAll"
        :index-list="indexList"
        @update:tag-list="()=> currentTagWidth = 80"
        ref="controllerRef"
        :generating="getGenerating || loading"
        @done="onDone"
        :length="dataSource.length"
        is-full-screen
        v-model:tag-list="tagsList"
        v-model:generate-type="generateTypeValue"
      />
    </div>
  </div>
  <select-classification
    :show="showNext"
    :data-source="selectedQuestions"
    :grade="result.grade"
    @close="onClassificationClose" />

</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeMount, onBeforeUnmount, ref, watch } from "vue";
import TopicPreviewList from "@cs/CreateTopic/Topic-Preview-List/Topic-Preview-List.vue";
import { useCreateAiTopic, useTopicDict } from "@/libs/useTopicDict";
import CreateTopicController from "@cs/CreateTopic/Create-Topic-Controller/Create-Topic-Controller.vue";
import type { Question, QuestionAnswer, QuestionGeneral, QuestionItem } from "@/interface/Topic";
import FileUpload from "@cs/CreateTopic/File-Upload/File-Upload.vue";
import { AI_GENERAL_KEY } from "@/libs/KEY";

import SelectClassification from "@vs/Question-Editor/Select-Classification.vue";
import { ElMessage } from "element-plus";
import { fetchAIPhoto, fetchQuestionGenerate } from "@/http/question";
import type { Http } from "@/interface/Http";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuestionType } from "@/libs/useQuestionType";



const tagRefInput = ref(null);

const showNext = ref(false);
const loading = ref(false);
const dataSource = ref<QuestionItem[]>([]);
const tagsList = ref<{ label: string; id: number; editable: boolean }[]>([]);

const result: QuestionGeneral = {
  text: "",
  questionType: 1,
  grade: 1,
  subject: 1,
  count: "1-10",
  language: "zh",
  area: ""
};

const props = withDefaults(
  defineProps<{
    visible: boolean;
    pictureUrl?: string;
  }>(),
  {
    visible: false
  }
);
let i18n = useI18n();
const inputTitle = ref<string>("");
const selectedQuestions = ref<QuestionItem[]>([]);
const topicDict = useTopicDict();
const themeDemo = ref<{ value: number; label: string, icon: string }[]>(topicDict.filter(it=> !it.special));
const themeValue = ref<number | undefined>();
const loadingPercent = ref<number>(0);
const DEFAULT_ERROR_IMAGE = "https://dreamlab.oss-us-east-1.aliyuncs.com/nopic.png";
const router = useRouter();
setTimeout(() => {
  themeValue.value = topicDict[0].value;
}, 50);

const indexList = ref<number[]>([]);
const show = ref(props.visible);
const previewRef = ref();

const currentTagWidth = ref(80);
const GENERATE_TYPE = useCreateAiTopic();
const generateTypeValue = ref<number>(GENERATE_TYPE[0].value);
const emit = defineEmits<{
  (event: "update:visible", value?: boolean): void;
  (event: "done", value?: string): void;
}>();

watch(() => props.visible, (value) => {
  show.value = value;
});

const onClose = () => {
  emit("update:visible");
};
const onChange = (event: any) => {
  console.log("onChange", event, themeValue.value);
};
const getImages = (key: string, index: number) => {
  fetchAIPhoto({
    imageDescription: key || "",
    imageNum: 1
  }).then((res: Http.Response<{ image: string, title: string }[]>) => {
    if (res.code === 200) {
      dataSource.value[index].images = res.data;
    }
  }).catch((e) => {
    getImages(key, index);
  });
};

const onLoadImageSuccess = (data: { url: string, index: number }) => {
  dataSource.value[data.index].images[0].image = data.url;
};
const getGenerating = computed(() => {
  return !dataSource.value.every((item) => item.images?.[0]?.image);
});
const onSubmit = async () => {
  loadingPercent.value = 0;
  const _gradeId = controllerRef.value?.getValues()?.grade;
  const target = Object.assign({
    text: inputTitle.value
  }, controllerRef.value?.getValues(), {
    questionType: themeValue.value
  }, {
    grade: _gradeId
  });
  if (inputTitle.value.trim()) {
    loading.value = true;
    dataSource.value.length = 0;
    indexList.value.length = 0;
    fetchQuestionGenerate(target).then((res: Http.Response<Question>) => {
      if (res.code === 200) {
        loadingPercent.value = 100;
        dataSource.value = res.data.questions.map(it => {
          return {
            ...it,
            options: typeof it.options === "object" ? it.options : (it.options as string).split(","),
            //@ts-ignore
            answer: typeof it.options === "object" ? it.answer : (it.answer as string).split(","),
            images: [{ image: "", title: it.images?.[0]?.title }]
          };
        });
        previewRef.value?.onRest?.();
        dataSource.value.map((it, i) => {
          getImages(it.image_keywords?.[0], i);
        });
        setDefaultImageOnError();
      }
    }).finally(() => loading.value = false);
  }
};
let _t: any = undefined;
const setDefaultImageOnError = () => {
  _t = setTimeout(() => {
    dataSource.value = dataSource.value.map(it => {
      return {
        ...it,
        images: it.images?.[0]?.image ? it.images : [{
          title: "",
          image: DEFAULT_ERROR_IMAGE
        }]
      };
    });
  }, 60 * 1000);
};
const controllerRef = ref();
const getEmptyText = () => i18n.t("createQuestion.emptyTips");
const onDone = (event: { count: string, language: string, grade: number, area: string }) => {
  if (inputTitle.value.trim() && dataSource.value.length < 1 && !loading.value) {
    onSubmit();
    return;
  }
  selectedQuestions.value = previewRef.value?.getSelectedList() || [];
  if (selectedQuestions.value.length < 1) {
    ElMessage({
      message: getEmptyText(),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  if (!dataSource.value.every(it => it.images?.[0]?.image)) {
    ElMessage({
      message: i18n.t("createQuestion.wait"),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  result.text = inputTitle.value;
  result.questionType = themeValue.value as number;
  result.grade = event.grade;
  result.count = event.count;
  result.language = event.language;
  result.area = event.area;
  showNext.value = true;
};
let _timeout: any = null;
const onChooseTag = (value: string) => {
  clearTimeout(_timeout);
  _timeout = setTimeout(() => {
    inputTitle.value += value;

  }, 300); // 延迟 300ms，等待双击事件是否触发

};
const onEditableChange = (index: number, event: MouseEvent) => {
  clearTimeout(_timeout);
  const currentTarget = event.currentTarget as HTMLInputElement;
  currentTagWidth.value = currentTarget?.getBoundingClientRect?.()?.width || 80;
  if (currentTarget.tagName === "SPAN") {
    tagsList.value.forEach(it => it.editable = false);
  }
  tagsList.value[index].editable = !tagsList.value[index].editable;
  nextTick(() => {
    if (tagsList.value[index].editable && tagRefInput.value) {
      tagRefInput.value[0] && (tagRefInput.value[0] as HTMLInputElement).focus();
    }
    tagsList.value = tagsList.value.filter((item) => item.label);
    window.localStorage.setItem(AI_GENERAL_KEY, JSON.stringify(tagsList.value.map(it => {
      return {
        ...it,
        editable: false
      };
    })));
  });
};
const onRemoveTag = (index: number) => {
  tagsList.value.splice(index, 1);
};
const onSelectAll = (selectAll: boolean = true) => {
  if (selectAll) {
    indexList.value = dataSource.value.map((_, index) => index);
  } else {
    indexList.value.length = 0;
  }

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
const onClassificationClose = (result?: QuestionAnswer[]) => {
  showNext.value = false;
  if (result) {
    const _result = encodeURIComponent(JSON.stringify(result));
    const _key = "CREATE_QUESTION";
    window.sessionStorage.setItem(_key, _result);
    router.push({
      name: "question-generation",
      query: {
        key: _key
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
  //window.localStorage.setItem(AI_GENERAL_KEY, JSON.stringify(tagsList.value));
  clearTimeout(_t);
});
watch(loading, () => {
  startLoading();
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.option-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 80px;

  .theme-icon {
    width: 24px;
    transform: translateY(5px);
  }
}

.create-topic-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;


  box-sizing: border-box;
  height: calc(100vh - 70px);
  overflow-y: hidden;

  .create-topic-content-left {
    width: 80%;

    &:deep(.el-input__wrapper.is-focus){
      box-shadow: none !important;
    }
    &:deep(.el-select .el-input.is-focus .el-input__wrapper){
      box-shadow: none !important;
    }

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
      min-height: 40px;
      margin-top: 10px;
      .tag-item {
        margin-right: 10px;

        &:last-of-type {
          margin-right: 0;
        }
      }

      .tag-input {
        width: auto;

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
      &:deep(.el-tag__close){
        color: #fff;
      }
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
  margin-left: 8px;

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
  opacity: 0;
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

  .dashboard-tip {
    color: #2c3e50;
    font-size: 14px;
    position: absolute;
    margin-top: 140px;
  }
}
.icon-fix {
  width: 27px !important;
  height: 27px !important;
  margin-left: -2px;
  margin-bottom: 7px;
}
</style>
