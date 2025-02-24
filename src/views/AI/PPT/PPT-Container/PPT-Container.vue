<template>
  <div class="wrapper">
    <el-button-group class="el-button-group">
      <el-button>{{$t('universal.save')}}</el-button>
      <el-button @click="onExportPPT" :disabled="exporting">{{$t('universal.export')}} PDF</el-button>
    </el-button-group>
    <el-scrollbar always class="preview">
      <PPTTemplate1Preview v-model:active-idx="activeItem" :preview-list="previewList" />
    </el-scrollbar>
    <PPTTemplate1Main :active-idx="activeItem" :dataSource="dataSource" @remove="onRemove" />
  </div>
  <!--<el-dialog v-model="show" width="800" style="height: 500px">-->
  <!--  <div class="dialog-wrapper">-->
  <!--    <img alt="img" :src="item" v-for="(item, i) of imgList" :key="i"> />-->
  <!--  </div>-->
  <!--</el-dialog>-->
  <div class="progress-loading-popup" v-if="exporting">
      <div class="progress-loading">
        <p class="progress-wait">{{$t('universal.wait')}}</p>
        <el-progress type="circle" :percentage="progressPercentage" />
      </div>
  </div>
</template>
<script lang="ts" setup>
import PPTTemplate1Preview from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview.vue";
import PPTTemplate1Main from "@vs/AI/PPT/PPT-Container/Template/Template1/Main/PPT-Template1-Main.vue";

import { nextTick, onMounted, provide, ref } from "vue";
import type { TemplateData, TemplatePreview } from "@/interface/PPT";
import { EXPORTING, PPT_ENUM_TEMPLATE_TYPE } from "@vs/AI/enum";
import { h5ToCanvas } from "@/libs/htmlToCanvas";
import { imageToPDF } from "@/libs/imageToPdf";


const activeItem = ref(0);
const dataSource = ref<TemplateData[]>([]);
const previewList = ref<TemplatePreview[]>([]);

const exporting = ref(false);
const progressPercentage = ref(0);
let count = 0;

provide(EXPORTING, exporting);

onMounted(() => {
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      previewList.value.push({
        title: `${i}`,
        type: "title",
        template: PPT_ENUM_TEMPLATE_TYPE.T1
      });
      dataSource.value.push({
        type: "title",
        title: "Hello world",
        content: "1"
      });
    } else if (i === 1) {
      previewList.value.push({
        title: `${i}`,
        type: "catalog",
        template: PPT_ENUM_TEMPLATE_TYPE.T1
      });
      dataSource.value.push({
        type: "catalog",
        title: "catalog",
        content: "1"
      });
    } else if (i === 8) {
      previewList.value.push({
        title: `${i}`,
        type: "summarize",
        template: PPT_ENUM_TEMPLATE_TYPE.T1
      });
      dataSource.value.push({
        type: "summarize",
        title: "summarize",
        content: "1"
      });
    } else if (i === 9) {
      previewList.value.push({
        title: `${i}`,
        type: "discuss",
        template: PPT_ENUM_TEMPLATE_TYPE.T1
      });
      dataSource.value.push({
        type: "discuss",
        title: "discuss",
        content: "1"
      });
    } else {
      previewList.value.push({
        title: `${i}`,
        type: "content",
        template: PPT_ENUM_TEMPLATE_TYPE.T1
      });
      dataSource.value.push({
        type: "content",
        title: "content",
        content: "1"
      });
    }
  }
});

const onExportPPT = () => {
  exporting.value = true;
  nextTick(() => {
    setTimeout(async () => {
      //data-template="export" data-prefix-sort="3" :data-after-sort="idx"
      const nodeList: any = document.querySelectorAll("[data-template='export']");
      const nodeListAfterSorted = Array.from(nodeList).sort((a: any, b: any) => parseInt(a.dataset.prefixSort) - parseInt(b.dataset.prefixSort));
      //找到模板中content的起始位置
      const contentStartPosition = nodeListAfterSorted.findIndex((item: any) => item.dataset.afterSort);
      if (contentStartPosition > -1) {
        // 把内容模板提取出来并按照升序排序
        const contentSorted = nodeListAfterSorted.filter((item: any) => item.dataset.afterSort).sort((a: any, b: any) => parseInt(a.dataset.afterSort) - parseInt(b.dataset.afterSort));
        // 把排好序的内容模板平替原来的内容模板
        nodeListAfterSorted.splice(contentStartPosition, contentSorted.length, ...contentSorted);
      }
      Promise.all((nodeListAfterSorted as HTMLElement[]).map((item: HTMLElement) => covert(item))).then(async res => {


        await imageToPDF(res as string[]);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        exporting.value = false;
        count = 0;
        progressPercentage.value = 0;
      });
    }, 300);
  });
};

const covert = async (dom: HTMLElement) => {
  count += 1;
  if (dataSource.value.length > 0) {
    progressPercentage.value = Math.floor( (count / dataSource.value.length) * 100);
  }
  return await h5ToCanvas(dom);
};
const onRemove = (idx: number) => {
  dataSource.value.splice(idx, 1);
  previewList.value.splice(idx, 1);
  if(activeItem.value > 0){
    activeItem.value -= 1;
  }
}
</script>
<style scoped>
.wrapper {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
}

.preview {
  --width: calc(100vw - var(--menu-widh) - 200px - 40px);
  --height: calc(var(--width) * 9 / 16);
  width: 220px;
  height: var(--height);
  box-sizing: border-box;
  overflow-y: auto;
}

.el-button-group {
  margin: 20px 0;
  float: right;
  position: absolute;
  right: 0;
  top: -70px;
  z-index: 1;
}

.progress-wait {
  position: absolute;
  left: 10px;
  top: 10px;
  font-size: smaller;
  color: #3e3e3e;
}
.dialog-wrapper img {
  width: 100%;
  display: block;
}

.progress-loading {
  width: 400px;
  height: 240px;
  background-color: #f1f1f1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
}

.progress-loading-popup {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: space-around;
  backdrop-filter: blur(3px);
}

</style>