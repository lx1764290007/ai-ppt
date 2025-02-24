<template>
  <div :class="{ 'fill-in-the-blanks-wrapper': true, topic__preview: preview }">
    <div class="fill-in-the-blanks-content">
      <div class="fill-in-the-blanks-content-input">
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
      <div class="fill-in-the-blanks-content-img">
        <el-upload
          class="upload-picture"
          drag
          v-if="!dataSource?.images?.[0]?.image"
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
          <p>查找和插入媒体</p>
          <div class="el-upload__text">拖拽图片到这里 或<em> 点击上传 </em>图片</div>
        </el-upload>
        <div class="fill-in-the-blanks-content-uploaded" v-else>
          <el-image
            class="img"
            :src="dataSource?.images?.[0]?.image"
            type="image/png"
            fit="contain"
            alt="preview"
            crossorigin="anonymous"
          />
          <div class="fill-in-the-blanks-content-tools">
            <img src="@/assets/crop.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="裁剪" @click.stop="onShowCropper" />
            <img src="@/assets/info.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="版权信息" @click.stop="onShowInfo" />
            <img src="@/assets/remove.png" alt="crop" crossorigin="anonymous" class="tools-btn" title="删除" @click.stop="onDeletePicture" />
          </div>
        </div>
      </div>
    </div>
    <div class="fill-in-the-blanks-content-footer">
      <div
        :class="['fill-in-the-blanks-content-footer-item', 'footer-item-bg' + index]"
        :style="getStyle(item)"
        v-for="(item, index) of dataSource.options"
        :key="index"
      >
        <span :class="['item-icon-wrapper', 'footer-item-bg' + index]">
          <img :src="getIconUrl(index)" alt="icon" class="item-icon" />
        </span>
        <el-input
          type="textarea"
          size="large"
          :show-word-limit="item?.length > 50"
          :maxlength="OPTIONS_REMAINING_MAX"
          :placeholder="`添加答案${index > 1 ? '(可选)' : ''}`"
          resize="none"
          ref="inputRefs"
          :autosize="{ minRows: 1, maxRows: 1 }"
          :model-value="item"
          class="option-item"
          @input="onOptionInput(index, $event)"
          style="text-align: center"
        />
      </div>
      <div class="fill-in-the-blanks-item-button">其它可接受的答案</div>
    </div>
  </div>
  <VCropper v-model:visible="cropperVisible" :picture-url="dataSource?.images?.[0]?.image" @done="onDone" />
  <v-picture v-model:visible="aiPicModalVisible" @change="onAiPictureChange" />
  <copyright-popup v-model="copyrightVisible"></copyright-popup>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import {  Plus } from "@element-plus/icons-vue";
import VCropper from "@/components/Cropper/V-Cropper.vue";
import VPicture from "@/components/Ai-Picture/V-Picture.vue";
import type { QuestionItem } from "@/interface/Topic";
import { useTopicStore } from "@/libs/usePinia";
import CopyrightPopup from "@vs/Question-Generation/Copyright/Copyright-Popup.vue";
import { ElInput } from "element-plus";


const REMAINING_MAX = 120,
  OPTIONS_REMAINING_MAX = 75;
const topicStore = useTopicStore();

const props = defineProps<{
  dataSource: QuestionItem;
  preview?: boolean;
}>();
const ICONS = [
  new URL("@/assets/demo/triangle.svg", import.meta.url).href,
  new URL("@/assets/demo/circle.svg", import.meta.url).href,
  new URL("@/assets/demo/polygon.svg", import.meta.url).href,
  new URL("@/assets/demo/square.svg", import.meta.url).href,
  new URL("@/assets/demo/prismatic.svg", import.meta.url).href,
  new URL("@/assets/demo/cylinder.svg", import.meta.url).href
];

const inputValue = ref<string>(props.dataSource.question);
//const pictureUrl = ref<string>("https://cdn.pixabay.com/photo/2024/08/11/18/15/leaves-8962041_640.jpg");
const inputRefs = ref<(typeof ElInput)[]>([]);
const aiPicModalVisible = ref(false);
const onDeletePicture = () => {
  topicStore.update(Object.assign(props.dataSource, { image: "" }), topicStore.getActive());
};
const cropperVisible = ref(false);
const copyrightVisible = ref(false);

const getStyle = (value: string) => {
  if (!value) {
    return {
      "background-color": "#fff"
    };
  }
  return {
    color: "#fff"
  };
};
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
const getIconUrl = (index: number) => {
  return ICONS[index];
};
const onShowInfo = ()=> {
  copyrightVisible.value = true;
}
const onRequest = () => Promise.resolve(false);

const onShowCropper = () => {
  cropperVisible.value = true;
};
const onDone = (value?: Blob | string) => {
  topicStore.update(Object.assign(props.dataSource, { image: value }), topicStore.getActive());
};

const onAiPictureOpen = () => {
  aiPicModalVisible.value = true;
};
const onAiPictureChange = (url: string) => {
  topicStore.update(Object.assign(props.dataSource, { image: url }), topicStore.getActive());
};
const onQuestionChange = (event: string) => {
  topicStore.update(Object.assign(props.dataSource, { question: event }), topicStore.getActive());
};
const onOptionInput = (index: number, event: string) => {
  const _options = topicStore.getActiveItem()?.options;
  if (_options && _options?.[index]) {
    _options[index] = event;
    topicStore.update(
      Object.assign({}, props.dataSource, { options: _options }),
      topicStore.getActive()
    );

  }
};
watch(props, () => {
  initData();
});

const initData = () => {
  inputValue.value = props.dataSource.question;
};
</script>

<style scoped lang="scss">
@import "@/theme.scss";

.fill-in-the-blanks-wrapper {
  height: $question-generation-main-height;
  background-color: transparent;
  position: relative;
  box-sizing: border-box;
  padding: 5% 2% 1% 2%;
}

.fill-in-the-blanks-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.fill-in-the-blanks-content-left {
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

.fill-in-the-blanks-content-input {
  background-color: #fff;
  width: 93.7%;
  box-sizing: border-box;
  position: relative;
  border-radius: 5px;
  overflow: hidden;

  .no-border {
    color: #333;
    display: block;
    font-weight: 600;

    :deep(.el-textarea__inner) {
      font-size: 30px;
    }
  }
}

.fill-in-the-blanks-content-right {
  flex: 3;
  display: flex;
  flex-flow: column nowrap;
  height: calc($question-generation-aside-preview-item-height * 0.5);
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
}

.fill-in-the-blanks-content-img {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 60px;
  overflow: clip;
  width: $question-generation-main-picture-preview-width;
  min-height: $question-generation-main-picture-preview-height;
  :deep(.el-upload-dragger) {
    min-height: 310px;
  }
}

.img {
  width: $question-generation-main-picture-preview-width;
  height: $question-generation-main-picture-preview-height;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
}

.fill-in-the-blanks-content-footer {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin-top: 12px;
}

.fill-in-the-blanks-content-footer-item {
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

.fill-in-the-blanks-content-footer-item:first-of-type {
  width: 41.5%;
  margin: 14px 20%;
  position: relative;
}

.fill-in-the-blanks-content-footer-item:not(:first-of-type) {
  width: 31%;
  margin: 60px 1% 20px 1%;
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
  margin-top: 30px;
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
  margin-top: 40px;
  font-size: smaller;
}

.fill-in-the-blanks-content-tools {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-flow: row nowrap;
  position: absolute;
  right: 0;
  height: 30px;
  bottom: 10px;
  width: 110px;
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

.fill-in-the-blanks-content-uploaded {
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
    color: #fff;
    background-color: transparent;
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
.fill-in-the-blanks-item-button {
  position: absolute;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 5px;

  margin-bottom: 8px;
}
.circle-cropper .cropper-crop-box .cropper-face {
  background: rgba(255, 255, 255, 0.5); /* 半透明背景色 */
}
</style>
