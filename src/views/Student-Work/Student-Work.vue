<template>
  <div style="height: 100%" v-show="!showStudentWork">
<!--    <header class="table-header paid-settings-header">-->
<!--      <div class="student-work&#45;&#45;right_side_student">-->
<!--        <el-select class="default__select" clearable :placeholder="$t('grade.grade')" v-model="searchParams.gradeId" size="large"-->
<!--                   style="width: 120px;margin-right: 15px;"-->
<!--                   @change="onGradeChange">-->
<!--          <el-option :value="item.id" v-for="(item) of gradeList" :key="item.id" :label="item.gradeName"></el-option>-->
<!--        </el-select>-->
<!--        <el-select class="default__select" clearable :placeholder="$t('grade.class')" v-model="searchParams.classesId" size="large"-->
<!--                   style="width: 120px;margin-right: 15px">-->
<!--          <el-option :value="item.id" v-for="(item) of getClassesList" :key="item.id"-->
<!--                     :label="item.classes"></el-option>-->
<!--        </el-select>-->
<!--      </div>-->

<!--      <div class="header-search">-->
<!--        <el-input :placeholder="$t('creation.work_name')" class="default__input" size="large" prefix-icon="Search"-->
<!--                  v-model="searchParams.name" />-->
<!--        <el-button class="default__button-primary"-->
<!--                   type="primary"-->
<!--                   @click="setDataSource"-->
<!--                   size="large"-->
<!--                   style="margin-left: 15px;width: 120px">-->
<!--          {{$t('universal.search')}}-->
<!--        </el-button>-->
<!--      </div>-->
<!--    </header>-->

    <main class="table-main" style="height: 100%">
       <user-student-work :user-id="userInfo.getUserInfo.user?.id" />
    </main>
<!--    <footer class="table-footer">-->
<!--      <el-pagination v-model:current-page="searchParams.page" :page-size="searchParams.pageSize"-->
<!--                     @current-change="setDataSource" background layout="prev, pager, next" :total="total" />-->
<!--    </footer>-->
    <message-box v-model:visible="showMessageBox" confirm-text="确定" height="566px" width="400px">
      <sign-up :show-back="false" />
    </message-box>
  </div>

  <!--  <student-work @close="showStudentWork = false" v-if="showStudentWork" />-->
  <message-box v-model:visible="showAiAppraise" :height="300 * 2.1 + 'px'" :width="400 * 3 +'px'" @close="onClose">
    <a-i-appraise-component :data="activeEvaluate" @close="onClose" @update="onUpdate" />
  </message-box>


</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import { fetchDelEvaluation, fetchStudentsOpus } from "@/http/opus";
import SignUp from "@vs/Sign-up/Sign-Up.vue";
import AIAppraiseComponent from "@cs/AI-Appraise/AI-Appraise-Component.vue";
import { computed, onBeforeMount, reactive, ref, watch } from "vue";
import { useUserInfo } from "@/stores/user";

import { fetchClasses, fetchGradeList } from "@/http/grade";
import type { Http } from "@/interface/Http";
import type { Classes } from "@/interface/Classes";
import dayJS from "dayjs";
import { ElMessageBox } from "element-plus";
import UserStudentWork from "@cs/User-Student-Work/User-Student-Work.vue";

interface DataItem {
  productionname: string;
  author: string;
  score: string;
  evaluate: string;
  classname: string;
  production: string;
  id: number
}

const showMessageBox = ref(false);
const showStudentWork = ref(false);
const showAiAppraise = ref(false);
const userInfo = useUserInfo();
const loading = ref(false);
const total = ref(0);
const activeEvaluate = ref<DataItem>();
const allClasses = ref<Classes.Data[]>([]);

interface Query {
  page: number;
  pageSize: number;
  userId: number;
  name: string;
  type: number;
  gradeId?: number;
  classesId?: number;
}

const searchParams = reactive<Query>({
  page: 1,
  pageSize: 12,
  userId: userInfo.getUserInfo.user?.id,
  name: "",
  type: 1,
  gradeId: undefined,
  classesId: undefined
});

interface Grade {
  gradeName: string;
  grade: number;
  id: number;
}

const gradeList = ref<Grade[]>([]);
const classesList = ref<Classes.Data[]>([]);
const tableData = ref<DataItem[]>([]);
const setDataSource = () => {
  loading.value = true;
  fetchStudentsOpus(searchParams).then((response: Http.InfoListData<DataItem> & {total:number}) => {
    if (response && response.code === 200) {
      tableData.value = response.data;
      total.value = response.total;
    }
  }).finally(() => loading.value = false);
};

const setGradeList = () => {
  fetchGradeList({
    userId: userInfo.getUserInfo.user?.id
  }).then((response: Http.InfoListData<{ gradeName: string, grade: number, id: number }>) => {
    if (response && response.code === 200) {
      gradeList.value = response.data;

    }
  });
};
const onGradeChange = ()=> {
  searchParams.classesId = undefined;
 // setClassesList();
}
const getProduction = (str="")=> {
  return str.replace(/<br>/g, " ");
}
const setClassesList = () => {
  fetchClasses({
    userId: userInfo.getUserInfo.user?.id,
    gradeId: searchParams.gradeId,
    page: 1,
    pageSize: 200
  }).then((response: Http.InfoListData<Classes.Data>) => {
    if (response && response.code === 200) {
      classesList.value = response.data;
      if(!searchParams.gradeId) {
        allClasses.value = response.data;
      }
    }
  });
};
const getClassesList = computed(() => {

  if (!searchParams.gradeId) return [];
  return allClasses.value.filter(it => it.gradeId === searchParams.gradeId);
});
const onShowAiEvaluate = (rowItem: any) => {

  try {
    activeEvaluate.value = {
      ...rowItem,
      evaluate: rowItem.evaluate.replace(/\n/g, "<br>")
    };
    showAiAppraise.value = true;
  } catch (e) {
    ElMessageBox.alert(e.message, {
      showConfirmButton: true,
      showClose: false,
      autoClose: 500,
      confirmButtonText: "确定"
    });
  }
};
const onRest = () => {
  searchParams.page = 1;
  searchParams.pageSize = 12;
  searchParams.classesId = undefined;
  searchParams.gradeId = undefined;
  searchParams.name = "";
  setDataSource();
};
const onDelete = (id: number) => {
  fetchDelEvaluation({
    id
  }).then((response: any) => {
    if (response && response.code === 200) {
      tableData.value = tableData.value.filter(item => item.id !== id);
    }
  });
};
const onUpdate = (newVal:string)=>{
  // 使用正则表达式匹配第一行中的数字，并进行替换
  if(activeEvaluate.value) {
    activeEvaluate.value.evaluate = activeEvaluate.value.evaluate?.replace(/^.*?(<br>|\n|$)/, `總分數得分：${newVal}分` + '<br>');

  }
}
onBeforeMount(() => {
  // setDataSource();
  // setGradeList();
  // setClassesList();
});
const onClose = (refresh: boolean) => {
  showAiAppraise.value = false;
  activeEvaluate.value = undefined;
  setDataSource();

};
watch(loading, val => {
  if (val) {
    setTimeout(() => loading.value = false, 8000);
  }
});
</script>
<style scoped lang="scss">
.paid-settings-header {
  justify-content: flex-start;
  box-sizing: border-box;
}

.table-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-flow: row wrap;
  height: 60px;
  box-sizing: border-box;
  --el-color-primary: #0170F8;
}

.table-main {
  height: calc(100% - 60px);
  box-sizing: border-box;
  overflow-y: auto;
}

.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.production-json {
  width: 200px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.production-json:hover {
  color: #333;

}
</style>