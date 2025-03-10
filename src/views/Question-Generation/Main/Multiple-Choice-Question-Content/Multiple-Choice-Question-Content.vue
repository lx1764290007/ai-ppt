<template>
  <div :class="{ 'multiple-choice-question-wrapper': true, topic__preview: preview }">
    <div class="multiple-choice-question-content">
      <div class="multiple-choice-question-content-input">
        <el-input
          type="textarea"
          size="large"
          show-word-limit
          :maxlength="REMAINING_MAX"
          autosize
          :placeholder="$t('questionEdit.question')"
          class="no-border"
          resize="none"
          style="text-align: center"
          @input="onQuestionChange"
          v-model="inputValue"
        />
      </div>
    </div>
    <div class="new-content">
      <div class="multiple-choice-question-content-img">
        <loading-component :show="imageLoading" />
        <el-upload
          class="upload-picture"
          drag
          accept=".jpg, .jpeg, .png, .webp, .bmp, .svg"
          v-if="!dataSource.images?.[0]?.image && !preview"
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
          <p style="color: #fff!important;">{{ $t("questionEdit.findImage") }}</p>
          <div class="el-upload__text" style="color: #fff">{{ $t("questionEdit.drag") }} {{ $t("questionEdit.or") }}<em>
            {{ $t("questionEdit.click") }} </em>{{ $t("questionEdit.picture") }}
          </div>
        </el-upload>
        <div class="multiple-choice-question-content-uploaded" v-else>
          <el-image
            class="img"
            :src="preview? dataSource.images?.[imgIndex]?.image: tempUrl || dataSource.images?.[0]?.image"
            type="image/png"
            v-loading="!dataSource.images?.[0]?.image && preview"
            fit="contain"
            alt="preview"

            @error="()=> onloadError()"
          >
            <template #error>
              <div style="margin-top: 240px;text-align: center;color:#c9c9c9;font-size: smaller">
                {{ preview ? $t("questionEdit.loading") : "FAILED" }}
              </div>
            </template>
          </el-image>
          <div class="multiple-choice-question-content-tools" v-if="!preview">
            <img src="@/assets/crop.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onShowCropper" />
            <img src="@/assets/info.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onShowInfo" />
            <img src="@/assets/remove.png" alt="crop" crossorigin="anonymous" class="tools-btn"
                 @click.stop="onDeletePicture" />
          </div>
        </div>
      </div>
      <div class="multiple-choice-question-content-footer">
        <div
          :class="['multiple-choice-question-content-footer-item', 'footer-item-bg' + index]"
          :style="getStyle(item)"
          v-for="(item, index) of dataSource.options"
          :key="index"
        >
        <span :class="['item-icon-wrapper', 'footer-item-bg' + index]">
          <img :src="getIconUrl(index)" alt="icon" class="item-icon" />
        </span>
          <span class="item-select-wrapper">
          <img
            src="@/assets/demo/not_selected.svg"
            @click="onSelect(item)"
            alt="not_selected"
            v-if="!dataSource.answer?.includes(item)"
          />
          <img
            src="@/assets/demo/selected.svg"
            alt="selected"
            @click="onSelect(item)"
            v-else-if="dataSource.answer?.includes(item)"
          />
          <img src="@/assets/demo/pre_selected.svg" alt="pre_selected" v-else-if="!item" />
        </span>
          <el-input
            type="textarea"
            size="large"
            :show-word-limit="item.length > 50"
            :maxlength="OPTIONS_REMAINING_MAX"
            :placeholder="`${$t('questionEdit.addQuestion')}${index > 1 ? $t('questionEdit.optional') : $t('questionEdit.input')}`"
            resize="none"
            :autosize="{ minRows: 1, maxRows: 3 }"
            :model-value="item"
            class="option-item"
            @input="onOptionInput(index, $event)"
            style="text-align: center"
          />
        </div>
        <div class="multiple-choice-question-item-button" @click.stop="onPowerClick"
             v-if="!preview && dataSource.options && dataSource.options.length !== 4">
          {{ dataSource.options && dataSource.options.length > 4 ? $t("questionEdit.remove") : $t("questionEdit.add")
          }}{{ $t("questionEdit.optionalAnswer") }}
        </div>
      </div>
    </div>
  </div>

  <VCropper v-model:visible="cropperVisible" :picture-url="dataSource.images?.[0]?.image" @done="onDone" />
  <v-picture v-model:visible="aiPicModalVisible" @change="onAiPictureChange" :keywords="dataSource.image_keywords" />
  <copyright-popup v-model="copyrightVisible" @done="onCopyrightDone"
                   :data="{origin:dataSource.displayLink||dataSource.images?.[0]?.title, copyright: dataSource.copyRight}"></copyright-popup>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import VCropper from "@/components/Cropper/V-Cropper.vue";
import VPicture from "@/components/Ai-Picture/V-Picture.vue";
import type { QuestionItem } from "@/interface/Topic";
import { useTopicStore } from "@/libs/usePinia";
import CopyrightPopup from "@vs/Question-Generation/Copyright/Copyright-Popup.vue";
import { useQuestionType } from "@/libs/useQuestionType";
import { fetchDownloadRemotePhoto, fetchFileUpload } from "@/http/question";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const tempUrl = ref("");
const REMAINING_MAX = 120,
  OPTIONS_REMAINING_MAX = 75;
const DEFAULT_ERROR_IMAGE = "https://dreamlab.oss-us-east-1.aliyuncs.com/nopic.png";
const MAX_RETRY_TOTAL = 3;
let current_retry_total = 1;
const TYPE = useQuestionType();
const topicStore = useTopicStore();
const imageLoading = ref(false);
const imgIndex = ref(0);
const ICONS = [
  new URL("@/assets/demo/triangle.svg", import.meta.url).href,
  new URL("@/assets/demo/circle.svg", import.meta.url).href,
  new URL("@/assets/demo/polygon.svg", import.meta.url).href,
  new URL("@/assets/demo/square.svg", import.meta.url).href,
  new URL("@/assets/demo/prismatic.svg", import.meta.url).href,
  new URL("@/assets/demo/cylinder.svg", import.meta.url).href,
  new URL("@/assets/demo/triangle.svg", import.meta.url).href,
  new URL("@/assets/demo/circle.svg", import.meta.url).href,
  new URL("@/assets/demo/polygon.svg", import.meta.url).href,
  new URL("@/assets/demo/square.svg", import.meta.url).href,
  new URL("@/assets/demo/prismatic.svg", import.meta.url).href,
  new URL("@/assets/demo/cylinder.svg", import.meta.url).href
];

const props = withDefaults(defineProps<{
  dataSource: QuestionItem;
  preview?: boolean;
}>(), {
  dataSource(props) {
    return props.dataSource || [];
  }
});
const emit = defineEmits<{
  (ev: "loadImage", value: string): void;
}>();
const inputValue = ref<string>(props.dataSource.question);

//const options = ref<{ id: number, label: string }[]>([{ id: 1, label: "",  }, { id: 2, label: "" },{ id: 3, label: "",  }, { id: 4, label: "" }]);

const aiPicModalVisible = ref(false);
const copyrightVisible = ref(false);
//删除图片
const onDeletePicture = () => {
  topicStore.update(Object.assign({}, props.dataSource, { images: [{ image: "" }] }), topicStore.getActive());
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
const cropperVisible = ref(false);
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
const beforeUpload = (file: any) => {
  // 检查 file 是否是一个有效的 File 对象
  if (file.raw instanceof File) {
    const formData = new FormData();
    formData.append("file", file.raw);
    imageLoading.value = true;
    const ACTIVE_INDEX = topicStore.getActive();
    fetchFileUpload(formData).then((res: Http.Response<string>) => {
      if (res?.code === 200) {
        topicStore.update(Object.assign({}, props.dataSource, { images: [{ image: res.data }] }), ACTIVE_INDEX);
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
const getIconUrl = (index: number) => {
  return ICONS[index];
};

const onSelect = (id: string) => {
  if (!id) return;
  if (props.dataSource.type === TYPE.SINGLE_CHOICE) {
    topicStore.update(Object.assign({}, props.dataSource, { answer: [id] }), topicStore.getActive());
  } else {
    const answer = props.dataSource?.answer || [];
    if (answer.includes(id)) {
      answer.splice(answer.indexOf(id), 1);
    } else {
      answer.push(id);
    }
    topicStore.update(Object.assign(props.dataSource, { answers: answer }), topicStore.getActive());
  }

};
const onShowInfo = () => {
  copyrightVisible.value = true;
};
const onRequest = () => Promise.resolve(false);

const onPowerClick = () => {

  let _options = topicStore.getActiveItem()?.options;

  if (_options) {
    if (_options.length > 3) {
      _options.splice(_options.length - 2, 2);
    } else {
      _options = [..._options, "", ""];
    }
  }
  topicStore.update(Object.assign(props.dataSource, { options: _options }), topicStore.getActive());
};
const onShowCropper = () => {
  cropperVisible.value = true;
};
const onDone = (value?: string) => {
  topicStore.update(Object.assign(props.dataSource, { images: [{ image: value }] }), topicStore.getActive());
};
const onAiPictureOpen = () => {
  aiPicModalVisible.value = true;
};
const onAiPictureChange = (url: { image: string, title: string }) => {
  topicStore.update(Object.assign({}, props.dataSource, {
    images: [{ image: url.image }],
    displayLink: url.title
  }), topicStore.getActive());

};

watch(() => props.dataSource, (cb) => {
  initData();

});

const initData = () => {
  inputValue.value = props.dataSource.question;
};
const onQuestionChange = (event: string) => {
  topicStore.update(Object.assign({}, props.dataSource, { question: event }), topicStore.getActive());
};
const onOptionInput = (index: number, event: string) => {
  const _options = props.dataSource.options;
  if (_options && _options?.[index] !== undefined) {
    _options[index] = event;
    if (!event) {
      // 如果选项输入无效值，即使选项被选中也会被重置
      const newAnswer = props.dataSource.answer?.filter((it) => it !== _options[index]);
      topicStore.update(
        Object.assign({}, props.dataSource, { options: _options, answers: newAnswer }),
        topicStore.getActive()
      );
      return;
    }
    topicStore.update(
      Object.assign({}, props.dataSource, { options: _options }),
      topicStore.getActive()
    );
  }
};

onMounted(initData);
</script>

<style scoped lang="scss">
@import "@/theme.scss";

.multiple-choice-question-wrapper {
  height: $question-generation-main-height;
  background-color: transparent;
  position: relative;
  box-sizing: border-box;
  padding: 5%;
}

.multiple-choice-question-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}

.multiple-choice-question-content-left {
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

.multiple-choice-question-content-input {
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

.multiple-choice-question-content-right {
  flex: 3;
  display: flex;
  flex-flow: column nowrap;
  height: calc($question-generation-aside-preview-item-height * 0.5);
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
}

.multiple-choice-question-content-img {
  display: flex;
  justify-content: space-around;
  align-items: center;

  overflow: clip;
  position: relative;
  flex: 1;
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

.multiple-choice-question-content-footer {
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin-top: 12px;
  flex: 1
}

.multiple-choice-question-content-footer-item {
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

.footer-item-bg6 {
  background-color: rgb(19, 206, 63);
}

.footer-item-bg7 {
  background-color: rgb(32, 173, 123);
}

.footer-item-bg8 {
  background-color: rgb(203, 29, 222);
}

.footer-item-bg9 {
  background-color: rgb(222, 42, 0);
}

.footer-item-bg10 {
  background-color: rgb(189, 24, 201);
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

.multiple-choice-question-content-tools {
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

.multiple-choice-question-content-uploaded {
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

.multiple-choice-question-item-button {
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
.new-content {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  height: 80%;
  margin-top: 5%;
  gap: 10px;
}
</style>
