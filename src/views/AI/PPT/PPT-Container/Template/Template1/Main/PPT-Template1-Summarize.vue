

<template>
  <div class="summarize-container" data-template="export" data-prefix-sort="4">
    <el-icon class="deleted-item" @click="handleDelete">
      <Delete />
    </el-icon>
     <div class="summarize-title">
        <h2>總 結</h2>
     </div>
    <div class="summarize-description">
      <div class="summarize-description-item">
        <div class="summarize-description-title">
          <div v-html="myTarget.title1"></div>
          <el-icon class="summarize-title-edit" @click="openDialog('title1')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
        <div class="summarize-description-content">
          <div v-html="myTarget.content1"></div>
          <el-icon class="summarize-title-edit"  @click="openDialog('content1')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
      </div>
      <div class="summarize-description-item">
        <div class="summarize-description-title">
          <div v-html="myTarget.title2"></div>
          <el-icon class="summarize-title-edit" @click="openDialog('title2')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
        <div class="summarize-description-content">
          <div v-html="myTarget.content2"></div>
          <el-icon class="summarize-title-edit"  @click="openDialog('content2')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
      </div>
      <div class="summarize-description-item">
        <div class="summarize-description-title">
          <div v-html="myTarget.title3"></div>
          <el-icon class="summarize-title-edit" @click="openDialog('title3')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
        <div class="summarize-description-content">
          <div v-html="myTarget.content3"></div>
          <el-icon class="summarize-title-edit" @click="openDialog('content3')" v-if="!exporting">
            <Edit />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
  <EditorModal :h5="h5"  :visible="visible" @close="onClose" @done="onDone" />
</template>
<script setup lang="ts">
import { Delete, Edit } from "@element-plus/icons-vue";
import EditorModal from "@vs/AI/PPT/Editor/Editor-Modal.vue";
import { inject, reactive, ref } from "vue";
import { EXPORTING } from "@vs/AI/enum";

const exporting = inject(EXPORTING);
const h5 = ref("");
const myTarget = reactive({
  title1: '<h3>人类聚落</h3>',
  title2: '<h3>史前时代</h3>',
  title3: '<h3>大河文明的诞生</h3>',
  content1: '<p>末次冰期结束和人类聚落涌现的地理前提</p>',
  content2: '<p>没有文字记载和充满传说的时代</p>',
  content3: '<p> 四大文明古国</p>',
})
const activeTarget = ref<null|'title1'|'title2'|'title3'|'content1'|'content2'|'content3'>(null);

const onDone = (value:string)=> {
  h5.value = value;
  if(activeTarget.value!=null){
    myTarget[activeTarget.value] = value;
  }
}
const visible = ref(false);

const openDialog = (target:'title1'|'title2'|'title3'|'content1'|'content2'|'content3')=> {
  visible.value = !visible.value;
  activeTarget.value = target;
  h5.value = myTarget[target];
}
const props = defineProps(['idx']);
const emit = defineEmits(['delete']);
const onClose = ()=> visible.value = false;
const handleDelete = ()=> emit('delete', props.idx);
</script>
<style scoped>
.summarize-container {
  background-image: url("@/assets/ppt/template/1/2_08_2.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  --color: #fff;
  position: relative;
  --border-color: #5E8C54FF;
}
.summarize-title {
  position: absolute;
  z-index: 1;
  right: 7.5%;
  color: var(--color);
  writing-mode: vertical-lr;
  letter-spacing: 3px;
  top: calc(50% - calc(var(--width) * 0.3) / 2);
  height: calc(var(--width) * 0.3);
  text-align: center;
  font-weight: bold;

}
.summarize-description {
  position: absolute;
  z-index: 1;
  top: 12%;
  left: calc(var(--width) * 0.085);
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: space-between;
  height: calc(var(--height) - 24%);
}

h2 {
  font-size: 2vw;
  margin-block-start: 0;
  margin-block-end: 0;
}
h3 {
  font-size: 1.5vw;
  margin-block-start: 0;
  margin-block-end: 0;
}
h4 {
  font-size: 1.2vw;
  margin-block-start: 0;
  margin-block-end: 0;
}

.summarize-description-title {
  box-sizing: border-box;
  border: 2px solid var(--border-color);
  padding: .42vw .52vw;
  width: calc(var(--width) * 0.33) ;
  padding-right: 30px;
  position: relative;
}
.summarize-description-content {
  box-sizing: border-box;
  border: 2px solid var(--border-color);
  padding: .4vw .5vw;
  width: calc(var(--width) * 0.63) ;
  position: relative;
}
.summarize-title-edit {
  position: absolute;
  right: 0;
  z-index: 1;
  top: 0;
  color: #333;
  cursor: pointer;
}
.deleted-item {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  color: #f61d33
}

</style>