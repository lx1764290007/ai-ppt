<template>
  <div class="ai-appraise-com__header">
    {{ $t('creation.evaluation') +' '+ $t('universal.edit') }}
  </div>
  <el-input type="textarea"
            v-model="textareaValue"
            :autosize="{ minRows: 23, maxRows: 25 }"
            :placeholder="loading? $t('universal.wait'):$t('universal.placeholder')" class="appraise-content-wrapper">
  </el-input>
  <div class="appraise-content-footer">
    <el-button :loading="loading" size="large"
               @click="onFetch"
               v-if="hasAiAuth"
               class="default__button-active"
               style="width: 120px">
      {{ $t('creation.ai_evaluation') }}
    </el-button>
    <el-button size="large"
               v-if="hasAiAuth"
               type="primary"
               @click="showAiEdit = true" class="default__button-active"
               style="width: 120px">
      {{ $t('creation.ai_editor') }}
    </el-button>
    <el-button size="large" :loading="loading"
               type="primary"
               class="default__button-active"
               @click="onUpdate"
               style="width: 120px;background-color: #0170F8;">
      {{$t('universal.save')}}
    </el-button>
  </div>
  <message-box v-model:visible="showAiEdit" :height="400 + 'px'" :width="600 +'px'" @close="onClose" >
    <a-i-editor ref="editorRef" />
  </message-box>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { fetchGenerateEvaluation, fetchUpdateEvaluation } from "@/http/opus";
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import AIEditor from "@cs/AI-Editor/AI-Editor.vue";

import type { Privileges } from "@/interface/User";
import { useAuth } from "@/libs/useAuth";
import { useI18n } from "vue-i18n";


interface DataItem {
  productionname: string;
  author: string;
  score: string;
  evaluate: string;
  classname: string;
  production: string;
  id: number
}

const props = defineProps<{
  data: DataItem
}>();
const emit = defineEmits<{
  (ev: "back", value: string): void
}>();

const textareaValue = ref("");
const loading = ref(false);
const showAiEdit = ref(false);
const userInfo = useAuth();
const {t} = useI18n();

const editorRef = ref();

let keyWord = "";

/**
 * 請幫我以滿分100分，分別從 風格：33.33%，構圖：33.33%，色彩：33.33%，以專業美術老師的角度為這幅作品進行詳細評價打分，結果按 總分數、各項分數、各項評論 順序分段顯示，第一句固定顯示總分數得分，評論盡可能詳細，末尾不用總結，分數不用計算過程並保留兩位小數，直接給得分。
 */
const onFetch = () => {
  loading.value = true;

  const text = keyWord;

  fetchGenerateEvaluation({
    text,
    image: props.data?.production
  }).then((res: { code: number, data: string }) => {
    if (res && res.code == 200) {

      textareaValue.value = res.data;
    }
  }).finally(() => loading.value = false);
};
const onUpdate = () => {
  const firstLine = textareaValue.value.match(/^[^\n]+/)?.[0] || "";
  const match = firstLine.match(/\d+(\.\d+)?/) || [];
  loading.value = true;
  fetchUpdateEvaluation({
    id: props.data.id,
    evaluate: textareaValue.value.replace(/\n/g, "<br>"),
    score: match[0] || ""
  }).then((res: { code: number, data: string }) => {
    if (res && res.code == 200) {
      emit("back", textareaValue.value);
    }
  }).finally(() => loading.value = false);
};
const onClose = ()=> {
  if(editorRef.value) {
    const data = editorRef.value.getResult();
    window.localStorage.setItem("ai-editor", JSON.stringify(data));
    setKeyWord(data);
  }
  showAiEdit.value = false;
}
const setKeyWord = (data:any =  window.localStorage.getItem("ai-editor"))=> {
  let _data = data;
  if(typeof data == "string") {
    _data = JSON.parse(data);
  }
  const tempArr = _data.filter((it:any)=> it.checked);
  let wordName = "";
  let _total = tempArr.reduce((accumulator:any, item:any) => accumulator + item.value, 0);

  for (let i = 0; i < tempArr.length; i++) {
    const weighted = ((tempArr[i].value / _total) * 100).toFixed(2) + '%'
    wordName +=  t(tempArr[i].name) + (i === tempArr.length - 1? `: ${weighted}，`:`: ${weighted}，`);
  }
  keyWord = `${wordName}`;
}
const dataSource = [
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
];

onMounted(() => {
  if (props.data?.production) {
   // onFetch();
    const localData = window.localStorage.getItem("ai-editor");
    if(localData) {
      const _localData = JSON.parse(localData);
      if(_localData && _localData.some((it:any)=> it.name?.startsWith('風'))) {
        window.localStorage.removeItem("ai-editor");
      } else {
        setKeyWord(localData);
      }
    } else {
      window.localStorage.setItem("ai-editor", JSON.stringify(dataSource));
      setKeyWord();
    }
  }
  if(props.data.evaluate) {
    textareaValue.value = props.data.evaluate.replace(/<br>/g, "\n");
  }
});

const hasAiAuth = computed( ()=> {
  return userInfo.info.privileges?.some((it:Privileges)=> it.id === 2)
})
defineExpose({
  onUpdate
})

</script>
<style scoped>
.appraise-content-wrapper {
  width: 100%;
  height: calc(100% - 80px);
  box-sizing: border-box;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 15px;
  color: #414D5F;
}

.ai-appraise-com__header {
  transform: translateY(-25px);
  text-align: center;
  font-size: 18px;
  font-weight: normal;
  pointer-events: none;
}

.item--first-line, .item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border-bottom: 1px solid #c9c9c9;
  padding: 10px 0;
}

.appraise-content-wrapper input, .appraise-content-wrapper textarea {
  border: none;
  outline: none;
  padding: 0 10px;
  background-color: transparent;
  font-size: 18px;
  color: #414D5F;
  text-align: justify;
  resize: none;
}

.appraise-content-wrapper textarea {
  padding: 0;
  width: 100%;
  margin-top: 10px;
}

.appraise-content-wrapper .item-title {
  font-size: 18px;
  font-weight: 400;
}

.appraise-content-wrapper .item {
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
}

.appraise-content-footer {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 60%;
  margin: 5px auto;
}

@keyframes slide-in {
  from {
    transform: translateX(100px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>