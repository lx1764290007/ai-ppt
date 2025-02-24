<template>
  <popup-component v-model:modal-value="modalVisible">
    <div class="modal-wrapper">
      <div class="subject-editor__header">
        <span class="subject-editor__header--title">
          分类{{data?.id? '编辑':'添加'}}
        </span>
        <el-icon class="subject-editor__close" @click="onClose">
          <Close />
        </el-icon>
      </div>
      <div style="position: relative;padding: 15px 0;box-sizing: border-box;transform: translateY(-40px)">
        <el-image class="img" :src="imageUrl" fit="contain" mode="aspectFill"></el-image>
        <el-icon class="file-refresh" v-show="showImageRefresh">
          <Refresh />
        </el-icon>
        <input type="file" class="file-upload"
               title="更换图片"
               accept=".jpg, .jpeg, .png, .webp, .bmp, .svg"
               @mouseenter="showImageRefresh = true"
               @mouseleave="showImageRefresh = false"
               @change="onFileChange" />
      </div>
      <div class="right-side" style="padding-left: 10px;transform: translateY(-40px)">
        <p class="sub--title">分类名称</p>
        <el-input
          v-model="suject"
          placeholder="输入分类名称"
          class="input__default_theme"
          size="large"
        />


      </div>
      <div class="footer-buttons">
        <el-button class="buttons-primary"
                   size="large"
                   @click="onSubmit">确定</el-button>
        <el-button class="buttons-default"
                   size="large"
                   style="width: 150px"
                   @click="()=> onClose()">取消</el-button>
      </div>
    </div>
  </popup-component>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { Close, Refresh } from "@element-plus/icons-vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { fetchTopicAdd, fetchTopicUpdate } from "@/http/topic";
import type { TopicType } from "@/interface/TopicOverview";
import { useUserInfoStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import type { Http } from "@/interface/Http";


const props = defineProps<{
  visible: boolean;
  data?: TopicType
}>();
const emit = defineEmits<{
  (event: "close", value?: boolean): void
}>();
const modalVisible = ref(props.visible);

const userInfoStore = useUserInfoStore();

// const defaultSuject = "新建题库";
const suject = ref("");
const defaultImage = new URL("@/assets/logo@2x.png", import.meta.url).href;

const showImageRefresh = ref(false);
const imageUrl = ref(defaultImage);
let file: undefined | File;

const onFileChange = (f: any) => {
  file = f.target.files[0] as File;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    imageUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const onSubmit = () => {
  if (suject.value.trim() && suject.value.length > 0) {
    const formData = new FormData();
    formData.append("typeName", suject.value);
    formData.append("userId", String(userInfoStore?.userInfo?.user?.id));
    file && formData.append("typeImg", file);
    props.data?.id && formData.append("subjectId", String(props.data?.id));
    props.data?.id ? fetchTopicUpdate(formData).then((res: Http.Response<any>) => {
      res.code === 200 && emit("close", true);
      }) :
      fetchTopicAdd(formData).then((res: Http.Response<any>) => {
        res.code === 200 && emit("close", true);
      });
  } else ElMessage.error("输入不合法");
};

const onClose = () => {
  emit("close");
};
watch(() => props.visible, (newValue) => {
  modalVisible.value = newValue;
});

watch(() => props.data, (newValue) => {
  if (newValue) {
    suject.value = newValue.subjectName;
    imageUrl.value = newValue.subjectImg;
  } else {
    suject.value = "";
    imageUrl.value = defaultImage;
    file = undefined;
  }
});
</script>
<style scoped lang="scss">
@import "@/theme";

$img-width: 184px;
.topic-setting-wrapper {
  position: relative;
  background: #f0f3f6;
  width: 240px;

  :deep(.el-input__inner) {
    padding-right: 44px;
  }

  .setting-button {
    position: absolute;
    right: 3px;
    top: 2px;
    background-color: #fff;
    color: #696969;
    font-size: 14px;
    padding: 8px 10px;
    border-radius: 3px;
    cursor: pointer;
  }
}

.modal-wrapper {
  display: flex;
  justify-content: space-around;
  flex-flow: row nowrap;
  align-items: center;
  padding: 0 30px;
  background-color: #fff;
  border-radius: 5px;
  height: 340px;

  .footer-buttons {
    position: absolute;
    bottom: 30px;
  }

  .subject-editor__header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    padding: 10px 20px;
    display: flex;
    justify-content: space-between;
    font-size: 24px;

    .subject-editor__header--title {
      font-size: 18px;
      font-weight: bold;
    }

    .subject-editor__close {
      font-size: 24px;
      color: #525252;
      cursor: pointer;

      &:hover {
        color: #575757;
      }
    }

  }

  .img {
    width: $img-width;
    height: calc($img-width / 4 * 3);
    border: 1px solid #ccc;
    margin-top: 30px;

  }

  .sub--title {
    margin-block-start: 20px;
    margin-block-end: 10px;
    font-weight: 600;
    font-size: 15px;
  }
}

.buttons-primary:focus {
  background-color: #630cc7;
}

.topic-label {
  color: #333;

  &:hover {
    color: $main-confirm-bg-color;
  }
}

.label-active {
  color: $main-confirm-bg-color;
}

.file-refresh {
  font-size: 24px;
  color: #fff;
  position: absolute;
  right: 1px;
  bottom: 21px;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: none;
  width: $img-width;
  height: calc($img-width / 4 * 3);

}

.file-upload {
  position: absolute;
  width: $img-width;
  height: calc($img-width / 4 * 3);
  right: 1px;
  bottom: 21px;
  overflow: hidden;
  opacity: 0;
  cursor: pointer;
}
</style>
