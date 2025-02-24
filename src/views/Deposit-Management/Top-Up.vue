<template>
  <header class="table-header paid-settings-header">
    <div class="header-search">
      <el-input :placeholder="$t('signUp.account')"
                v-model="searchParams.username"
                class="default__input" size="large" prefix-icon="Search" />
      <el-button class="default__button-primary"
                 @click="setDataSource" type="primary"
                 size="large" style="margin-left: 15px;width: 120px">
        {{$t('universal.search')}}
      </el-button>
    </div>
  </header>
  <main class="table-main">
    <el-table empty-text="empty" v-loading="loading" :data="tableData" stripe style="width: 100%;height:calc(100vh - 60px - 20px - 60px - 60px);">
      <el-table-column type="index" align="center" :label="$t('universal.index')" width="70" />
      <el-table-column prop="user.username" align="center" :label="$t('signUp.account')" width="150" />
      <el-table-column prop="orderId" align="center" :label="$t('topUp.order_number')" width="260" />
      <el-table-column prop="createTime" align="center" :label="$t('topUp.recharge_time')" width="180" >
         <template #default="scope">
           {{dayJS(scope.row.createTime).format("YYYY-MM-DD HH:mm:ss")}}
         </template>
      </el-table-column>

      <el-table-column prop="amount" align="center" :label="$t('paid.cost')">
        <template #default="scope">
          <p style="color:#1bb81e;font-weight: 500">{{scope.row.amount}} {{scope.row.currency}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="amount" align="center" :label="$t('topUp.channel')">
        <template #default>
          <p style="color:#2a2a2a">
            {{$t('topUp.official_website')}}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="status" align="center" :label="$t('topUp.status')" width="80" >
        <template #default="scope">
          <p :style="{color: scope.row.status === '0'? '#3a3a3a':scope.row.status === '1'? '#1c6c24':'#285180', fontWeight: 500}">{{getStatus(scope.row.status)}}</p>
        </template>
      </el-table-column>
      <el-table-column prop="refund" align="center" :label="$t('topUp.refund')" width="100" >
        <template #default="scope">
         {{scope.row.refund? scope.row.refund + scope.row.currency:""}}
        </template>
      </el-table-column>
<!--      <el-table-column prop="remark" align="center" label="备注" width="100" />-->
<!--      <el-table-column prop="channel" align="center" label="评分" width="100" />-->
<!--      <el-table-column prop="channel" align="center" label="评价" width="100" />-->
      <el-table-column prop="handle" :label="$t('universal.operation')" width="100" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button :disabled="scope.row.status !== '1'" text type="primary" @click="onRefund(scope.row)">
              {{$t('topUp.refund')}}
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>

    </el-table>
    <footer class="table-footer">
      <el-pagination v-model:current-page="searchParams.page"
                     :page-size="searchParams.pageSize"
                     @current-change="setDataSource"
                     background layout="prev, pager, next" :total="total" />
    </footer>
  </main>

  <MessageBox v-model:visible="showMessageBox" height="210px" width="400px" @close="passwordText = ''">
      <div class="refund-content">
        <p class="refund-title">
          {{$t('topUp.refund')}}
        </p>
      <div style="display: flex;align-items: baseline">
        <span style="margin-right: 10px">
          {{$t('paid.amount')}}
        </span>
      <el-input-number class="default__input"
                       style="margin-bottom: 20px;text-align: left"
                       :placeholder="$t('paid.amount')"
                       :min="0"
                       size="large"
                       :controls="false"
                       v-model="amount"
                       :prefix="amountUnit" />
        <span style="padding-left: 15px;font-weight: 600">{{amountUnit}}</span>
      </div>
        <div style="display: flex;align-items: baseline">
          <span style="margin-right: 10px">
            {{$t('signUp.password')}}
          </span>
        <el-input show-password
                  style="margin-bottom: 20px;width:180px;justify-self: flex-start"
                  :placeholder="$t('universal.placeholder')" v-model="passwordText" size="large" />
          <span style="padding-left: 15px;font-weight: 600;color:transparent;">{{amountUnit}}</span>
        </div>
      <el-button :loading="refundLoading"
                 @click="onRefundConfirm" type="primary"
                 class="default__button-active" size="large" style="width: 100px">
        {{$t('universal.confirm')}}
      </el-button>
      </div>
  </MessageBox>
</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";

import dayJS from "dayjs";
import { onBeforeMount, reactive, ref } from "vue";
import { fetchOrderList,fetchOrderRefund } from "@/http/order";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import { ElMessage } from "element-plus";
import universal from "@/i18n/universal";
import { useI18n } from "vue-i18n";

interface TopUp {
  id: number
  orderId: string
  sessionId: string
  productName: string
  amount: number 
  currency: string
  quantity: string
  status: string
  userId: number
  refund?: string
  refundTime?: string
  successTime?: string
  errorTime?: string
  createTime: number
  remark?: string
}
const userInfo = useUserInfo();
const searchParams = reactive({
  page: 1,
  pageSize: 12,
  username: "",
  userId: userInfo.getUserInfo.user?.id,
})
const {t} = useI18n();
const total = ref(0);
const showMessageBox = ref(false);
const loading = ref(false);
const amount = ref(0);
const tableData = ref<TopUp[]>([]);
const refundItem = ref();
const refundLoading = ref(false);
const amountUnit = ref("")
const passwordText = ref<string>("");
const currentUserId = ref<number|undefined>();
const setDataSource = ()=> {
  loading.value = true;
  fetchOrderList(searchParams).then((response:Http.InfoListData<TopUp> & {total:number}) => {
    if(response.code === 200) {
      tableData.value = response.data;
      total.value = response.total;
    }
  }).finally(()=>{
    loading.value = false;
  })
}
const getStatus = (item:string)=>{
  let result;
  switch (item) {
    case "0":
      result = t('topUp.pending_payment');
      break;
    case "1":
      result = t('topUp.paid');
      break;
    case "2":
      result = t('topUp.cancel');
      break;
    case "3":
      result = t('topUp.refund')
      break;
    default:
      result = "-";
  }
  return result;
}
const onRefund = (row:TopUp)=> {

  refundItem.value = row;
  amount.value = row.amount;
  amountUnit.value = row.currency;
  currentUserId.value = row.userId;
  showMessageBox.value = true;
}
const onRefundConfirm = ()=> {
  if(amount.value && passwordText.value){
    refundLoading.value = true;
    fetchOrderRefund({
      amount: amount.value,
      sessionId: refundItem.value.sessionId,
      chargeId: undefined,
      password: passwordText.value,
      userId: currentUserId.value as number
    }).then((res:any)=> {
      if(res &&  res.code === 200){
        ElMessage.success(t('topUp.refund_initiated'));
        refundItem.value = null;
        amount.value = 0;
        showMessageBox.value = false;
        setDataSource()
      }
    }).finally(()=> {
      refundLoading.value = false;

    })
  } else {
    ElMessage.info(t('topUp.amount_or_password_error'))
  }

}
onBeforeMount(setDataSource)
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
.refund-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  height: 210px;
  width: 360px;
}
.refund-content:deep(.el-input__inner) {
  text-align: left;
}
.refund-title {
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  transform: translateY(-30px);
  font-weight: 600;
  font-size: 18px;
}
</style>