<template>
  <el-transfer
    v-model="roleFuncValue"
    filterable
    style="margin: 0 auto;display: flex;justify-content: space-around;align-items: center"
    @change="onChange"
    filter-placeholder="搜索"
    :data="roleFuncTransfer"
    :titles="['未获得权限','已获得权限']"
  />
</template>
<script lang="ts" setup>
import { ref, onMounted, watchPostEffect } from "vue";
import { fetchRoleFunction,fetchRoleUpdate } from "@/http/role";
import {  useFunctions } from "@/libs/useEnum";
import { ElNotification } from 'element-plus'

const roleFuncValue = ref([]);
const roleFuncTransfer = ref<{ key: string, label: string }[]>([]);

const props = defineProps(["userInfo"]);

const emit = defineEmits<{
  (e: "close", refresh: boolean): void
}>();

const roleFunc = ref<any>({});
const setRoleFuncTransferDataSource = function() {
  roleFuncTransfer.value = Object.keys(roleFunc.value).map((it: any) => {
    return {
      key: it,
      label: roleFunc.value[it]
    };
  });

};
const onChange = function(event: string[]) {
  fetchRoleUpdate({
    ...props.userInfo,
    functions: event
  }).then(()=> {
    ElNotification({
      title: '权限已更改',
      message: '此角色的权限已更改',
      type: 'success',
      duration: 2200
    })
  }).catch(function(e:Error){
    ElNotification({
      title: '操作失败',
      message: e.message || '此角色权限没有发生变化',
      type: 'error',
      duration: 2000
    })
    emit('close',true);
  })
};
const fetchFunction = function() {
  fetchRoleFunction().then((res: any[]) => {
    roleFunc.value = useFunctions(res);
    setRoleFuncTransferDataSource();
  });
};
onMounted(() => {
  fetchFunction();
});
watchPostEffect(() => {
  roleFuncValue.value = props.userInfo?.functions || [];
});

</script>
