<template>
  <popup-component v-model:modal-value="visible">
    <div class="select-classification--wrapper" :style="{width: locale === 'en'? '450px':'410px'}">
      <div class="select-classification--header">
  <span :class="{'select-classification--title':true}">
          {{$t("createQuestion.relateQuestionBank")}}
        </span>
        <el-icon class="select-classification__close" @click="()=> onClose()">
          <Close />
        </el-icon>
      </div>
      <div class="select-classification">
        <div class="select-item"  >
          <span style="font-size: 16px" :class="{'select-item-label--en':locale === 'en'}">{{$t("createQuestion.selectDepartment")}}：</span>
          <el-select :placeholder="$t('createQuestion.selectDepartment')"
                     size="large"
                     filterable
                     remote
                     allow-create
                     @change="onChange"
                     :remote-method="onSearch"
                     style="width: 210px"
                     :no-data-text="locale==='en'? $t('createQuestion.atThisDifficulty') + grade:$t('createQuestion.atThisDifficulty')+grade+$t('createQuestion.noSubject')"
                     v-model="classification"
                     class="input__default_theme">
            <el-option :label="item.subjectName || locale === 'en'? item.subjectNameEn : locale === 'zh_hant'? item.subjectNameHk : item.subjectNameCn" :value="item.id" :key="index" v-for="(item, index) of subjectList" />

          </el-select>
        </div>
        <div class="select-item" >
          <span style="font-size: 16px" :class="{'select-item-label--en':locale === 'en'}">{{$t('createQuestion.bankName')}}：</span>
<!--          <el-select placeholder="选择题库"-->
<!--                     size="large"-->
<!--                     :no-data-text="getGradeName? `此分类下(${getGradeName})没有题库`:`请先选择分类`"-->
<!--                     :loading="topicTypeLoading"-->
<!--                     v-model="questions"-->
<!--                     class="input__default_theme">-->
<!--            <el-option :label="item.typeName" :value="item.id" v-for="(item,i) of topicTypeList" :key="i" />-->
<!--          </el-select>-->
          <el-input type="text" style="width: 210px"
                    v-model="questions"
                    size="large"
                    :placeholder="$t('createQuestion.input')"
                    clearable
                    class="input__default_theme" />
        </div>
      </div>
      <div class="select-classification--footer">
        <el-button class="buttons-primary" size="large" @click.stop="onCreateQuestion" :loading="loading">
          {{$t('createQuestion.confirm')}}
        </el-button>
        <el-button class="buttons-default" style="width: 150px" size="large" @click="()=> onClose()">
          {{$t('createQuestion.cancel')}}
        </el-button>
      </div>
    </div>
    <loading-component :show="loading" />
  </popup-component>
</template>
<script setup lang="ts">
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { nextTick, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { fetchTopicList, fetchTopicTypeList, fetchTopicTypeSearch } from "@/http/topic";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import type { TopicOverview, TopicType } from "@/interface/TopicOverview";
import type { QuestionAnswer, QuestionItem } from "@/interface/Topic";
import { fetchQuestionAdd, fetchSearchTopic } from "@/http/question";
import { ElMessage } from "element-plus";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { covertQuestionItem2QuestionAnswer } from "@/libs/tools";
import { useI18n } from "vue-i18n";
import { getGradeList } from "@/libs/useGrade";

const props = defineProps<{
  show: boolean
  grade: number
  dataSource: QuestionItem[]
}>();
const emit = defineEmits<{
  (event: "close", value: QuestionAnswer[]|undefined): void
}>();
const visible = ref(props.show);
const classification = ref();
const questions = ref();
const userInfo = useUserInfo();
const subjectList = ref<TopicOverview[]>([]);
const topicTypeLoading = ref(false);
const topicTypeList = ref<TopicType[]>([]);
const {locale,t} = useI18n();
const onClose = (obj?:QuestionAnswer[]) => {
  classification.value = undefined;
  emit("close", obj);
}
const loading = ref(false);

const getData = async (gradeId: number) => {
  const gradeList = await getGradeList();
  const _grade = gradeList.find(it => it.grade === gradeId)?.id;
  fetchTopicList({
    gradeId: _grade,
    userId: userInfo.getUserInfo?.user?.id
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.code === 200) {
      subjectList.value = res.data;
    }
  });
};

const getTopicTypeList = () => {
  if (topicTypeList.value.length > 0 || isNaN(classification.value)) return
  fetchTopicTypeList({
    subjectId: classification.value,
    userId: userInfo.getUserInfo?.user?.id
  }).then((res: Http.Response<TopicType[]>) => {
    if (res.code === 200) {
      topicTypeList.value = res.data;
    }
  }).catch(e=> console.error(e)).finally(() => topicTypeLoading.value = false);
};
const searchTopicTypeList = async () => {

  // const grade = userInfo.userInfo?.grade.find(it => it.grade === props.grade);
  const gradeList = await getGradeList();
  const _grade = gradeList.find(it => it.grade === props.grade)?.id;
  return await fetchTopicTypeSearch({
    subjectName: isNaN(classification.value)? classification.value: subjectList.value.find(it=> it.id === classification.value)?.subjectName,
    subjectNameCn: isNaN(classification.value)? classification.value: subjectList.value.find(it=> it.id === classification.value)?.subjectNameCn,
    subjectNameHk:isNaN(classification.value)? classification.value: subjectList.value.find(it=> it.id === classification.value)?.subjectNameHk,
    subjectNameEn: isNaN(classification.value)? classification.value: subjectList.value.find(it=> it.id === classification.value)?.subjectNameEn,
    gradeId: _grade,
    subjectTypeName: questions.value
  }) as Http.Response<{ id:number,subjectId: number }>
}

const onCreateQuestion = async () => {
  if(!questions.value || String(questions.value).trim().length < 1) {
    ElMessage({
      message: t('createQuestion.questionNameIsNotFilledIn'),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return
  }
  if(!classification.value || String(classification.value).trim().length < 1){
    ElMessage({
      message: t('createQuestion.noTopicSelect'),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return
  }

  loading.value = true;

  const topicTypeData = await searchTopicTypeList();

  if(topicTypeData.code === 200){
    const gradeList = await getGradeList();
    const _grade = gradeList.find(it => it.grade === props.grade)?.id;
    const target: Array<QuestionAnswer> = props.dataSource.map(it => {
      return covertQuestionItem2QuestionAnswer({
        ...it,
        type: it.type,
        question: it.question,  //问题
        questionImg: it.images[0].image,
        maxTime: 10,  //答题时间限制 秒
        correctAnswer: it.answer.join(","),
        userId: userInfo.getUserInfo?.user?.id,
        gradeId: _grade,
        subjectId: topicTypeData.data.subjectId,
        subjectTypeId: topicTypeData.data?.id,
        id: 0,
        remark: "",
        displayLink: it.images[0]?.title,
        reserve: it.images[0]?.title,
        copyRight: ""
      });
    });

    fetchQuestionAdd(target).then((res: Http.Response<any>) => {
      if (res?.code === 200) {
        ElMessage({
          message: t('createQuestion.added'),
          icon: "Warning", // 自定义图标
          type: "info",
          duration: 3000,
          offset: 50
        });
        nextTick(()=> onClose(res.data));
      }
    }).finally(()=> {
      loading.value = false;
    }).catch((e:any)=> {
      loading.value = false;
    })
  }
};
const onChange = (value:string)=> {
  console.log(value);
}
const onSearch = async (value:string)=> {
   if(!value.trim()) return
  const gradeList = await getGradeList();
    const _grade = gradeList.find(it => it.grade === props.grade)?.id;
    fetchSearchTopic({
      subjectName: value || classification.value,
      gradeId: _grade
    }).then((res:Http.Response<TopicOverview[]>) => {
      if (res?.code === 200) {
        subjectList.value = res.data.concat(subjectList.value);
      }
    })
}
watch(() => props.show, (cb) => {
  visible.value = cb;
  if (cb) {
    if (props.grade) {

      getData(props.grade);
    }
  }
});

watch(loading, (cb)=> {
  if(cb){
    setTimeout(() => {
      loading.value = false;
    }, 30000)
  }
})
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.select-classification--wrapper {
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;
  width: 400px;

  .select-classification {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }

  .select-classification--header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 20px 10px;

    .select-classification--title {
      font-size: 18px;
      font-weight: bold;
      display: inline-block;
    }


    .select-classification__close {
      font-size: 24px;
      color: #525252;

      &:hover {
        cursor: pointer;
        color: #494949;
      }
    }
  }

  .select-classification--footer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
    margin-bottom: 10px;
  }

  .select-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 410px;
    text-align: right;
  }
  .select-item-label--en {
    display: inline-block;
    width: 175px;
    white-space: nowrap;
  }

  .select-item + .select-item {
    margin-top: 20px;
  }
}
</style>