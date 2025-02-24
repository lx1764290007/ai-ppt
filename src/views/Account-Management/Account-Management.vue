<template>
  <div style="height: 100%" v-show="!showStudentWork">
    <header class="table-header paid-settings-header">
      <div class="header-search">
        <el-input :placeholder="$t('universal.placeholder')"
                  class="default__input default__input--border"
                  size="large"
                  v-model="searchParams.name"
                  prefix-icon="Search" />
        <el-button  @click="getDataSource"
                    class="default__button-primary"
                    type="primary"
                    size="large"
                    style="margin-left: 15px;width:120px">
          {{$t('universal.search')}}
        </el-button>
      </div>
      <el-button type="primary" class="default__button-primary" size="large" @click="showMessageBox = true">
        {{$t('universal.add')}}{{locale.locale?.value === 'en'? ' ':''}}{{$t('signUp.account')}}
      </el-button>
    </header>

    <main class="table-main">
      <el-table empty-text="empty" v-loading="loading" :data="tableData" stripe style="width: 100%; "
                height="calc(100vh - 60px - 20px - 60px - 60px)">
        <el-table-column type="index" align="center" :label="$t('universal.index')" width="80" />
        <el-table-column prop="username" align="center" :label="$t('signUp.account')" width="120" />

        <el-table-column prop="nickname" align="center" :label="$t('signUp.username')" width="120" />
        <el-table-column prop="remark" align="center" :label="$t('signUp.avatar')" width="80">
          <template #default="scope">
            <div style="width: 50px;margin: 0 auto">
              <el-image :src="scope.row.remark || defaultUserIcon" style="width: 60px;height: 60px" fit="contain" />
            </div>
          </template>

        </el-table-column>
<!--        <el-table-column prop="sex" align="center" :label="$t('signUp.sex')" width="80">-->
<!--          <template #default="scope">-->
<!--            {{ scope.row.sex === 1 ? $t("signUp.man") : $t("signUp.woman") }}-->
<!--          </template>-->
<!--        </el-table-column>-->

        <el-table-column prop="institution" align="center" :label="$t('signUp.school')" width="120" />
        <el-table-column prop="num" align="center" :label="$t('creation.number_of_works')" width="150" />
        <el-table-column prop="expiration" align="center" :label="$t('recharge.duration')" width="300">
          <template #default="scope">
            {{scope.row._time}}
          </template>
        </el-table-column>
        <el-table-column prop="userType" align="center" :label="$t('recharge.status')" min-width="200">
          <template #default="scope">
           <span style="color:#337ecc">
             {{scope.row._vipState}}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginTime" align="center" :label="$t('universal.last_login_time')" width="150">
          <template #default="scope">
            {{ scope.row.lastLoginTime ? dayJS(scope.row.lastLoginTime).format("YYYY-MM-DD HH:mm:ss") : "-" }}
          </template>
        </el-table-column>


        <el-table-column prop="handle" :label="$t('universal.operation')" width="240" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button text type="primary" @click="onEdit(scope.row)">
                {{$t('universal.edit')}}
              </el-button>
                          <el-button text type="primary" @click="onCheckWork(scope.row.id)">
                            {{$t('creation.view_works')}}
                          </el-button>
              <el-popconfirm :title="$t('universal.before_delete')+'?'"
                             @confirm="onDeleteUser(scope.row.id)"
                             :cancel-button-text="$t('universal.cancel')"
                             :confirm-button-text="$t('universal.confirm')">
                <template #reference>
                  <el-button text type="danger">
                    {{$t('universal.delete')}}
                  </el-button>
                </template>
              </el-popconfirm>

            </el-button-group>

          </template>
        </el-table-column>
      </el-table>
      <footer class="table-footer">
        <el-pagination v-model:current-page="searchParams.page" :page-size="searchParams.pageSize"
                       @current-change="getDataSource" background layout="prev, pager, next" :total="total" />
      </footer>
    </main>

    <MessageBox v-model:visible="showMessageBox" height="566px" width="420px">
      <SignUp :show-back="false" @finish="onSignUpDone" />
    </MessageBox>
    <MessageBox v-model:visible="showEditBox" height="466px" width="400px">
      <SignUp :show-back="false" is-update :data-source="editTarget" @finish="onUpdateDone" />
    </MessageBox>
  </div>

  <StudentWork @close="showStudentWork = false" v-if="showStudentWork" :user-id="selectedUserId"  />
</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import type { Http } from "@/interface/Http";
import dayJS from "dayjs";
import StudentWork from "@cs/Student-Work/Student-Work.vue";
import SignUp from "@vs/Sign-up/Sign-Up.vue";
import { onBeforeMount, reactive, ref } from "vue";
import { fetchUserDel, fetchUserList } from "@/http/user";
import { useUserInfo } from "@/stores/user";
import defaultUserIcon from "@/assets/default-user-icon.png";
import { useI18n } from "vue-i18n";


interface Vip {
  createTime: number
  expirationTime: number
  id: number
  level: string
  rechargeTime: number
}

interface UserData {
  id: number;
  username: string;
  createTime: number;
  nickname: string;
  remark?: string;
  institution: string;
  expirationTime: number;
  lastLoginTime?: number;
  num: number;
  userType: number;
  member?: any[];
  privileges?: string[];
  sex: number;
  members?: Vip[];
  uequipment?: string;
  wequipment?: string;
  paymentSettings: {id:number,cost:number,name:string}[]
  _time: string
  _vipState: string
}

const userInfo = useUserInfo();
const showMessageBox = ref(false);
const showStudentWork = ref(false);
const showEditBox = ref(false);
const loading = ref(false);
const selectedUserId = ref<number>(0);
const locale = useI18n();

let editTarget =ref<UserData>();
const searchParams = reactive({
  page: 1,
  pageSize: 12,
  userId: userInfo.getUserInfo.user?.id,
  name: ""
});

const tableData = ref<UserData[]>([]);
const total = ref(0);
const getDataSource = () => {
  loading.value = true;
  fetchUserList(searchParams).then((res: Http.InfoListData<UserData> & { total: number }) => {
    if (res.code === 200) {
      tableData.value = res.data.map(item=> {
        return {
          ...item,
          _time: getVIPTime(item),
          _vipState: getVipState(item)
        }
      }) as UserData[];
      total.value = res.total;
    }
  }).finally(()=> loading.value = false)
};
const onSignUpDone = () => {
  showMessageBox.value = false;
  getDataSource();
};
const onEdit = (data: UserData) => {
  editTarget.value = data;
  showEditBox.value = true;
};
const getVIPTime = (item:UserData)=> {
  if(item.userType === 2) {
    return "--"
  } else if(item.userType === 1) {
    const _members = (item.members || []).filter(it=> it.expirationTime > Date.now());
    const _finalMembers = _members.sort((a, b)=> (item.paymentSettings.find(it=> it.id === Number(b.level))?.cost as number) - (item.paymentSettings.find(it=> it.id === Number(a.level))?.cost as number));
    if(_finalMembers.length > 0) {
      return `${dayJS(_finalMembers[0].createTime).format("YYYY/MM/DD HH:mm:ss")}--${dayJS(_finalMembers[0].expirationTime).format("YYYY/MM/DD HH:mm:ss")}`;
    } else {
      return locale.t('recharge.expired')
    }
  } else if(item.userType === 0) {
    if(item.expirationTime > Date.now()) {
      return `${dayJS(item.createTime).format("YYYY/MM/DD HH:mm:ss")}--${dayJS(item.expirationTime).format("YYYY/MM/DD HH:mm:ss")}`;
    }
    return locale.t('recharge.expired')
  }
}
const getVipState = (item:UserData)=> {
  if(item.userType === 2) {
    return "--"
  } else if(item.userType === 1) {
    const _members = (item.members || []).filter(it=> it.expirationTime > Date.now());
    const _finalMembers = _members.sort((a, b)=> (item.paymentSettings.find(it=> it.id === Number(b.level))?.cost as number) - (item.paymentSettings.find(it=> it.id === Number(a.level))?.cost as number));
    if(_finalMembers.length > 0) {
      const _id = Number(_finalMembers[0].level);

      return item.paymentSettings.find(it=> it.id === _id)?.name;
    } else {
      return locale.t('recharge.expired')
    }
  } else if(item.userType === 0) {
     if(item.expirationTime > Date.now()) {
       return locale.t('recharge.experience_membership')
     }
     return locale.t('recharge.expired')
  }
}
const onUpdateDone = ()=> {
  editTarget.value = undefined;
  showEditBox.value = false;
  getDataSource();
}
const onDeleteUser = (id:number)=> {
  fetchUserDel({id}).then(res=>{
    if(res.code === 200){
      tableData.value = tableData.value.filter(item=>item.id !== id);
    }
  })
}
const onCheckWork = (id:number)=> {
  selectedUserId.value = id;
  showStudentWork.value = true;
}
onBeforeMount(() => {
  getDataSource();
});
</script>
<style scoped>
.paid-settings-header {
  justify-content: space-between;
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
.default__input--border:deep(.el-input__wrapper) {
  border-radius: var(--border-radius);
}
.table-main {
  height: calc(100% - 60px);
  box-sizing: border-box;
  overflow-y: auto;
  background-color: #fff;
}

.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>