

<template>
  <div class="catalog-container" data-template="export" data-prefix-sort="2">
    <el-icon class="deleted-item" @click="handleDelete">
      <Delete />
    </el-icon>
    <div class="catalog-content">
    <div class="catalog-title">
      <h2>目 錄</h2>
    </div>
    <div class="catalog-items">
      <div v-html="myTarget.item1"></div>
      <el-icon class="catalog-edit" @click="openDialog('item1')" v-if="!exporting">
        <Edit />
      </el-icon>
    </div>
    <div class="catalog-items">
      <div v-html="myTarget.item2" ></div>
      <el-icon class="catalog-edit" @click="openDialog('item2')" v-if="!exporting">
        <Edit />
      </el-icon>
    </div>
    <div class="catalog-items">
      <div v-html="myTarget.item3"></div>
      <el-icon class="catalog-edit" @click="openDialog('item3')" v-if="!exporting">
        <Edit />
      </el-icon>
    </div>
      <div class="catalog-items">
        <div v-html="myTarget.item4"></div>
        <el-icon class="catalog-edit" @click="openDialog('item4')" v-if="!exporting">
          <Edit />
        </el-icon>
      </div>
      <div class="catalog-items">
        <div v-html="myTarget.item5"></div>
        <el-icon class="catalog-edit" @click="openDialog('item5')" v-if="!exporting">
          <Edit />
        </el-icon>
      </div>
    </div>
  </div>
  <EditorModal :h5="h5"  :visible="visible" @close="onClose" @done="onDone" />
</template>
<script setup lang="ts">
import EditorModal from "@vs/AI/PPT/Editor/Editor-Modal.vue";
import { reactive, ref } from "vue";
import { Delete, Edit } from "@element-plus/icons-vue";
import { inject } from 'vue';
import { EXPORTING } from "@vs/AI/enum";


const props = defineProps(['idx']);
// 使用 inject 接收数据
const exporting = inject(EXPORTING);

const emit = defineEmits(['delete']);
const h5 = ref("");
const myTarget = reactive({
  item1: '时期1-石器、青铜和铁器时代',
  item2: '时期2-古典时代',
  item3: '时期3-中世纪',
  item4: '时期4-文艺复兴、哈布斯堡与三角贸易',
  item5: '时期5-资产阶级革命与工业诞生',
})
const activeTarget = ref<null|'item1'|'item2'|'item3'|'item4'|'item5'>(null);

const onDone = (value:string)=> {
  h5.value = value;
  if(activeTarget.value!=null){
    myTarget[activeTarget.value] = value;
  }
}
const visible = ref(false);

const openDialog = (target:'item1'|'item2'|'item3'|'item4'|'item5')=> {
  visible.value = !visible.value;
  activeTarget.value = target;
  h5.value = myTarget[target];
}
const onClose = ()=> visible.value = false;
 const handleDelete = ()=> emit('delete', props.idx);
</script>
<style scoped>
.catalog-container {
  background-image: url("@/assets/ppt/template/1/2_02.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
  --color: #5e8c54;
}
.catalog-title {
  padding-block-start: 0;
  padding-block-end: 0;
  text-align: center;
  display: block;
  width: 100%;
  box-sizing: border-box;
  letter-spacing: 0.1vw;
  color: var(--color);
  margin-bottom: 20px;

}
.catalog-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  right: 10%;
  z-index: 1;
}
.catalog-items {
  padding: calc(var(--width) * 0.01) 5px;
  box-sizing: border-box;
  border: 1px solid var(--color);
  margin-bottom: 25px;
  width: calc(var(--width) * 0.33) ;
  position: relative;
  padding-right: 20px;
  font-weight: 500;
  color: var(--color);
}
.catalog-edit {
  position: absolute;
  right: 0;
  top: 0;
  color: var(--color);
  cursor: pointer;
}
h2 {
  font-size: 2vw;
}
.deleted-item {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  color: #f61d33
}

</style>