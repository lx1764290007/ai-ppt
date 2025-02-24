import { defineStore } from "pinia";
import type { QuestionAnswer, QuestionItem } from "@/interface/Topic";
import { computed, ref, watch } from "vue";
import { useDebounce } from "./useDebounce";
import { fetchQuestionAdd, fetchQuestionUpdate } from "@/http/question";
import type { Http } from "@/interface/Http";
import {
  covertQuestionAnswer2QuestionItem,
  covertQuestionItem2QuestionAnswer,
  objectCanCreate,
  objectCanSave, removeRedundantAnswers
} from "@/libs/tools";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const getStoreId = () => Math.random().toString(16);
export const useTopicStore = defineStore(getStoreId(), () => {
    const topicDataList = ref<QuestionItem[]>([]);
    const { t } = useI18n();
    const activeIndex = ref(0);
    const saving = ref(false);
    const isSaving = computed(() => saving.value);
    /**
     * 删除指定位置的元素
     * @param index
     */
    const remove = (index: number) => {
      topicDataList.value.splice(index, 1);
      if (index === activeIndex.value && index > 0) {
        activeIndex.value -= 1;
      } else if(index < activeIndex.value){
        activeIndex.value -= 1;
      }
    };
    const add = (target: QuestionItem) => {
      topicDataList.value.push(target);
    };
    const update = (target: QuestionItem, index: number, refresh = true) => {
      topicDataList.value[index] = target;
    };
    const insert = (target: QuestionItem, index: number) => {
      // 深度拷贝
      const newTarget = JSON.parse(JSON.stringify(target));
      if (index > -1) {
        if(objectCanCreate(newTarget)){
          fetchQuestionAdd([covertQuestionItem2QuestionAnswer(removeRedundantAnswers(newTarget))]).then((res: Http.Response<QuestionAnswer[]>) => {
            if (res.code === 200) {
              topicDataList.value = [
                ...topicDataList.value.slice(0, index),
                newTarget,
                ...topicDataList.value.splice(index, topicDataList.value.length)
              ];
              setActive(index + 1);
              update(covertQuestionAnswer2QuestionItem(res.data[0]), index);
            }
          })
        } else {
          topicDataList.value = [
            ...topicDataList.value.slice(0, index),
            newTarget,
            ...topicDataList.value.splice(index, topicDataList.value.length)
          ];
          setActive(index + 1);
        }
      }
    };
    const merge = (target: QuestionItem[]) => {
      topicDataList.value = topicDataList.value.concat(target);
    };
    const updateData = (showMsg: boolean) => {
      const _answer = covertQuestionItem2QuestionAnswer(removeRedundantAnswers(<QuestionItem>getActiveItem()));
      let __result = false, txt: string | any = "";
      try {
        __result = objectCanSave(_answer);
      } catch (e: unknown) {
        __result = false;
        txt = e;
      }
      if (!__result) {
        showMsg && ElMessage({
          message: txt ? t(txt) : t("questionEdit.questionError"),
          icon: "InfoFilled", // 自定义图标
          type: "info",
          duration: 3000,
          offset: 50
        });
        txt = "";
        return;
      }
      saving.value = true;
      fetchQuestionUpdate(covertQuestionItem2QuestionAnswer(removeRedundantAnswers(<QuestionItem>getActiveItem()))).then((res: Http.Response<any>) => {
        if (res.code === 200) {
          saving.value = false;
          ElMessage({
            message: t("questionEdit.saved"),
            icon: "Select", // 自定义图标
            type: "info",
            duration: 3000,
            offset: 50
          });
        }
      }).finally(() => {
        saving.value = false;

      });
    };
    const unshift = (data: QuestionItem[]) => {
      topicDataList.value = data.concat(topicDataList.value);
      activeIndex.value += data.length -1;
    };
    const createData = (pos: number, showMsg: boolean) => {
      const _target = Object.assign({}, getActiveItem(),
        {
          subjectId: topicDataList.value?.[0]?.subjectId,
          subjectTypeId: topicDataList.value?.[0]?.subjectTypeId,
          userId: topicDataList.value?.[0]?.userId,
          id: undefined,
          gradeId: topicDataList.value?.[0]?.gradeId
        });
      const result = covertQuestionItem2QuestionAnswer(removeRedundantAnswers(<QuestionItem>_target));
      if (!objectCanCreate(result)) {
        showMsg && ElMessage({
          message: t("questionEdit.incompleteTitleInformation"),
          icon: "InfoFilled", // 自定义图标
          type: "info",
          duration: 3000,
          offset: 50
        });
        return;
      }
      saving.value = true;
      fetchQuestionAdd([result]).then((res: Http.Response<QuestionAnswer[]>) => {
        if (res.code === 200) {
          update(covertQuestionAnswer2QuestionItem(res.data[0]), pos);
        }
      }).finally(() => {
        saving.value = false;
      });
    };
    const onSave = (showMsg: boolean = true) => {
      if (saving.value) return;
      const _activeItem = getActiveItem();

      if (_activeItem && _activeItem.id) {
        updateData(showMsg);
      } else {
        createData(activeIndex.value, showMsg);
      }
    };
    const onSaveHandle = useDebounce(onSave.bind(this, false), 1000);
    const onSaveImmediateHandle = () => onSave();

    const get = (index?: number) =>
      typeof index === "number" && index > -1 ? topicDataList.value[index] : topicDataList.value;
    const set = (target: QuestionItem[]) => (topicDataList.value = target);
    const getActive = () => activeIndex.value;
    const setActive = (index: number) => (activeIndex.value = index);
    const getActiveItem = () => {
      if (activeIndex.value > -1) {
        return topicDataList.value[activeIndex.value];
      }
      return null;
    };

    watch(
      topicDataList,
      (newVal, oldValue) => {

        if (oldValue.length < 1) {
          return;
        }
        if (newVal?.length === oldValue?.length) {
          onSaveHandle();
        }
        // 如果需要初始化数据时，把Immediate选项设为true，此回调将会立即执行一次
      },
      { immediate: false, deep: true }
    );
    return {
      add,
      remove,
      update,
      get,
      set,
      getActive,
      setActive,
      getActiveItem,
      insert,
      onSaveImmediateHandle,
      isSaving,
      unshift,
      merge
    };
  })
;

export const useCreateTopicByAi = defineStore(getStoreId(), () => {
  const showModal = ref(false);

  return { showModal };
});
