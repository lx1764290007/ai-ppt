<template>
  <div :class="{ 'thumbtack-answer-wrapper': true, topic__preview: preview }">
    <div class="thumbtack-answer-content">
      <div class="thumbtack-answer-content-input">
        <el-input
          type="textarea"
          size="large"
          show-word-limit
          :maxlength="REMAINING_MAX"
          autosize
          placeholder="输入问题"
          class="no-border"
          resize="none"
          style="text-align: center"
          @input="onQuestionChange"
          v-model="inputValue"
        />
      </div>
      <div class="thumbtack-answer-content-img">
        <el-upload
          class="upload-picture"
          drag
          v-if="!dataSource.image"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :multiple="false"
          @http-request="onRequest"
          @change="beforeUpload"
        >
          <el-icon class="is-icon-plus" @click.stop="onAiPictureOpen">
            <Plus />
          </el-icon>
          <p class="search-text">查找和插入媒体</p>
          <div class="el-upload__text">拖拽图片到这里 或<em> 点击上传 </em>图片</div>
        </el-upload>
        <div class="thumbtack-answer-content-uploaded" v-show="dataSource.image">
          <el-image
            class="img"
            :src="dataSource.image"
            @click.stop="onShowThumbtack"
            type="image/png"
            fit="contain"
            crossorigin="anonymous"
            alt="preview"
          />
          <canvas ref="resultCanvas" class="img img-canvas"></canvas>
          <div class="thumbtack-answer-content-tools">
            <el-button
              class="tools-btn-area"
              size="small"
              icon="Coordinate"
              @click.stop="onShowThumbtack"
            >
              正确区域
              <el-tag
                closable
                class="tips"
                v-if="!dataSource.dataJSON && tipsShow"
                @close="tipsShow = false"
              >
                你还未添加任何正确的区域
              </el-tag>
            </el-button>
              <div class="thumbtack-answer-content-tools--right">
              <img src="@/assets/crop.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="裁剪" @click.stop="onShowCropper" />

              <img src="@/assets/info.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="版权信息" @click.stop="onShowInfo" />

              <img src="@/assets/remove.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="删除" @click.stop="onDeletePicture" />
              </div>
          </div>
        </div>
      </div>
    </div>
    <div class="thumbtack-answer-content-footer">
      <el-image :src="demoImg" alt="pic" fit="contain" style="margin-right: 10px" />
      <span>玩家需要在图像上找到正确答案并用图钉标记。</span>
    </div>
  </div>
  <div ref="previewContainer" data-container="12345"></div>
  <VCropper v-model:visible="cropperVisible" :picture-url="dataSource.image" @done="onDone" />
  <v-picture v-model:visible="aiPicModalVisible" @change="onAiPictureChange" />
  <ThumbtackEditor
    :width="getContainerWidth"
    :height="getContainerHieght"
    v-model:visible="editorVisible"
    :picture-url="dataSource.image"
    @done="onThumbtackEditorDone"
    :json-data="dataSource.dataJSON"
  />
  <copyright-popup v-model="copyrightVisible"></copyright-popup>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {Plus } from "@element-plus/icons-vue";
import VCropper from "@/components/Cropper/V-Cropper.vue";
import VPicture from "@/components/Ai-Picture/V-Picture.vue";
import ThumbtackEditor from "@cs/Thumbtack-Editor/Thumbtack-Editor.vue";
import { Canvas } from "fabric";
import type { Topic } from "@/interface/Topic";
import { useTopicStore } from "@/libs/usePinia";
import CopyrightPopup from "@vs/Question-Generation/Copyright/Copyright-Popup.vue";

const REMAINING_MAX = 120;
const props = defineProps<{
  dataSource: Topic;
  preview?: boolean;
}>();
const topicStore = useTopicStore();

const inputValue = ref<string>(props.dataSource.question);
const editorVisible = ref(false);
const previewContainer = ref<HTMLDivElement>();
const aiPicModalVisible = ref(false);
const tipsShow = ref(true);

const onDeletePicture = () => {
  topicStore.update(
    Object.assign(props.dataSource, { image: "" }, { dataJson: null }),
    topicStore.getActive()
  );

  fabricCanvas?.clear();
};
const cropperVisible = ref(false);
const copyrightVisible = ref(false);
const demoImg = new URL("@/assets/demo/creator-illustration.svg", import.meta.url).href;
const resultCanvas = ref();
let fabricCanvas: Canvas | null = null;
const beforeUpload = (file: any) => {
  // 检查 file 是否是一个有效的 File 对象
  if (file.raw instanceof File) {
    const reader = new FileReader();
    // 当文件读取完成后触发的事件
    reader.onload = function (e: ProgressEvent<FileReader>) {
      const base64String = e.target?.result; // 获取Base64编码字符串
      topicStore.update(
        Object.assign(props.dataSource, { image: base64String }),
        topicStore.getActive()
      );
    };
    // 将文件读取为DataURL（Base64编码）
    reader.readAsDataURL(file.raw);
  } else {
    console.error("The provided file is not a valid File object.");
  }
  return false; // 阻止默认上传行为
};

const onRequest = () => Promise.resolve(false);

const onShowCropper = () => {
  cropperVisible.value = true;
};
const onDone = (value?: Blob | string) => {
  topicStore.update(Object.assign(props.dataSource, { image: value }), topicStore.getActive());
};

const onShowInfo = ()=> {
  copyrightVisible.value = true;
}
const onAiPictureOpen = () => {
  aiPicModalVisible.value = true;
};
const onAiPictureChange = (url: string) => {
  topicStore.update(Object.assign(props.dataSource, { image: url }), topicStore.getActive());
};
const onShowThumbtack = () => (editorVisible.value = true);

const onThumbtackEditorDone = (data: JSON | any) => {
  if (fabricCanvas && resultCanvas.value) {
    fabricCanvas.loadFromJSON(JSON.stringify(data), () => {
      setTimeout(() => {
        fabricCanvas!!.renderAll();
      }, 200);
    });
    if (data && data!!.objects && data!!.objects.length > 0) {
      topicStore.update(
        Object.assign(props.dataSource, { dataJSON: data }),
        topicStore.getActive()
      );

    } else {
      topicStore.update(
        Object.assign(props.dataSource, { dataJSON: null }),
        topicStore.getActive()
      );
    }
    return;
  } else if (resultCanvas.value && !fabricCanvas) {
    const canvasWidth = resultCanvas.value.getBoundingClientRect().width;
    const canvasHeight = resultCanvas.value.getBoundingClientRect().height;

    fabricCanvas = new Canvas(resultCanvas.value, {
      width: canvasWidth,
      height: canvasHeight,
      selection: true // 禁用 Fabric.js 默认的多选
    });
  }
  setTimeout(() => {
    onThumbtackEditorDone(data);
  }, 500);
};
const onQuestionChange = (event: string) => {
  topicStore.update(Object.assign(props.dataSource, { question: event }), topicStore.getActive());
};
watch(props, () => {
  initData();
});

const initData = () => {
  inputValue.value = props.dataSource.question;
};
const getContainerWidth = computed(() => {
  if (resultCanvas.value) {
    const width = resultCanvas.value.getBoundingClientRect().width;
    if (width) {
      return width;
    }
  }
  return 389.5 * 1.4 * 1.3;
});
const getContainerHieght = computed(() => {
  if (resultCanvas.value) {
    const height = resultCanvas.value.getBoundingClientRect().height;
    if (height) {
      return height;
    }
  }
  return 259.86 * 1.4 * 1.3;
});
</script>

<style scoped lang="scss">
@import "@/theme.scss";

.thumbtack-answer-wrapper {
  height: $question-generation-main-height;
  background-color: transparent;
  position: relative;
  box-sizing: border-box;
  padding: 5%;
  :deep(.canvas-container) {
    position: absolute !important;
    top: 0;
    z-index: 1;
    pointer-events: none;
  }
}

.thumbtack-answer-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.thumbtack-answer-content-left {
  position: absolute;
  text-align: right;
  top: calc(50% - 28px);
  left: 8%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid #e1e1e1;
  font-size: 10px;
  color: #cccccc;
}

.thumbtack-answer-content-input {
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  border-radius: 5px;
  overflow: hidden;

  .no-border {
    color: #333;
    display: block;
    font-weight: 600;
    width: 100%;

    :deep(.el-textarea__inner) {
      font-size: 30px;
    }
  }
}

.thumbtack-answer-content-right {
  flex: 3;
  display: flex;
  flex-flow: column nowrap;
  height: calc($question-generation-aside-preview-item-height * 0.5);
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
}

.thumbtack-answer-content-img {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 60px;
  overflow: clip;
  width: calc($question-generation-main-picture-preview-width * 1.3);
  //min-height: calc($question-generation-main-picture-preview-height * 1.3);
  :deep(.el-upload-dragger) {
    min-height: 405px;
  }
}

.img {
  width: calc($question-generation-main-picture-preview-width * 1.3);
  height: calc($question-generation-main-picture-preview-height * 1.3);
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
}
.img-canvas {
  background-color: transparent;
  position: absolute;
  left: 0;
  top: 0;
  backdrop-filter: none;
  pointer-events: none;
  box-sizing: border-box;
}
.thumbtack-answer-content-footer {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  background-color: #f1f1f1;
  color: #333;
  min-width: 500px;
  margin: 30px auto;
  border-radius: 10px;
  overflow: hidden;
  max-width: 660px;
}

.thumbtack-answer-content-footer-item {
  height: 100px;
  display: flex;
  align-items: center;
  width: 48%;
  margin: 14px 1%;
  box-sizing: border-box;
  padding: 0 50px;
  position: relative;
  transition: background-color 0.3s linear;
}

.footer-item-bg0 {
  background-color: #e21b3c;
}

.footer-item-bg1 {
  background-color: rgb(19, 104, 206);
}

.footer-item-bg2 {
  background-color: rgb(216, 158, 0);
}

.footer-item-bg3 {
  background-color: rgb(38, 137, 12);
}

.footer-item-bg4 {
  background-color: rgb(10, 163, 163);
}

.footer-item-bg5 {
  background-color: rgb(134, 76, 191);
}

.img-none {
  font-size: 26px;
  color: #d2d2d2;
  padding: 4px 7px 0 7px;
  border: 1px dashed #c5c5c5;
}

.is-icon-plus {
  font-size: 30px;
  color: #333;
  width: 80px;
  height: 80px;
  background-color: #fff;
  box-sizing: border-box;
  transition: all 0.2s linear;
  margin-top: 80px;

  &:hover {
    background-color: #e3e3e3;
  }
}

.upload-picture {
  background-color: rgba(255, 255, 255, 0.3);
  width: 100%;

  backdrop-filter: blur(4px);
  border: 0;
  outline: none;

  p {
    color: #333 !important;
  }
}

.el-upload__text {
  margin-top: 60px;
  font-size: smaller;
}

.thumbtack-answer-content-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row nowrap;
  position: absolute;
  right: 0;
  height: 30px;
  bottom: 10px;
  left: 20px;
  .thumbtack-answer-content-tools--right {
    .tools-btn {
      width: 30px;
      color: #2f2f2f;
      margin-right: 5px;
      cursor: pointer;
      &:hover {
        background-color: #eaeaea;
      }
    }
  }

  .tools-btn-area {
    cursor: pointer;
    color: #2f2f2f;
    position: relative;
    background-color: #fff;
    .tips {
      position: absolute;
      transform: translate(-28px, -30px);
      z-index: 1;
      background-color: rgb(70, 23, 143);
      color: #fff;
    }
  }
}

.thumbtack-answer-content-uploaded {
  position: relative;
}

.option-item {
  display: block;
  font-size: 18px;
  font-weight: 600;
  width: 100%;

  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 0 var(--el-input-border-color, var(--el-border-color)) inset;
    resize: none;
    caret-color: #151515;
  }
}

.item-icon-wrapper {
  position: absolute;
  left: 0;
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;

  .item-icon {
    width: 30px;
    height: 30px;
  }
}

.item-select-wrapper {
  position: absolute;
  right: 0;
  width: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;

  img {
    width: 45px;
    height: 45px;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
  }

  img[alt="not_selected"]:hover {
    transform: scale(1.1);
  }

  img[alt="pre_selected"] {
    width: 30px;
    height: 30px;
    cursor: auto;
  }
}

.thumbtack-answer-item-button {
  position: relative;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 30px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

.circle-cropper .cropper-crop-box .cropper-face {
  background: rgba(255, 255, 255, 0.5); /* 半透明背景色 */
}

.span__label {
  font-size: 22px;
}
</style>
