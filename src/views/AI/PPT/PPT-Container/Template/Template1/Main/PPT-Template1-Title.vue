

<template>
  <div class="title-container" data-template="export" data-prefix-sort="1">
    <el-icon class="deleted-item" @click="handleDelete">
      <Delete />
    </el-icon>
    <div class="title-wrapper" >
      <div v-html="h5" style="text-align:center;">
      </div>
      <el-icon class="title-edit" @click="openDialog" v-if="!exporting">
        <Edit />
      </el-icon>
    </div>

  </div>
  <EditorModal :visible="visible" @close="onClose" :h5="h5" @done="onDone"  />
</template>
<script setup lang="ts">

import { Delete, Edit } from "@element-plus/icons-vue";
import EditorModal from "@vs/AI/PPT/Editor/Editor-Modal.vue";
import { inject, ref } from "vue";
import { EXPORTING } from "@vs/AI/enum";

const exporting = inject(EXPORTING);
const props = defineProps(['idx']);
const emit = defineEmits(['delete']);
const h5 = ref('<h2>《世界历史》是一份自由、内容开放的世界历史教学书</h2>');
const visible = ref(false);
const openDialog = ()=> visible.value = !visible.value;
const onClose = ()=> visible.value = false;
const onDone = (value:string)=> h5.value = value;
const handleDelete = ()=> emit('delete', props.idx);
</script>
<style scoped>
.title-container {
  background-image: url("@/assets/ppt/template/1/2_01.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
}
.title-wrapper {
  display: block;
  width: 50%;
  box-sizing: border-box;
  letter-spacing: 1px;
  margin: 0 auto;
  position: relative;
}

h2 {
  text-align: center;
  font-size: 2vw;
}
.title-edit {
  position: absolute;
  right: 0;
  cursor: pointer;
  top: 0;
}
.deleted-item {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  color: #f61d33
}

</style>