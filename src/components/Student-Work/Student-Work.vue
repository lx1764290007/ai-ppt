<template>
  <div class="student-work--tools">
    <el-icon class="themes-back" @click="onBackToTheme" v-if="showWorkItem && searchParams.type === WORK_TYPE.STUDENT">
      <img src="@/assets/back.png" alt="back" class="themes-back--img"  />

    </el-icon>
    <el-icon class="student-work--close" @click="onBack">
      <Close />
    </el-icon>
  </div>
  <div class="table-header student-work--header">
    <div class="student-work--left_side" v-show="!showWorkItem">
      <el-button size="large"
                 style="border-radius: 10px;min-width: 120px"
                 :class="{'default__button-active': searchParams.type === WORK_TYPE.THEME}"
                 @click="onChange(WORK_TYPE.THEME)">{{$t('creation.theme_creation')}}
      </el-button>
      <el-button size="large"
                 style="border-radius: 10px;min-width: 120px"
                 :class="{'default__button-active': searchParams.type === WORK_TYPE.FREE}"
                 @click="onChange(WORK_TYPE.FREE)">{{$t('creation.free_creation')}}
      </el-button>
      <el-button size="large"
                 style="border-radius: 10px;min-width: 120px"
                 :class="{'default__button-active': searchParams.type === WORK_TYPE.STUDENT}"
                 @click="onChange(WORK_TYPE.STUDENT)">{{$t('creation.student_works')}}
      </el-button>
    </div>
    <div class="student-work--right_side" v-if="!showWorkItem">
      <el-input :placeholder="$t('creation.theme_name')"
                class="default__input"
                v-model="themeName"
                style="margin-right: 15px;width:180px"
                v-if="searchParams.type === WORK_TYPE.STUDENT"
                size="large" prefix-icon="Search" />
      <el-input :placeholder="$t('creation.work_name')"
                class="default__input"
                v-model="themeWorkName"
                style="margin-right: 15px;width:180px"
                v-if="searchParams.type === WORK_TYPE.THEME"
                size="large" prefix-icon="Search" />
      <el-input :placeholder="$t('creation.work_name')"
                class="default__input"
                v-model="freeName"
                style="margin-right: 15px;width:180px"
                v-if="searchParams.type === WORK_TYPE.FREE"
                size="large" prefix-icon="Search" />
      <div class="student-work--right_side_student" v-show="searchParams.type === WORK_TYPE.STUDENT">
        <el-select
          clearable
          class="select"
          :placeholder="$t('grade.grade')"
          v-model="searchParams.gradeId"
          size="large"
          @change="onGradeChange"
          style="width: 120px;margin-right: 15px; ">
          <el-option v-for="(item, i) of gradeList" :key="i" :label="item.gradeName" :value="item.id">
          </el-option>
        </el-select>
        <el-select
          clearable
          :placeholder="$t('grade.class')"
          v-model="searchParams.classesId"
          size="large"
          class="select"
          style="width: 120px;margin-right: 15px;">
          <el-option v-for="(item,index) of classes" :key="index" :label="item.classes" :value="item.id" />
        </el-select>
      </div>
      <el-button style="width: 100px" type="primary" class="default__button-primary" size="large" @click="onSearch">
        {{$t('universal.filter')}}
      </el-button>
    </div>
    <div class="student-work--right_side" v-else>
      <el-input :placeholder="$t('creation.work_name')"
                class="default__input"
                v-model="searchParams.name"
                style="margin-right: 15px;width:180px"
                size="large" prefix-icon="Search" />
      <el-button type="primary" class="default__button-primary" size="large" @click="getDataSource" style="width: 100px">
        {{$t('universal.search')}}
      </el-button>
    </div>
  </div>

  <div class="student__work--themes" v-if="!showWorkItem && searchParams.type === WORK_TYPE.STUDENT">
    <div class="student__work--themes-item" v-for="(item, index) of themeList" :key="index">
      <el-image :src="folderImg" alt="folder" fit="contain" class="themes__item--folder"
                @click="onSelectFolder(item.id)" />
      <input class="theme-input" :placeholder="$t('universal.placeholder')" v-model="item.themeName"
             @change="onUpdateTheme(item.id, $event.target.value)" />
    </div>
    <p class="empty-text" v-if="showEmpty_themeList">{{$t('universal.empty')}}</p>
  </div>

  <div class="student-work--content"  v-else-if="showWorkItem && searchParams.type === WORK_TYPE.STUDENT">

    <div class="student-work--item" v-for="item of workList" :key="item.id" @click="onShowAiEvaluate(item)">
      <div class="production-img">
        <el-image :src="item.production" alt="picture" fit="contain" />
      </div>
      <div class="student-work--item_bottom">
        <p class="student-work--item_bottom-title">
          <span class="student-work--item_bottom-title-left" :title="item.productionname">{{ item.productionname }}</span>
          <span class="student-work--item_bottom-title-right" :title="item.author">{{item.author}}</span>
        </p>
        <p>{{ dayJS(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}</p>
      </div>
    </div>
    <p class="empty-text" v-if="showEmpty_student">{{$t('universal.empty')}}</p>
  </div>
  <div class="student-work--content"  v-if="searchParams.type === WORK_TYPE.FREE">

    <div class="student-work--item free-creation-item" v-for="item of freeWorkList" :key="item.id">
      <div class="production-img free-creation-img">
        <el-image :src="item.photoUrl" alt="picture" fit="contain" />
      </div>
      <div class="student-work--item_bottom free-creation-item--bottom">
        <p class="student-work--item_bottom-title free-creation-item--bottom-title">
          {{ item.curriculumKey }}
        </p>
        <p>{{ dayJS(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}</p>
      </div>
    </div>
    <p class="empty-text" v-if="showEmpty_free">{{$t('universal.empty')}}</p>
  </div>
  <div class="student-work--content"  v-if="searchParams.type === WORK_TYPE.THEME">
    <div class="student-work--item free-creation-item" v-for="item of themeWorkList" :key="item.id">
      <div class="production-img free-creation-img">
        <el-image :src="item.photoUrl" alt="picture" fit="contain" />
      </div>
      <div class="student-work--item_bottom free-creation-item--bottom">
        <p class="student-work--item_bottom-title free-creation-item--bottom-title">
          {{ item.curriculumKey }}
        </p>
        <p>{{ dayJS(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}</p>
      </div>
    </div>
    <p class="empty-text" v-if="showEmpty_themes">{{$t('universal.empty')}}</p>
  </div>
<!--  <div class="student-work&#45;&#45;content" v-loading="loading" v-if="searchParams.type === WORK_TYPE.FREE">-->
<!--    <div class="student-work&#45;&#45;item" v-for="item of themeWorkList" :key="item.id">-->
<!--      <div class="production-img">-->
<!--        <el-image :src="item.photoUrl" alt="picture" fit="contain" :preview-src-list="[item.photoUrl]" />-->
<!--      </div>-->
<!--      <div class="student-work&#45;&#45;item_bottom">-->
<!--        <p class="student-work&#45;&#45;item_bottom-title">-->
<!--          {{ item.curriculumKey }}-->
<!--        </p>-->
<!--        <p>{{ dayJS(item.createTime).format("YYYY/MM/DD HH:mm:ss") }}</p>-->
<!--      </div>-->
<!--    </div>-->
<!--    <p class="empty-text" v-if="showEmpty_theme_work_list">empty</p>-->
<!--  </div>-->
  <message-box v-model:visible="showAiAppraise" :height="300 * 2.1 + 'px'" :width="400 * 3 +'px'" @close="onClose">
    <a-i-appraise-component :data="activeEvaluate" @close="onClose" @update="onUpdate" />
  </message-box>
<loading-component :show="loading" />
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from "vue";
import { Close } from "@element-plus/icons-vue";
import { fetchFreeCreationList, fetchStudentsOpus, fetchThemeCreationList } from "@/http/opus";
import type { Http } from "@/interface/Http";
import dayJS from "dayjs";
import { fetchClasses, fetchClassesTheme, fetchClassesThemeUpdate, fetchGradeList } from "@/http/grade";
import AIAppraiseComponent from "@cs/AI-Appraise/AI-Appraise-Component.vue";
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import { ElMessageBox } from "element-plus";
import type { Classes } from "@/interface/Classes";
import folderImg from "@/assets/folder.png";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";



interface DataItem {
  productionname: string;
  author: string;
  score: string;
  evaluate: string;
  classname: string;
  production: string;
}

const WORK_TYPE = {
  STUDENT: 1,
  THEME: 2,
  FREE: 3
};

interface SearchParams {
  page: number;
  pageSize: number;
  userId: number;
  name?: string;
  type: 1 | 2 | 3; //1学生作品 2主题创作 3自由创作
  gradeId?: number;
  classesId?: number;
  themeId?: number;
}

interface GradeItem {
  id: number;
  classes: string;
  gradeName: string;
}

interface SearchThemeItem {
  userId: number;
  gradeId: number;
  classId: number;
  type?: number;
}

interface ThemeItem {
  themeName: string;
  userid: number;
  gradeId: number;
  chassId: number;
  id: number;
}

const workList = ref<any[]>([]);
const showEmpty = ref(true);
const gradeList = ref<GradeItem[]>([]);
const classes = ref<Classes.Data[]>([]);
const themeList = ref<ThemeItem[]>([]);
const themeWorkList = ref<any[]>([]);
const freeWorkList = ref<any[]>([]);
const showAiAppraise = ref(false);
const activeEvaluate = ref<DataItem>();
const showWorkItem = ref(false);
const showEmpty_themes = ref(false);
const themeName = ref();
const freeName = ref();
const themeWorkName = ref();
const showEmpty_theme_work_list = ref(false);
const showEmpty_themeList = ref(false);
const showEmpty_student = ref(false);
const showEmpty_free = ref(false)

const props = defineProps<{
  userId: number
}>();

const searchParams = reactive<SearchParams>({
  page: 1,
  pageSize: 500,
  userId: props.userId,
  name: "",
  type: WORK_TYPE.THEME as 1 | 2 | 3,
  gradeId: undefined,
  classesId: undefined,
  themeId: undefined
});
const loading = ref(false);

const onChange = (val: 1 | 2 | 3 | number) => {
  searchParams.type = val as 1|2|3;
  if (val === WORK_TYPE.STUDENT) {
    workList.value = [];
    themeList.value = [];
    getStudentWorkList();
  } else if(val===WORK_TYPE.THEME){
    themeWorkList.value = [];
    getThemeList();
  } else if(val===WORK_TYPE.FREE){
    freeWorkList.value = [];
    getFreeWorkList();
  }
};
const getFreeWorkList = ()=> {
  loading.value = true;
  fetchFreeCreationList({
    userId: props.userId,
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    name: freeName.value
  }).then((res:Http.InfoListData<any>)=>{
    if(res && res.code == 200){
      freeWorkList.value = res.data;
      showEmpty_free.value = res.data?.length < 1;
    }
  }).finally(()=> loading.value = false)
}
const getThemeList = () => {
  loading.value = true;
  fetchThemeCreationList({
    userId: props.userId,
    page: searchParams.page,
    pageSize: searchParams.pageSize,
    name: themeWorkName.value
  }).then((res:Http.InfoListData<any>)=>{
    if(res && res.code == 200){
      themeWorkList.value = res.data;
      showEmpty_themes.value = res.data?.length < 1;

    }
  }).finally(()=> loading.value = false)
}
const onSearch = ()=> {
  if(searchParams.type === WORK_TYPE.THEME){
    getThemeList();
  } else if(searchParams.type === WORK_TYPE.FREE){
    getFreeWorkList();
  } else if(searchParams.type === WORK_TYPE.STUDENT){
    getStudentWorkList();
  }
}
const getGradeList = (isGetClasses: boolean = false) => {
  fetchGradeList({
    userId: props.userId
  }).then((res: Http.InfoListData<GradeItem>) => {
    if (res && res.code === 200) {
      gradeList.value = res.data;
      searchParams.gradeId = res.data[0]?.id;
    }
    isGetClasses && getClassList(true);
  });
};

const getClassList = (isGetTheme: boolean = false) => {
  if(!searchParams.gradeId) return
  fetchClasses({
    userId: props.userId,
    gradeId: searchParams.gradeId
  }).then((res: any) => {
    if (res && res.code === 200) {
      classes.value = res.data;
      searchParams.classesId = res.data[0]?.id;
    }
    isGetTheme && getThemeList();
  });
};
const getStudentWorkList = () => {
  loading.value = true;
  fetchClassesTheme({
    userId: props.userId,
    gradeId: searchParams.gradeId,
    classId: searchParams.classesId,
    themeName: themeName.value,
    type: searchParams.type
  } as SearchThemeItem).then((res: Http.InfoListData<ThemeItem>) => {
    if (res && res.code === 200) {
      themeList.value = res.data;
      showEmpty_themeList.value = res.data?.length < 1;
    }
  }).finally(() => {
    loading.value = false;
  });
};
const onSelectFolder = (id: number) => {
  searchParams.themeId = id;
  getDataSource();
  showWorkItem.value = true;
};
const onGradeChange = () => {
  searchParams.classesId = undefined;
  getClassList();
};
const onShowAiEvaluate = (rowItem: any) => {
  try {
    activeEvaluate.value = {
      ...rowItem,
      evaluate: rowItem.evaluate.replace(/\n/g, "<br>")
    };
    showAiAppraise.value = true;
  } catch (e: any) {
    ElMessageBox.alert(e.message, {
      showConfirmButton: true,
      showClose: false,
      autoClose: 500,
      confirmButtonText: "确定"
    });
  }
};
const onBackToTheme = () => {
  showWorkItem.value = false;
  showEmpty.value = false;
};
const onClose = (refresh: boolean) => {
  showAiAppraise.value = false;
  activeEvaluate.value = undefined;
  getDataSource();

};
const emit = defineEmits<{
  (ev: "close"): void
}>();

const onUpdateTheme = async (id: number, value: string) => {
  if (!value) {
    getStudentWorkList();
  } else {
    await fetchClassesThemeUpdate({
      themeId: id,
      themeName: value
    });
  }
};
const getDataSource = () => {
  loading.value = true;
  fetchStudentsOpus(searchParams).then((res: Http.InfoListData<any>) => {
    if (res && res.code === 200) {
      workList.value = res.data;
      showEmpty_student.value = res.data.length < 1;
    }
  }).finally(() => loading.value = false);

};
const onUpdate = (newVal:string)=>{
  // 使用正则表达式匹配第一行中的数字，并进行替换
  if(activeEvaluate.value) {
    activeEvaluate.value.evaluate = activeEvaluate.value.evaluate?.replace(/^.*?(<br>|\n|$)/, `總分數得分：${newVal}分` + '<br>');
  }
}
const onBack = () => {
  searchParams.gradeId = undefined;
  searchParams.classesId = undefined;
  searchParams.type = WORK_TYPE.THEME;
  emit("close");
}

onBeforeMount(() => {
  if(searchParams.type === WORK_TYPE.STUDENT){
    getGradeList(true);
  } else if(searchParams.type === WORK_TYPE.THEME){
    getThemeList();
  } else {
    getFreeWorkList();
  }
});
watch(() => props.userId, (newValue) => {
  searchParams.userId = newValue;
});
watch(showWorkItem, (newValue) => {
  if (!newValue) {
    workList.value = [];
  }
});
</script>


<style scoped lang="scss">
.student-work--header {
  justify-content: space-between;

  padding-left: 10px;
  padding-right: 20px;
  align-items: center;
}

.production-img {
  width: 100%;
  overflow: hidden;
  max-height: 65%;
  min-height: 65%;

}
.free-creation-img {
  max-height: 70%;
  min-height: 70%;
}
.student-work--right_side {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.student-work--content, .student__work--themes {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  //
  //padding: 5px 20px 20px 10px;
  box-sizing: border-box;
  height: calc(100vh - 60px - 60px - 40px - 20px);
  position: relative;
  align-content: flex-start;
}
.student__work--themes {
  padding-left: 20px;
}
.themes-back--img {
  width: 25px;
  margin-right: 5px;
}
.free-creation-item--bottom {
  padding-top: 2px !important;
}
.student__work--themes-item {
  width: 100px;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  margin-right: 15px;
  margin-top: 18px;
}

.theme-input {
  text-align: center;
  width: 100px;
  color: #4f4f4f;
  border: none;
  outline: none;
  background-color: transparent;
}

.themes-back {
  justify-self: flex-start;
  font-size: 14px;
  display: flex;
  width: 70px;
  position: absolute;
  left: 0;
}

.themes-back:hover {
  color: #626262;
  cursor: pointer;
}

.theme-input:focus {
  outline: 1px solid #d2d2d2;
}

.themes__item--folder {
  width: 100%
}

.themes__item--folder:hover {
  cursor: pointer;
}

.student-work--item {
  box-shadow: 0px 10px 20px 0px rgba(189, 195, 211, 0.67);
  border-radius: 10px;
  overflow: hidden;
  margin: 5px 12px 15px 12px;
  animation-name: student-work--item-animate;
  animation-duration: .3s;
  animation-fill-mode: forwards;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
  height: 170px;
  width: 185px;

}


.student-work--item:hover {
  box-shadow: 0px 10px 20px 0px rgba(189, 195, 211, 1);
  cursor: pointer;
}

.student-work--item img {
  width: 100%;

}
.select:deep(.el-input__wrapper) {
  border-radius: 10px;
}
.student-work--item_bottom {
  height: 60px;
  font-size: 14px;
  color: #707070;

  padding: 10px;
  box-sizing: border-box;
}
.free-creation-item--bottom-title {
  display: block !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.student-work--item_bottom-title {
  font-size: 14px;
  font-weight: 400;
  color: #464646;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
}
.free-creation-item {
  height: 160px;
  width: 200px;
  border-radius: 10px;
}
.student-work--item_bottom-title-left {
  display: block;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.student-work--item_bottom-title-right {
  display: block;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.student-work--tools {
  position: relative;
  height: 40px;
  text-align: right;
  border-bottom: 1px solid #e7e7e7;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.student-work--close {
  font-size: 26px;
  color: #313131;
  cursor: pointer;
  line-height: 30px;
  margin-top: 2px;
  margin-right: 3px;
}

.student-work--close:hover {
  color: #757575;
}

@keyframes student-work--item-animate {
  from {
    transform: scale(0.5);
  }
  to {
    transform: scale(1);
  }
}

.empty-text {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 60px;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  color: #949494;
  text-align: center;

}
</style>