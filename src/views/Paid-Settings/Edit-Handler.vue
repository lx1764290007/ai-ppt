<template>

  <div class="edit-handler-wrapper">
    <p class="title">{{data? $t('universal.edit'):$t('universal.add')}}{{$t('paid.subscribe_option')}}</p>
    <div class="vip-edit-handle-line">
      <span class="vip-edit-handle-line--label">{{$t('universal.nickname')}}：</span>
      <el-input :placeholder="$t('universal.placeholder')"
                v-model="name"
                :autocomplete="false"
                size="large"
                class="default__input" />
    </div>
    <div class="vip-edit-handle-line">

      <span class="vip-edit-handle-line--label">{{$t('paid.cost')}}：</span>
      <el-input-number :min="0" class="default__input" :placeholder="$t('universal.placeholder')" size="large" v-model="cost" />
      <el-select v-model="unit" style="width: 160px" :placeholder="$t('paid.unit')" size="large" class="default__select">
        <el-option v-for="item of dataSource?.currencyTypes" :key="item.id" :value="item.id"
                   :label="item.currencyname"></el-option>
      </el-select>
    </div>
    <div class="vip-edit-handle-line">
      <span class="vip-edit-handle-line--label">{{$t('universal.duration')}}：</span>
      <el-select class="default__select" v-model="dateValue" :placeholder="$t('universal.select')" size="large">
        <el-option v-for="item of dataSource?.dateDicts" :key="item.id" :value="item.id"
                   :label="item.num + getDateUnit(item.unit)">
          {{ item.num }}{{ getDateUnit(item.unit) }}
        </el-option>

      </el-select>
    </div>
    <div class="vip-edit-handle-line" style="height: 345px; overflow-y: auto; width: 100%;">
      <span class="vip-edit-handle-line--label" style="align-self: flex-start;position: sticky;top:0">
        {{$t('paid.vip_permission')}}：</span>
      <el-checkbox-group v-model="permission"
                         size="large"
                         class="vip-edit-handle-line--checkbox"
                         style="justify-self: flex-start;margin-left: 10px;align-self: flex-start">
        <el-checkbox :value="item.id" :label="item.id" v-for="item of dataSource?.privileges" :key="item.id">
          {{item.remark}}
        </el-checkbox>
      </el-checkbox-group>

    </div>
    <el-button type="primary"
               class="default__button-active"
               @click="addAndUpdateHandle"
               :loading="loading"
               size="large" style="width: 100px">
      {{$t('universal.confirm')}}
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref, watch } from "vue";
import { fetchDictAddOrUpdate, fetchDictList } from "@/http/subscript";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";


interface CurrencyType {
  currencycode: string;
  currencyname: string;
  id: number;
  symbol: string;
}

interface DateDicts {
  id: number;
  num: number;
  unit: string;
}

interface Privileges {
  id: number;
  remark: string;
}
interface CurrencyTypes {
  currencycode: string;
  currencyname: string;
  symbol: string;
  id: number
}
interface Data {
  currencyTypes: CurrencyType[];
  dateDicts: DateDicts[];
  privileges: Privileges[];
}
interface DataItem {
  cost: number;
  costunit: string;
  createtime: number;
  id: number;
  currencyTypes: CurrencyTypes
  istime?: number;
  isy?: number;
  privilegesList: Privileges[]
  jurisdiction: string;
  originalprice: number;
  vip: number;
  vipunit: "Day" | "Month" | "Year";
}
interface UpdateData {
  id: number;
  VIP: number;
  VIPUnit: string;
  cost: number;
  costUnit: number;
  jurisdiction: string;
  name: string;
}

const dateValue = ref();
const unit = ref();
const permission = ref([]);
const cost = ref(0);
const dataSource = ref<Data>();
const name = ref<string>("");
const loading = ref(false);
const {t} = useI18n();

const emit = defineEmits<{
  (ev: "done"):void
}>()
const props = defineProps<{
 data?: DataItem
}>()
const getDateUnit = (unit: "day" | "month" | "year"): string => {
  let result = "";
  switch (unit) {
    case "month":
      result = " " + t("universal.month");
      break;
    case "day":
      result = " " + t("universal.day");
      break;
    case "year":
      result = " " + t("universal.year");
      break;
  }
  return result;
};

const getDictList = () => {
  fetchDictList().then((res: { data: Data, code: 200 | 500 }) => {
    if (res && res.code === 200) {
      dataSource.value = res.data;
    }
  });
};
const addAndUpdateHandle = () => {
  const dateItem = dataSource.value?.dateDicts.find(item => item.id === dateValue.value);
  const currencyItem = dataSource.value?.currencyTypes.find(item => item.id === unit.value);
  loading.value = true;
  const _data: UpdateData = {
    VIP: dateItem?.num,
    VIPUnit: dateItem?.unit,
    cost: cost?.value,
    name: name.value,
    costUnit: currencyItem?.id,
    jurisdiction: permission?.value.join()
  };

  if(Object.values(_data).some(it=> !it)){
    //ElMessage.warning("有项目未填写完整！")
  } else {
    fetchDictAddOrUpdate(Object.assign(_data, {id: props.data?.id})).then((res:{code:200|500})=>{
      if(res && res.code === 200) {
        emit("done");
      }
    }).finally(()=> loading.value = false)
  }
};
watch(()=> props.data, (value)=>{
  if(value) {
   dateValue.value = dataSource.value?.dateDicts?.find(item=> item.num === value.vip && item.unit === value.vipunit)?.id;
   unit.value = value.currencyTypes.id;
   permission.value = value.privilegesList.map(it=>it.id);
   cost.value = value.cost;
   name.value = value.name;
  } else {
    dateValue.value = null;
    unit.value = null;
    permission.value = [];
    cost.value = 0;
    name.value = "";
  }
})
onBeforeMount(getDictList);
</script>
<style scoped>
.vip-edit-handle-line {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  justify-items: flex-end;
  height: 40px;
  box-sizing: border-box;
  align-items: center;
}

.title {
  position: relative;
  transform: translateY(-30px);
  font-size: 20px;
}

.vip-edit-handle-line + .vip-edit-handle-line {
  margin-top: 15px;
}

.vip-edit-handle-line:deep(.el-radio__inner) {
  box-shadow: 1px 1px #ccc inset;
  font-size: large;
}

.vip-edit-handle-line:deep(.is-checked .el-radio__inner) {
  box-shadow: none;
}

.edit-handler-wrapper {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

.vip-edit-handle-line--label {
  color: #545454;
  font-size: 14px;

}

.vip-edit-handle-line--checkbox {
  display: flex;
  flex-flow: column nowrap;
  justify-items: flex-start;
  justify-content: flex-start
}

.vip-edit-handle-line--checkbox:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  box-shadow: none;
  border-radius: 50%;
  transform: scale(1.2);
}

.vip-edit-handle-line--checkbox:deep(.el-checkbox__inner) {
  box-shadow: 1px 1px #ccc inset;
  border-radius: 50%;

  transform: scale(1.2);
}
</style>