<template>
  <div v-show="!showStudentWork">
    <!--    <header class="table-header paid-settings-header">-->
    <!--      <div class="header-search">-->
    <!--        <el-input :placeholder="$t('creation.work_name')" class="default__input" size="large" v-model="searchParam.name" prefix-icon="Search" />-->
    <!--        <el-button class="default__button-primary" type="primary" size="large" style="margin-left: 15px;width: 120px" @click="getDataSource">-->
    <!--          {{$t('universal.search')}}-->
    <!--        </el-button>-->
    <!--      </div>-->
    <!--    </header>-->
    <main class="table-main">
      <user-free-work :user-id="userInfo.getUserInfo?.user?.id" />
    </main>
    <!--    <footer class="table-footer">-->
    <!--      <el-pagination background layout="prev, pager, next"-->
    <!--                     v-model:current-page="searchParam.page"-->
    <!--                     @current-change="getDataSource"-->
    <!--                     :total="total" />-->
    <!--    </footer>-->
    <MessageBox v-model:visible="showMessageBox" :confirm-text="$t('universal.confirm')" height="566px" width="400px">
      <SignUp :show-back="false" />
    </MessageBox>

  </div>

</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";

import SignUp from "@vs/Sign-up/Sign-Up.vue";
import { onBeforeMount, reactive, ref } from "vue";
import { useUserInfo } from "@/stores/user";
import { fetchThemeCreationList } from "@/http/opus";
import dayJs  from "dayjs";
import type { Http } from "@/interface/Http";

import UserFreeWork from "@cs/User-Free-Work/User-Free-Work.vue";

const loading = ref(false);
const showMessageBox = ref(false);
const showStudentWork = ref(false);
const total = ref(0);

const tableData = ref<any[]>([]);
const userInfo = useUserInfo();
const searchParam =  reactive({
  userId: userInfo.getUserInfo.user?.id,
  name: "",
  page: 1,
  pageSize: 12
})

const getDataSource = ()=> {
  loading.value = true;
  fetchThemeCreationList(searchParam).then((res:Http.InfoListData<any> & {total:number}) => {
    tableData.value = res.data;
    total.value = res.total;
  }).finally(()=>{
    loading.value = false;
  })
}
// onBeforeMount(getDataSource)
</script>
<style scoped>
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
  height: calc(100% - 60px - 60px);
  box-sizing: border-box;
  overflow-y: auto;
}

.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>