<template>
  <div class="appraise-component" v-show="appraise">
    <div class="ai-appraise-com__header">
      {{$t('creation.work_evaluation')}}
    </div>
    <main class="ai-appraise-com__main">
      <section class="ai-appraise-com__main-left">
        <el-image class="ai-appraise-com__main-image"
                  :src="data?.production" alt="picture"
                  fit="contain" />
      </section>
      <section class="ai-appraise-com__main-right">
        <div class="ai-appraise-com__main-right-top">
          <div class="fake"></div>
          <div class="top-item">
            <span class="name">{{$t('universal.name')}}：</span>
            <input class="name-value" :value="data?.author" @change="onUpdate('author', $event.target.value)" />
          </div>
          <div class="top-item">
            <span class="name">{{$t('creation.work')}}：</span>
            <input class="name-value" :value="data?.productionname" @change="onUpdate('productionname', $event.target.value)" />

          </div>
          <div class="top-item">
            <span class="name">{{$t('grade.class')}}：</span>
            <input class="name-value" :value="data?.classname" @change="onUpdate('classname', $event.target.value)" />
          </div>
          <div class="top-item">
            <span class="name">{{$t('creation.rating')}}：</span>
            <input class="name-value" :value="data?.score" @change="onUpdate('score', $event.target.value)" />
          </div>
        </div>
        <div class="ai-appraise-com__main-right-bottom">
          <div class="fake"></div>
          <p style="padding-top: 15px">
            {{$t('creation.work_evaluation')}}
          </p>
          <el-scrollbar class="scroll">
            <article class="content" v-html="data?.evaluate">
            </article>
          </el-scrollbar>
        </div>
        <el-button class="button default__button-active"
                   size="large"
                   @click = "appraise = !appraise"
                   style="width: 120px">
          {{$t('universal.edit')}}
        </el-button>
      </section>
    </main>
  </div>
  <div v-if="!appraise" style="width: 100%;height: 100%">
    <appraise-content @back="onBack" :data="data"  />
  </div>

</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import AppraiseContent from "@cs/AI-Appraise/Appraise-Content.vue";
import { fetchUpdateEvaluation } from "@/http/opus";

interface DataItem {
  productionname:string
  author: string
  score:string
  evaluate: string
  classname:string
  production: string
  id: number
}
const emit = defineEmits<{
  (ev: "close", value: boolean): void
  (ev: "update", value: string): void
}>()

const props = defineProps<{
  data: DataItem
}>();

const appraise = ref(true);

const onUpdate = (key:any, newVal:string)=> {
  if(key==="score"){
    fetchUpdateEvaluation({
      id: props.data.id,
      evaluate: props.data.evaluate.replace(/^.*?(<br>|\n|$)/, `總分數得分：${newVal}分` + '<br>'),
      [key]: newVal
    }).then((res: { code: number, data: string }) => {
      if (res && res.code == 200) {
          emit("update", newVal);
      }
    })
  } else {
    fetchUpdateEvaluation({
      id: props.data.id,
      [key]: newVal
    })
  }
}
const onBack = (value?:string)=> {
  appraise.value = true;
  if(value){
    emit("close", true);
  }
}
watch(()=> props.data, value=> {
  if(!value){
    appraise.value = true;
  }
})
</script>
<style scoped>
.ai-appraise-com__main-image {
  width: calc(400px * 1.9);
  height: calc(300px * 1.9);
  background-color: #dedede;
}

.appraise-component {
  align-self: flex-start;
  justify-self: flex-start;
  position: relative;
  width: 100%;
  box-sizing: border-box;

}

.ai-appraise-com__header {
  transform: translateY(-25px);
  text-align: center;
  font-size: 20px;
  font-weight: normal;
  pointer-events: none;
}

.ai-appraise-com__main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-flow: row nowrap;
}

.ai-appraise-com__main-right {
  width: 34%;
  box-sizing: border-box;
  margin: 0 10px;
}

.ai-appraise-com__main-right-top {
  font-size: 16px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 5px;
  color: #414D5F;
  position: relative;
  background-color: #fff;
}

.ai-appraise-com__main-right-top .top-item {
  display: flex;
  justify-self: center;
  align-items: center;

}

.ai-appraise-com__main-right-top .top-item + .top-item {
  margin: 8px 0;
}

.ai-appraise-com__main-right-top .name {
  display: block;
  width: 70px;
  text-align: right;
}

.ai-appraise-com__main-right-top .name-value {
  border: 0;
  border-bottom: 1px solid rgba(199, 199, 199, 0.8);
  display: block;
  width: calc(100% - 70px);
  padding-left: 10px;
  min-height: 25px;
  outline: none;
  color: #4f4f4f;
  font-size: 15px;
}

.fake {
  width: 70px;
  height: 6px;
  background: #2C9BFF;
  border-radius: 0px 0px 10px 10px;
  position: absolute;
  left: calc(50% - 35px);
  top: 0;
}

.ai-appraise-com__main-right-bottom {
  font-size: 16px;
  background-color: #fff;
  position: relative;
  padding: 0 10px;
  margin-top: 20px;
  border-radius: 10px;
}

.ai-appraise-com__main-right-bottom p {
  text-align: center;
  padding: 5px;
}

.ai-appraise-com__main-right-bottom button {
  margin: 20px auto;
}

.button {
  margin: 20px auto;
  display: block;
}

.ai-appraise-com__main-right-bottom .content {
  font-weight: 400;
  font-size: 15px;
  color: #414D5F;
  word-break: break-all;
  padding: 5px 10px;

}

.scroll {
  height: 270px;
}
</style>