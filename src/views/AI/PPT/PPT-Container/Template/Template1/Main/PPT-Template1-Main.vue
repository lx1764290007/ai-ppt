<template>
 <div class="template-main">
   <el-carousel motion-blur indicator-position="none" ref="carousel" arrow="never" class="carousel" height="100%" direction="vertical" :autoplay="false">
     <el-carousel-item v-for="(item,i) in dataSource" :key="i">
       <PPTTemplate1Discuss :idx="i" v-if="Object.is(item.type, 'discuss')" @delete="onDelete" />
       <PPTTemplate1Summarize :idx="i" v-if="Object.is(item.type, 'summarize')" @delete="onDelete" />
       <PPTTemplate1Content :idx="i" v-if="Object.is(item.type, 'content')" @delete="onDelete" />
       <PPTTemplate1Title :idx="i" v-if="Object.is(item.type, 'title')" @delete="onDelete" />
       <PPTTemplate1Catalog :idx="i" v-if="Object.is(item.type, 'catalog')" @delete="onDelete" />
     </el-carousel-item>
   </el-carousel>
 </div>
  <el-dialog
    v-model="deleteConfirmDialogVisible"
    :title="$t('universal.tips')"
    width="500"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
  >
    <span>{{$t('universal.delete_tips')}}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteConfirmDialogVisible = false">
          {{$t('universal.cancel')}}
        </el-button>
        <el-button type="danger" @click="onConfirmDelete">
          {{$t('universal.go_on')}}
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>
<script setup lang="ts">
import PPTTemplate1Title from "./PPT-Template1-Title.vue";
import PPTTemplate1Catalog from "./PPT-Template1-Catalog.vue";
import PPTTemplate1Content from "./PPT-Template1-Content.vue";
import PPTTemplate1Summarize from "./PPT-Template1-Summarize.vue";
import PPTTemplate1Discuss from "./PPT-Template1-Discuss.vue";
import type { TemplateData } from "@/interface/PPT";

import { ref, watch } from "vue";


const emit = defineEmits(["remove"]);
const carousel = ref<HTMLFormElement>();
const deleteConfirmDialogVisible = ref(false);
let preDeleteItemIndex = -1;
const props = withDefaults(defineProps<{
  activeIdx?: number
  dataSource: TemplateData[]
}>(), {
  activeIdx: 0,
  dataSource() {
      return []
  },
})

watch(props,(value)=>{
   carousel.value?.setActiveItem(value.activeIdx);
})
const onDelete = (index:number)=> {
  preDeleteItemIndex = index;
  deleteConfirmDialogVisible.value = true;
}
const onConfirmDelete = ()=> {
  emit('remove', preDeleteItemIndex);
  deleteConfirmDialogVisible.value = false;
}
</script>
<style scoped>
.template-main{
  --width: calc(100vw - 200px - 200px - 40px);
  --height: calc(var(--width) * 9 / 16);
  width: var(--width);
  height: var(--height);

}
.carousel {
  height: var(--height);
}

</style>