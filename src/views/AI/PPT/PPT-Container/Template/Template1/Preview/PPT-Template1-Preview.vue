<template>
  <div :class="{'preview-item':true, 'preview-item-active':index===activeIdx}" v-for="(item, index) of previewList"
       :key="index" @click="onChange(index)">
    <PPTTemplate1PreviewTitle v-if="Object.is(item.type, 'title')" />
    <PPTTemplate1PreviewCatalog v-if="Object.is(item.type, 'catalog')" />
    <PPTTemplate1PreviewContent v-if="Object.is(item.type, 'content')" />
    <PPTTemplate1Summarize v-if="Object.is(item.type, 'summarize')" />
    <PPTTemplate1Discuss v-if="Object.is(item.type, 'discuss')" />
  </div>
</template>
<script setup lang="ts">
import PPTTemplate1PreviewTitle
  from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview-Title.vue";
import PPTTemplate1PreviewCatalog
  from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview-Catalog.vue";
import PPTTemplate1PreviewContent
  from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview-Content.vue";
import PPTTemplate1Summarize
  from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview-Summarize.vue";
import PPTTemplate1Discuss
  from "@vs/AI/PPT/PPT-Container/Template/Template1/Preview/PPT-Template1-Preview-Discuss.vue";
import { onMounted } from "vue";
import type { TemplatePreview } from "@/interface/PPT";

withDefaults(defineProps<{
  activeIdx: number
  previewList: TemplatePreview[]
}>(), {
  activeIdx: 0,
  previewList(){
    return []
  }
})
const emit = defineEmits(['update:activeIdx']);
onMounted(() => {

});
const onChange = (idx: number) => {
  emit('update:activeIdx', idx);
};
</script>
<style scoped>
.preview-item {
  width: 198px;
  height: 120px;
  border: 1px solid transparent;
  margin: 5px 0;
  background: #f1f1f1;
  cursor: pointer;
  user-select: none;
}
 .preview-item:nth-of-type(1) {
   margin-top: 0;
 }
 .preview-item-active {
  border: 2px solid #4f8dd5;
}
</style>