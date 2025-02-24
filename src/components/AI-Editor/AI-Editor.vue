

<template>
  <p class="ai-title">{{$t('creation.edit')}}</p>
  <div class="ai-editor-container">
    <div class="ai-editor-content">
      <div class="ai-editor--item" v-for="(item,i) of dataSource" :key="item.name">
        <span class="item-title" :title="item.name">{{$t(item.name)}}</span>
        <div class="item--range">
          <p style="min-width: 80px;text-align: right;padding-right: 18px">{{$t('creation.weight')}}:</p>
          <el-slider v-model="item.value" :max="10" :min="0" :step="1" :disabled="!item.checked" />
        </div>
        <div class="item-button-group">
          <el-icon :class="{'item-checked':true,'item-is-checked':item.checked}" @click="onSelect(i)">
            <CircleCheck />
          </el-icon>
          <el-icon :class="{'item-checked--delete':true}" v-if="showDelete" @click="onDelete(i)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>
    <div class="footer-button">
      <el-button type="primary" style="width: 100px" @click="show=true">
        {{$t('universal.add')}}
      </el-button>
      <el-button :type="showDelete? 'default':'danger'"  style="width: 100px" @click="showDelete = !showDelete">
         {{showDelete? $t('universal.cancel'):$t('universal.delete')}}
      </el-button>
    </div>
  </div>
<MessageBox v-model:visible="show" height="60px">
  <el-input size="default" v-model="addValue"  class="default__input" :placeholder="$t('universal.keyword')" style="width: 70%"  />
  <el-button type="primary" size="default" style="width: 80px;margin-left: 15px" @click="onAddKeyword">
     {{$t('universal.confirm')}}
  </el-button>
<!--  <p class="error-text">不合法的关键词</p>-->
</MessageBox>
</template>
<script setup lang="ts">

import { CircleCheck, Delete } from "@element-plus/icons-vue";
import { onMounted, ref } from "vue";
import MessageBox from "@cs/MessageBox/Message-Box.vue";



interface DataSourceItem {
  name: string
  value: number
  checked: boolean
}

const showDelete = ref(false);
const show = ref(false);
const addValue = ref("");


const dataSource = ref<DataSourceItem[]>([
  {
    name: "creation.style",
    value: 6,
    checked: true
  },
  {
    name: "creation.perspective",
    value: 3,
    checked: false
  },
  {
    name: "creation.texture",
    value: 4,
    checked: false
  },
  {
    name: "creation.composition",
    value: 4,
    checked: true
  },
  {
    name: "creation.color",
    value: 5,
    checked: true
  }
]);
const onSelect = (i: number) => {
  dataSource.value[i].checked = !dataSource.value[i].checked;
}
const onDelete = (i:number)=> {
  dataSource.value.splice(i, 1);
}
const onAddKeyword = () => {
  addValue.value && dataSource.value.push({
    name: addValue.value,
    value: 0,
    checked: false
  })
  show.value = false;
  addValue.value = "";
}
const getResult = ()=> dataSource.value;
onMounted(()=>{
  const localData = window.localStorage.getItem("ai-editor");
  if(localData) {
    dataSource.value = JSON.parse(localData);
  }
})
defineExpose({
  getResult
})
</script>
<style scoped>
.ai-editor-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-left: 5%;
  box-sizing: border-box;
  padding-top: 10px;

}
.ai-editor-content {
  height: 85%;
  overflow-y: auto;
  padding-bottom: 10px;
}
.ai-editor--item {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  align-items: center;
}
.ai-editor--item + .ai-editor--item {
  margin-top: 20px;
}
.item-title {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  max-width: 108px;
  overflow: hidden;
}
.item-checked {
  font-size: 30px;
  color: #545454;
  cursor: pointer;
  justify-self: center;
  transition: color 0.2s linear;
}
.item-checked:hover {
  color: #444444;
}
.item-is-checked {
  color: #1979e8 !important;
}
.item--range {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
.footer-button {
  width: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 15px  auto 0 auto;
}
.item-checked--delete {
  font-size: 30px;
  cursor: pointer;
  justify-self: center;
  color: #f56c6c;
  margin-left: 10px;
}
.item-button-group {
  display: flex;
  justify-content: flex-start;
  padding-left: 15px;
}
.error-text {
  position: absolute;
  z-index: 1;
  bottom: 10px;
  left: 25px;
  font-size: 13px;
  color: #f63e3e;
}
.ai-title {
  position: absolute;
  z-index: 1;
  top: 10px;
  font-size: 18px;
  font-weight: 600;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
}
</style>