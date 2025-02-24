

<template>
  <div class="discuss-container" data-template="export" data-prefix-sort="5">
    <el-icon class="deleted-item" @click="handleDelete">
      <Delete />
    </el-icon>
    <h2 class="discuss-title">
      讨论与练习
    </h2>
    <div class="discuss-content">
      <div class="discuss-item-container" v-for="item of 2" :key="item">
        <div :class="{'discuss-item':true, 'discuss-item-fixed': item===2}" >
          <div class="discuss-item-title">
            <div v-html="item===1? myTarget['title1']:myTarget['title2']"> </div>
            <el-icon class="discuss-edit" @click="openDialog(item===1? 'title1':'title2')" v-if="!exporting">
              <Edit />
            </el-icon>
          </div>
          <div class="discuss-item-content">
            <div v-html="item===1? myTarget['content1']:myTarget['content2']"></div>
            <el-icon class="discuss-edit" @click="openDialog(item===1? 'content1':'content2')" v-if="!exporting">
              <Edit />
            </el-icon>
          </div>
        </div>
        <div :class="{'discuss-item':true, 'discuss-item-fixed': item===2}">
          <div class="discuss-item-title">
            <div v-html="item===1? myTarget['title3']:myTarget['title4']"></div>
            <el-icon class="discuss-edit" @click="openDialog(item===1? 'title3':'title4')" v-if="!exporting">
              <Edit />
            </el-icon>
          </div>
          <div class="discuss-item-content">
            <div v-html="item===1? myTarget['content3']:myTarget['content4']"></div>
            <el-icon class="discuss-edit" @click="openDialog(item===1? 'content3':'content4')" v-if="!exporting">
              <Edit />
            </el-icon>
          </div>
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
  title1: '<p><span style="font-size: 16px;"><b>古希腊文明 </b></span></p>',
  title2: '<p style="font-size: 16px;"> <b>扩张中的罗马共和国 </b></p>',
  title3: '<p style="font-size: 16px;"><b>近东帝国</b></p>',
  title4: '<p style="font-size: 16px;"><b>大汉铁骑</b></p>',
  content1: '<p>古风时代 - 希腊城邦的崛起\n' +
    '希波战争 - 希波战争\n' +
    '希腊黄金时期 - 古希腊三贤\n' +
    '伯罗奔尼撒战争 - 无尽的内斗\n' +
    '马其顿的征服 - 菲利普二世\n' +
    '伟大的征服者 - 亚历山大大帝\n' +
    '内斗2.0 - 继承者帝国\n' +
    '被征服的命运 - 罗马征服希腊</p>',
  content2: '<p>奥古斯都大帝 - 奥古斯都治下的罗马\n' +
    '尼禄火烧罗马城 - 公元1世纪初期的帝国</p>',
  content3: '<p>王政时代 - 台伯海一隅\n' +
    '罗马共和国 - 早期共和\n' +
    '逐鹿亚平宁 - 罗马人征服意大利\n' +
    '西西里风云 - 第一次布匿战争\n' +
    '穿越阿尔卑斯山的汉尼拔 - 第二次布匿战争\n' +
    'Carthago delenda est!（迦太基必须毁灭） - 第三次布匿战争\n' +
    '马略改革 - 晚期共和的军阀政治\n' +
    '富裕的东方帝国 - 罗马人征服小亚细亚</p>',
  content4: '<p>`三代与秦时的中国 - 由传疑时代，夏、商、周三代至统一的大秦帝国\n' +
    '千古一帝秦始皇 - 秦王朝的大一统\n' +
    '统一后的措施 - 度量衡与中央集权\n' +
    '王侯将相，宁有种乎？ - 中原的再次分裂\n' +
    '鸿门宴 - 汉的建立\n' +
    '文景之治 - 汉初休养生息\n' +
    '一将功成万骨枯 - 汉武帝的扩张政策`</p>'
})
const activeTarget = ref<null|'title1'|'title2'|'title3'|'title4'|'content1'|'content2'|'content3'|'content4'>(null);

const onDone = (value:string)=> {
  h5.value = value;
  if(activeTarget.value!=null){
    myTarget[activeTarget.value] = value;
  }
}
const visible = ref(false);

const openDialog = (target:'title1'|'title2'|'title3'|'title4'|'content1'|'content2'|'content3'|'content4')=> {
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
.discuss-container {
  background-image: url("@/assets/ppt/template/1/2_08.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  --border-color: #5e8c54;
}
.discuss-title {
  padding-block-start: 0;
  padding-block-end: 0;
  text-align: center;
  display: block;
  width: 100%;
  box-sizing: border-box;
  letter-spacing: 1px;
  position: absolute;
  top: 5%;
  padding-left: 2.5%;
}
h2 {
  font-size: 2vw;
}
.discuss-content {
  width: calc(var(--width) * 0.8);
  border: 1px solid #333;
  height: calc(var(--height) * 0.7);
  position: absolute;
  top: 20%;
  left: 10%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}
.discuss-item {
  padding: 5px 9% 5px 22%;
  flex: 1;
  border: 1px solid #fcfcfc;
  height: calc(var(--height) * 0.2);
  box-sizing: border-box;
}
.discuss-item-title {
  border: 1px solid var(--border-color);
  width: 90%;
  max-height: 4vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0.4vw 1.4vw 0.4vw 0.3vw;
  box-sizing: border-box;
  position: relative;

}
.discuss-edit {
  position: absolute;
  right: 0;
  z-index: 1;
  top: 0;
  cursor: pointer;
}
.discuss-item-content {
  width: 100%;
  margin-left: 0.6vw;
  margin-top: 0.2vw;
  border: 1px solid var(--border-color);
  padding: 0.5vw 0.3vw 0.5vw 0.3vw;
  height: calc(var(--height) * 0.15);
  overflow: hidden;
  position: relative;
}
.discuss-item-container {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  margin-top: 2%;
  height: 100%;
}
h3, h4 {
  margin-block-start: 0;
  margin-block-end: 0;
  padding-block-start: 0;
  padding-block-end: 0;
}
h3 {
  white-space: nowrap;
  word-wrap: anywhere;
  text-overflow: clip;
  max-width: 100%;
  overflow: hidden;
}
.discuss-item-fixed {
  margin-left: -5%;
}
.deleted-item {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  color: #f61d33
}

</style>