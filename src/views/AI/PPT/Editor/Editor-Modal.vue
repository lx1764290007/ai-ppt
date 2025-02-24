

<template>
  <el-dialog
    :model-value ="visible"
    :title="$t('ppt.ppt_editor')"
    show-close
    width="640"
    append-to-body
    @close="onClose"
  >
    <div v-if="visible">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
      />
      <Editor
        style="height: 330px; overflow-y: hidden;"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        @onCreated="handleCreated"
      />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onUseAI" >
          {{$t('ppt.ai_edit') }}
        </el-button>
        <el-button type="primary" @click="onDone">
          {{$t('universal.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, watch , shallowRef, onBeforeUnmount } from "vue";

import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"; // 引入 css
import { i18nChangeLanguage } from '@wangeditor/editor'
import vcSubscribePublic from "@/libs/eventBus";
// 切换语言 - 'en' 或者 'zh-CN'
i18nChangeLanguage('en');

const props = withDefaults(defineProps<{
  visible:boolean
  h5?: string
}>(), {
  visible: false,
  h5: ''
})
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref(props.h5);


watch(props, (target)=>{
  valueHtml.value = target.h5;
})

const toolbarConfig = {
  toolbarKeys: [
    'fontSize', 'bold', 'italic',  'underline','|', 'color'
  ]
}
const editorConfig = { placeholder: '请输入内容...' }

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor:any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
 const emit = defineEmits(['close', 'done', 'useAI']);
 const onClose = ()=> emit('close');
 const onUseAI = () => {
   const text:string = editorRef.value?.getText();
   console.log(text);
   emit('useAI', text);
   vcSubscribePublic.public('useAI', text);
   onDone();
 }
 const onDone = ()=> {
   emit('done', valueHtml.value);
   onClose();
 }

</script>
<style scoped>

</style>