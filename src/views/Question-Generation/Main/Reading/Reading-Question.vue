

<template>
  <div class="wrapper">
    <div :class="['content',dataSource.layout === READING_QUESTION_LAYOUT.HORIZONTAL? 'horizontal-line': 'horizontal-reverse']" >
      <div class="true-or-false-question-content-img">
        <loading-component :show="imageLoading" />
        <el-upload
          class="upload-picture"
          drag
          v-if="!dataSource.questionImg && !preview"
          action="#"
          accept=".jpg, .jpeg, .png, .webp, .bmp, .svg"
          :show-file-list="false"
          :auto-upload="false"
          :multiple="false"
          @http-request="onRequest"
          @change="beforeUpload"
        >
          <el-icon class="is-icon-plus" @click.stop="onAiPictureOpen">
            <Plus />
          </el-icon>
          <p style="color: #fff!important;">{{ $t("questionEdit.findImage") }}</p>
          <div class="el-upload__text" style="color: #fff">{{ $t("questionEdit.drag") }} {{ $t("questionEdit.or") }}<em>
            {{ $t("questionEdit.click") }} </em>{{ $t("questionEdit.picture") }}
          </div>
        </el-upload>
        <div class="true-or-false-question-content-uploaded" v-else>

          <el-image
            class="img"
            v-loading="!dataSource.questionImg && preview"
            :src="dataSource.questionImg"
            type="image/png"
            fit="contain"
            @error="()=> {onloadError()}"
            alt="preview"
          >
            <template #error>
              <div style="margin-top: 240px;text-align: center;color:#c9c9c9;font-size: smaller">
                {{ preview ? $t("questionEdit.loading") : "FAILED" }}
              </div>
            </template>
          </el-image>
          <div class="true-or-false-question-content-tools" v-if="!preview">
            <img src="@/assets/crop.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onShowCropper" />

            <img src="@/assets/info.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onShowInfo" />

            <img src="@/assets/remove.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onDeletePicture" />
          </div>
        </div>
      </div>
      <el-input type="textarea"
                class="textarea no-border"
                show-word-limit
                :maxlength="REMAINING_MAX"
                autosize
                :rows="10"
                :placeholder="$t('questionEdit.question')"
                resize="none"
                style="text-align: center"
                @input="onQuestionChange"
                v-model="inputValue"
                :model-value="dataSource.question" />
    </div>
  </div>
  <VCropper v-model:visible="cropperVisible" :picture-url="dataSource.images?.[0]?.image" @done="onDone" />
  <v-picture v-model:visible="aiPicModalVisible" @change="onAiPictureChange" :keywords="dataSource.image_keywords" />
  <copyright-popup
    v-model="copyrightVisible"
    @done="onCopyrightDone"
    :data="{origin:dataSource.displayLink, copyright: dataSource.copyRight}"></copyright-popup>
</template>
<script setup lang="ts">

import VCropper from "@/components/Cropper/V-Cropper.vue";
import VPicture from "@/components/Ai-Picture/V-Picture.vue";
import type { QuestionItem } from "@/interface/Topic";
import { useTopicStore } from "@/libs/usePinia";
import CopyrightPopup from "@vs/Question-Generation/Copyright/Copyright-Popup.vue";
import { fetchDownloadRemotePhoto, fetchFileUpload } from "@/http/question";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import { READING_QUESTION_LAYOUT } from "@/enum";
import { Plus } from "@element-plus/icons-vue";



const topicStore = useTopicStore();
const inputValue = ref<string>(props.dataSource.question);
const REMAINING_MAX = 10000;
const props = defineProps<{
  dataSource: QuestionItem;
  preview?: boolean;
}>();
const onQuestionChange = (event: string) => {
  topicStore.update(Object.assign({},props.dataSource, { question: event }), topicStore.getActive());
};


const MAX_RETRY_TOTAL = 3;
let current_retry_total = 1;

const tempUrl = ref("");
const imageLoading = ref(false);
const ICONS = [
  new URL("@/assets/demo/triangle.svg", import.meta.url).href,
  new URL("@/assets/demo/circle.svg", import.meta.url).href,
  new URL("@/assets/demo/polygon.svg", import.meta.url).href,
  new URL("@/assets/demo/square.svg", import.meta.url).href,
  new URL("@/assets/demo/prismatic.svg", import.meta.url).href,
  new URL("@/assets/demo/cylinder.svg", import.meta.url).href
];
const imgIndex = ref(0);

const emit = defineEmits<{
  (ev: "loadImage", value: string): void;
}>();


const aiPicModalVisible = ref(false);
const onShowInfo = () => {
  copyrightVisible.value = true;
};
const { t } = useI18n();

const onDeletePicture = () => {
  topicStore.update(Object.assign({}, props.dataSource, { questionImg:"" }), topicStore.getActive());
};
const cropperVisible = ref(false);
const copyrightVisible = ref(false);


const beforeUpload = (file: any) => {
  // 检查 file 是否是一个有效的 File 对象
  if (file.raw instanceof File) {
    const formData = new FormData();
    formData.append("file", file.raw);
    imageLoading.value = true;
    const ACTIVE_INDEX = topicStore.getActive();
    fetchFileUpload(formData).then((res: Http.Response<string>) => {
      if (res?.code === 200) {
        topicStore.update(Object.assign({}, props.dataSource, { questionImg: res.data  }), ACTIVE_INDEX);
      }
    }).finally(() => imageLoading.value = false).catch((e: any) => {
      ElMessage({
        message: e?.msg || t(e),
        icon: "InfoFilled", // 自定义图标
        type: "info",
        duration: 3000,
        offset: 50
      });
    });
  }
  return false; // 阻止默认上传行为
};
const onLoadImageSuccess = (event: string) => {
  emit("loadImage", event);
};
const onloadError = () => {
  if (current_retry_total > MAX_RETRY_TOTAL) return;
  if (!props.dataSource?.images[0]?.image) return;

  fetchDownloadRemotePhoto({
    imageUrl: props.dataSource?.images[0]?.image
  }).then((response: Http.Response<string>) => {
    if (response.code === 200) {
      onLoadImageSuccess(response.data);
      imgIndex.value = 0;
      current_retry_total = 0;
      if (!props.preview) {
        tempUrl.value = response.data;
      }
    }
  }).catch(() => current_retry_total += 1);
};
const getIconUrl = (index: number) => {
  return ICONS[index];
};


const onShowCropper = () => {
  cropperVisible.value = true;
};
const onDone = (value?: Blob | string) => {

  topicStore.update(Object.assign({}, props.dataSource, { images: [{ image: value }] }), topicStore.getActive());

};
const onAiPictureOpen = () => {
  if (props.dataSource?.image_keywords) {
    aiPicModalVisible.value = true;
  }

};
const onAiPictureChange = (url: { image: string, title: string }) => {
  topicStore.update(Object.assign({}, props.dataSource, {
    images: [{ image: url.image }],
    displayLink: url.title
  }), topicStore.getActive());
};

const onCopyrightDone = (data: any) => {

  topicStore.update(
    Object.assign(
      {},
      props.dataSource,
      {
        displayLink: data.origin,
        copyRight: data.copyright
      }),
    topicStore.getActive()
  );
  copyrightVisible.value = false;
};
watch(props, () => {
  initData();
});

const initData = () => {
  inputValue.value = props.dataSource.question;
};
</script>
<style scoped lang="scss">
@use "@/theme" as theme;

:deep(.el-textarea__inner) {
  min-height: 280px;
  max-height: calc(100vh - 60px - 40px);
}
.true-or-false-question-wrapper {
  height: theme.$question-generation-main-height;
  background-color: transparent;
  position: relative;
  box-sizing: border-box;
  padding: 5%;
}

.true-or-false-question-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.true-or-false-question-content-left {
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

.true-or-false-question-content-input {
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

.true-or-false-question-content-right {
  display: flex;
  justify-content: space-around;
  align-items: center;

  overflow: clip;
  position: relative;
  flex: 1;
  width: theme.$question-generation-main-picture-preview-width;
  min-height: theme.$question-generation-main-picture-preview-height;
}

.true-or-false-question-content-img {
  display: flex;
  justify-content: space-around;
  align-items: center;

  overflow: clip;
  position: relative;
  flex: 1;
  width: theme.$question-generation-main-picture-preview-width;
  min-height: theme.$question-generation-main-picture-preview-height;

  :deep(.el-upload-dragger) {
    min-height: 310px;
  }
}

.img {
  width: theme.$question-generation-main-picture-preview-width;
  height: theme.$question-generation-main-picture-preview-height;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(5px);
}

.true-or-false-question-content-footer {
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin-top: 12px;
  flex: 1
}

.true-or-false-question-content-footer-item {
  height: 100px;
  display: flex;
  align-items: center;
  width: 100%;
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
  flex: 2;
  min-width: 450px;
  p {
    color: #333 !important;
  }
}

.el-upload__text {
  margin-top: 40px;
  font-size: smaller;
}

.true-or-false-question-content-tools {
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

  }
}

.true-or-false-question-content-uploaded {
  position: relative;
}

.option-item {
  display: block;
  font-size: 20px;
  font-weight: 600;
  width: 100%;

  :deep(.el-textarea__inner) {
    box-shadow: 0 0 0 0 var(--el-input-border-color, var(--el-border-color)) inset;
    resize: none;
    caret-color: #151515;
    color: #fff;
    min-height: 200px;
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

.true-or-false-question-item-button {
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
.new-content {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  height: 80%;
  margin-top: 5%;
  gap: 10px;
}
.wrapper {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  height: calc(100vh - 60px);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  .no-border {
    color: #333;
    display: block;
    font-weight: 600;
    width: 100%;
    :deep(.el-textarea__inner) {
      font-size: 24px;
      border: none;
      box-shadow: none;
      text-indent: 2rem;
      display: block;
    }
  }
  .horizontal-line {
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }
  .horizontal-reverse {
    flex-flow: row-reverse nowrap;
    justify-content: space-between;
    align-items: center;
  }
  .vertical-line {
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
  }
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;

    gap: 20px;
    box-sizing: border-box;
    overflow: hidden;
    &:deep(.el-textarea__inner:focus){
      box-shadow: theme.$main-box-shadow-focus;
    }
    &:deep(.el-textarea__inner){
      text-align: justify;
      display: inline-block;
      height: 100%;
      color: #fff;
    }
    .image {
      position: relative;
      width: 100%;
      flex: 2;

    }
    .textarea {
      position: relative;

      font-size: 15px;
      flex: 2;

    }
  }
}
</style>