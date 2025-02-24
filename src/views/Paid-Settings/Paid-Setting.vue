<template>
  <header class="table-header paid-settings-header">
    <el-button type="primary" class="default__button-primary" size="large" style="width: 100px" @click="showMessageBox = true">
      {{$t('universal.add')}}
    </el-button>
  </header>
  <main class="table-main">
    <el-table empty-text="empty" v-loading="loading" :data="tableData" stripe style="width: 100%;height: 100%;"> >
      <el-table-column type="index" align="center" :label="$t('universal.index')" width="80" />
      <el-table-column prop="createtime" align="center" :label="$t('universal.date')" width="180">
        <template #default="scope">
          {{ dayJS(scope.row.createtime).format("YYYY-MM-DD HH:mm:ss") }}
        </template>
      </el-table-column>
      <el-table-column prop="name" align="center" :label="$t('universal.nickname')" width="120" />
      <el-table-column prop="cost" align="center" :label="$t('paid.cost')" width="130">
        <template #default="scope">
          <p style="font-weight: 600"><span style="color:#3b5e6c">{{ scope.row.cost }}</span> <span
            style="color:#263034">{{ scope.row.currencyTypes?.currencycode }}</span></p>
        </template>
      </el-table-column>

      <el-table-column prop="vip" align="center" :label="$t('universal.duration')" width="100">
        <template #default="scope">
          {{ scope.row.vip }}{{ getDateUnit(scope.row.vipunit) }}
        </template>
      </el-table-column>

      <el-table-column prop="privilegesList" align="center" :label="$t('paid.vip_permission')">
        <template #default="scope">
          <div class="paid-setting-permissions">
                          <span style="margin-right: 8px" v-for="(item, index) of (scope.row.privilegesList||[])"
                                :key="index">
              ·{{ item.remark }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="handle" :label="$t('universal.operation')" width="150" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button text type="primary" @click="onEdit(scope.row)">
              {{$t('universal.edit')}}
            </el-button>
            <el-popconfirm :title="$t('universal.before_delete')+'?'"
                           width="190px"
                           :cancel-button-text="$t('universal.cancel')"
                           @confirm="onDelete(scope.row.id)"
                           :confirm-button-text="$t('universal.go_on')">
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
  </main>
  <footer class="table-footer">

  </footer>
  <MessageBox v-model:visible="showMessageBox" height="605px" width="440px" @close="activeItem = null">
    <EditHandler @done="onDone" :data="activeItem" />
  </MessageBox>
</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import EditHandler from "@vs/Paid-Settings/Edit-Handler.vue";
import dayJS from "dayjs";
import { onBeforeMount, ref } from "vue";
import { fetchDelPay, fetchRechargeList } from "@/http/subscript";
import type { Http } from "@/interface/Http";
import { useI18n } from "vue-i18n";

interface CurrencyTypes {
  currencycode: string;
  currencyname: string;
  symbol: string;
  id: number;
}

interface PrivilegesList {
  id: number;
  remark: string;
}

interface Data {
  cost: number;
  costunit: string;
  createtime: number;
  currencyTypes: CurrencyTypes;
  id: number;
  istime?: number;
  isy?: number;
  jurisdiction: string;
  originalprice: number;
  privilegesList: PrivilegesList[];
  vip: number;
  vipunit: "Day" | "Month" | "Year";
}

const showMessageBox = ref(false);
const tableData = ref<Data[]>([]);
const {t} = useI18n();
const loading = ref(false);
const activeItem = ref();
const setDataSource = () => {
  loading.value = true;
  fetchRechargeList().then((res: Http.InfoListData<Data>) => {

    tableData.value = res.data.filter((_, i) => i >= 0);
  }).finally(() => loading.value = false);
};
const getDateUnit = (unit: "day" | "month" | "year"): string => {
  let result = "";
  switch (unit) {
    case "month":
      result = t('universal.month');
      break;
    case "day":
      result = t('universal.day');
      break;
    case "year":
      result = t('universal.year');
      break;
  }
  return result;
};
const onDone = () => {
  setDataSource();
  showMessageBox.value = false;
  activeItem.value = null;
};
const onEdit = (item: Data) => {
  activeItem.value = item;
  showMessageBox.value = true;
};
const onDelete = (id: number) => {
  fetchDelPay({
    id: id
  }).then((res: any) => {
    if (res && res.code === 200) {
      tableData.value = tableData.value.filter(item => item.id !== id);
    }
  });
};
onBeforeMount(() => {
  setDataSource();
});
</script>
<style scoped>
.paid-settings-header {
  justify-content: flex-end;
  box-sizing: border-box;
}

.paid-setting-permissions {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: row wrap;
}

.table-main {
  height: calc(100% - 60px);
}
</style>