<template>
  <div :class="{'topic-controller-wrapper':true,'topic-controller-wrapper-full--screen': isFullScreen}">
    <div class="handler">
      <img src="@/assets/delete.png" alt="delete" @click="onTagDelete" />
      <el-button type="primary" class="button default__button-primary" @click="onTagAdd" size="large">
        <el-image :src="tagIcon" alt="icon" fit="contain" style="width: 16px;margin-right: 5px;" />
        {{$t('questionEdit.addTag')}}
      </el-button>
<!--      <img src="@/assets/plus.png" alt="plus" @click="onTagAdd" />-->
    </div>
    <div class="topic-controller-main">
      <el-select
        v-model="option"
        @change="onTypeChange"
        class="input__default_theme"
        style="width: 100%"
        size="large"
      >
        <el-option
          v-for="item of options"
          :key="item.value"
          :value="item.value"
          :label="$t(item.label)"
        >
          <div class="option ">

            <span :class="{ 'active-color': item.value === option }">{{ $t(item.label) }}</span>
          </div>
        </el-option>
      </el-select>
      <div class="topic-controller-item">
        <p class="label-title">{{$t("header.header_item_line2")}}</p>
        <el-select
          v-model="grade"
          class="input__default_theme"
          style="width: 100%"
          size="large"
          @change="onItemChange('grade', grade)"
        >
          <el-option
            v-for="item of gradeList"
            :key="item.grade"
            :value="item.grade"
            :label="item.grade === 0? $t(item.gradeName) : locale === 'en'? 'K' + item.gradeName : item.gradeName + $t('grade.grade')"
          >
            <div class="option">
              <span :class="{ 'active-color': item.grade === grade }">{{
                  item.grade === 0? $t(item.gradeName) : locale === 'en'? 'K' + item.gradeName : item.gradeName + $t('grade.grade')
              }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="topic-controller-item">
        <p class="label-title">{{$t("createQuestion.topicNum")}}</p>
        <el-input-number
          v-model="topicTotalValue"
          class="input__default_theme"
          style="width: 100%"
          size="large"
          min="1"
          :precision="0"
          max="30"
          @input="onItemChange('count', $event)"
        >
          <el-option
            v-for="item of topicTotal"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            <div class="option">
              <span :class="{ 'active-color': item.value === topicTotalValue }">{{
                item.label
              }}</span>
            </div>
          </el-option>
        </el-input-number>
      </div>
      <div class="topic-controller-item">
        <p class="label-title">
          {{$t("createQuestion.area")}}
        </p>
        <el-select
          v-model="area"
          class="input__default_theme"
          style="width: 100%"
          size="large"
          @change="onItemChange('area', area)"
        >
          <el-option
            v-for="item of areaList"
            :key="item.countryCode"
            :value="item.countryName"
            :label="item.countryName"
          >
            <div class="option option-icons">
              <el-image :src="item.flagUrl" fit="contain" class="my-image" />
              <span :class="{ 'active-color': item.countryName === area }" style="margin-left: 5px">{{
                  item.countryName
                }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
      <div class="topic-controller-item">
        <p class="label-title">
          {{$t("createQuestion.language")}}
        </p>
        <el-select
          v-model="languageValue"
          class="input__default_theme"
          style="width: 100%"
          size="large"
          @change="onItemChange('language', languageValue)"
        >
          <el-option
            v-for="item of languageList"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
            <div class="option">
              <span :class="{ 'active-color': item.value === languageValue }">{{
                  item.label
                }}</span>
            </div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div :class="{'topic-controller-footer':true,'topic-controller-footer-full--screen': isFullScreen}" >
      <p class="is-selected">{{$t('createQuestion.selected')}} {{ indexList.length }} {{$t('createQuestion.question')}}</p>
      <el-button class="footer-button buttons-default"  size="large" @click="()=>onSelectAll(length !== indexList.length)"
        >{{length === 0? $t("createQuestion.empty") : length !== indexList.length? $t("createQuestion.selectAll"):$t("createQuestion.invert")}}</el-button
      >
      <el-button class="footer-button buttons-primary" :loading="generating" @click="onDone"  size="large">{{generating? $t('questionEdit.loading') : isFullScreen? $t('createQuestion.next'):$t('createQuestion.done')}}</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useCreateAiTopic, useLanguage, useTopicTotal } from "@/libs/useTopicDict";
import { nextTick, onBeforeMount, onMounted, ref, watch } from "vue";
import { useUserInfoStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import { fetchAreas } from "@/http/topic";
import type { Http } from "@/interface/Http";
import { useI18n } from "vue-i18n";
import { getGradeList } from "@/libs/useGrade";
import { transformIquizLanguageToArtlab } from "@/libs/useLanguageEnum";
import tagIcon from "@/assets/tag.png";

interface Area {
  id: number
  countryName: string
  countryCode: string
  flagUrl: string
}

interface ControllerValue {
  questionType: number
  count: number
  language: string
  grade: number
  area: string
}


const props = withDefaults(
  defineProps<{
    indexList: number[];
    tagList: { label: string; id: number; editable: boolean }[];
    generateType: number;
    length: number;
    isFullScreen?:boolean
    generating: boolean
  }>(),
  {
    indexList() {
      return [];
    },
    length: 0,
    generating: false,
    tagList() {
      return [];
    }
  }
);
const userInfoStore = useUserInfoStore();
const options = useCreateAiTopic();
const areaList = ref<Area[]>([]);
const option = ref<number>(props.generateType);
const grade = ref<number>();
const area = ref<string>("HK");
const {locale, t} = useI18n();
const gradeList = ref<{grade: number, gradeName:string}[]>([]);
const topicTotal = useTopicTotal();
const topicTotalValue = ref(topicTotal[0].value);
const tags = ref<{ label: string; id: number; editable: boolean }[]>(props.tagList);
const languageValue = ref(useLanguage()[0].value);
const languageList = useLanguage();
const emit = defineEmits<{
  (ev: "select-all", value: boolean): void;
  (ev: "change", value: {key:string, value:any}): void;
  (ev: "done", value: {count:string,language: string,grade:number, area: string}): void;
  (ev: "update:generateType", value: number): void;
  (ev: "update:tagList", value: { label: string; id: number; editable: boolean }[]): void;
}>();
onMounted(()=> {
  languageValue.value = useLanguage().find(it=> it.code === transformIquizLanguageToArtlab(locale.value))?.value || useLanguage()[0].value
})
const onSelectAll = (selectAll:boolean) => {
  emit("select-all", selectAll);
};
const onTypeChange = (value: number) => {
  emit("update:generateType", value);
};
const getValues = ():ControllerValue => {
  return {
    questionType: option.value,
    count: topicTotalValue.value,
    language: languageValue.value,
    grade:grade.value as number,
    area: area.value
  }
}
const onTagDelete = () => {
  tags.value.pop();
  emit("update:tagList", tags.value);
};
const getArea = ()=> {
  fetchAreas().then((res:Http.Response<Area[]>)=> {
    if(res.code === 200) {
      areaList.value = res.data;
      area.value = res.data[0]?.countryName;
    }
  })
}
const onTagAdd = () => {
  const { length } = tags.value;
  if (length > 0 && !tags.value[length - 1].label) return;
  tags.value.push({
    label: "",
    id: length - 1 < 1 ? 1 : tags.value[length - 1].id + 1,
    editable: true
  });
  emit("update:tagList", tags.value);
};
const getText = ()=>  t("createQuestion.selectNone");
const onDone = ()=> {
  if(topicTotal.length<1){
    ElMessage({
      message: getText(),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return
  }
  emit("done", {count:topicTotalValue.value,language: languageValue.value,grade: grade.value, area: area.value});
}
const setGradeList = async ()=> {
    gradeList.value = await getGradeList();
    await nextTick(() => {
        grade.value = gradeList.value[0].grade;
    })

}
watch(()=>props.tagList, (newValue) => {
  tags.value = newValue;
});
// watch(userInfoStore.userInfo, (newValue) => {
//   if(newValue){
//     gradeList.value = newValue.grade.map((it:Grade.Item)=> {
//       return {
//         gradeName: it.gradeName,
//         grade: it.id
//       }
//     })
//     grade.value = gradeList.value[0].grade;
//   }
// },{
//   immediate: true
// })
const onItemChange = (key:string, value:any)=> {
  if(key==='count'){
     value = parseInt(value);
    if(!value){
      emit("change",{key, value:1});
      setTimeout(()=>{
        topicTotalValue.value = 1;
      },100)
      return
    }
  }
  if(key==='grade'){
    const gradeNum = gradeList.value.find(it=> it.grade === value)?.grade
    emit("change",{key,value: gradeNum});
    return
  }
   emit("change",{key,value});
}
onBeforeMount(()=> {
  getArea();
  setGradeList();
})
defineExpose<{
  getValues: ()=> ControllerValue
}>({
  getValues
})
</script>
<style scoped lang="scss">
@import "@/theme";
.topic-controller-wrapper {
  position: relative;
  top: 0;
}
.option-icons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .my-image {
    width: 30px;
  }
}
.topic-controller-wrapper-full--screen {
  position: relative;
  top: 0;
  height: 100%;
  padding-top: 5px;
}
.handler {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-left: 22px;
  box-sizing: border-box;
  margin: 0 auto;
  img {
    width: 25px;
    cursor: pointer;
  }
}
.topic-controller-main {
  box-sizing: border-box;
  padding: 22px 0 22px 22px;
  position: relative;
}

.option {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  img.option-icon {
    width: 22px;
    margin-right: 10px;
  }

  &:hover {
    color: $menu-item-hover-bg;
  }
  .active-color {
    color: $main-active-font-color;
  }
}
.topic-controller-item {
  margin-top: 20px;
  .label-title {
    font-size: 16px;
    font-weight: 600;
    margin-block-start: .5em;
    margin-block-end: .5em;
  }
}
.topic-controller-footer {
  position: relative;
  margin-top: 80px;
  box-sizing: border-box;
  padding: 22px 0 0 22px;
  .is-selected {
    text-align: center;
    color: #6c6c6c;
    margin-block-end: 22px;
  }
  .footer-button {
    width: 100% !important;
    margin-left: 0;
  }
  .footer-button:first-of-type {
    margin-bottom: 24px;
  }
}
.topic-controller-footer-full--screen {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
}
</style>
