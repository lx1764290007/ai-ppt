<template>
  <div v-show="!showStudentWork">

    <main class="table-main">
       <user-theme-work :user-id="userInfo.getUserInfo.user?.id" />

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
import { reactive, ref } from "vue";
import { useUserInfo } from "@/stores/user";
import { fetchThemeCreationList } from "@/http/opus";

import type { Http } from "@/interface/Http";
import UserThemeWork from "@cs/User-Theme-Work/User-Theme-Work.vue";


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