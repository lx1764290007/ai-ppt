<template>
  <div class="wrapper">
    <el-dialog
      v-model="dialogVisible"
      title="编辑器"
      width="880"
      :before-close="handleClose"
    >
      <div class="container">
        <Toolbar
          :editor="editorRef"
          mode="simple"
          :default-config="defaultConfig"
          @toolbarClickEvents="onContextmenu"
          style="border-bottom: 1px solid #ccc"
        />
        <Editor
          v-model="valueHtml"
          :defaultConfig="editorConfig"
          mode="simple"
          style="min-height: 260px; overflow-y: hidden; min-width: 200px"
          @onChange="onContextmenu"
          @onCreated="handleCreated"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import type { PText } from "@/interface/PPT";
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { onBeforeUnmount, ref, shallowRef, onMounted } from 'vue';
import { i18nChangeLanguage } from '@wangeditor/editor';
import { Editor, Toolbar} from '@wangeditor/editor-for-vue'


const editorRef = shallowRef();
const dialogVisible = ref(true);
i18nChangeLanguage('en');
// 内容 HTML
const valueHtml = ref('<p></p>');
const editorConfig = { placeholder: '请输入内容...',autoFocus: true, readOnly: false }

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleCreated = (editor:any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
onMounted(()=>{

  setTimeout(()=>{
    valueHtml.value = '<h2>模拟 Ajax 异步设置内容</h2>';
    if(editorRef.value) {
      console.log(editorRef.value.getAllMenuKeys())
    }
  }, 2000)
})
const handleClose = (done: () => void) => {

}
const defaultConfig = ref( {
  toolbarKeys : [
    'fontSize',
    // 分割线
    '|',
    // 菜单 key
    'bold', 'italic','underline','color',
    '|'
  ]
})
const data = reactive<PText>({
  color: '#333333',
  fontSize: '18px',
  italic: false,
  underline: false,
  data: 'PPT标题',
  bold: true
})

const onContextmenu = (event:any)=> {
  console.log(event)
}
</script>



<style scoped>

.container {
  pointer-events: all;
  position: relative;
}

</style>