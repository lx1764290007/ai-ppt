<template>
  <popup-component v-model:modal-value="show">
    <div class="subject-editor-container">
      <div class="subject-editor__header">
        <span class="subject-editor__header--title">
          {{data?.id? "":$t("subject.add")}}{{ $t("subject.questionBank") }}{{ data?.id ? $t("subject.edit") : "" }}
        </span>
        <el-icon class="subject-editor__close" @click="()=>onClose()">
          <Close />
        </el-icon>
      </div>
      <div class="subject-editor__content">
        <div class="left-side-container" v-loading="imageLoading">
        <el-icon size="24" class="subject-refresh" v-show="showRefresh && url">
          <Refresh />
        </el-icon>

        <input class="subject-file__select"
               accept=".jpg, .jpeg, .png, .webp, .bmp, .svg"
               @mouseenter="showRefresh = true"
               @mouseleave="showRefresh = false"
               @change="onFileChange($event as InputEvent)"
               type="file" />
        <el-image class="subject-editor__preview"
                  v-if="url"
                  fit="cover"
                  :src="url" />
        <el-icon class="img-add" v-if="!url">
          <Plus />
        </el-icon>
        </div>
        <div class="subject-editor__content--right">
          <el-input class="input__default_theme subject-input" :placeholder="$t('home.inputName')" size="large"
                    v-model="inputValue" />
          <div class="subject-editor__footer">
            <el-button class="buttons-primary"
                       size="large"
                       @click.stop="onSubmit"
                       :loading="loading || imageLoading">
              {{ $t("subject.confirm") }}
            </el-button>
            <el-button class="buttons-default"
                       size="large"
                       @click.stop="()=>onClose()"
                       style="width: 150px;margin-left: 0;margin-top: 10px">
              {{ $t("subject.cancel") }}
            </el-button>

          </div>
        </div>
      </div>
    </div>
    <loading-component :show="loading" />
  </popup-component>
</template>
<script setup lang="ts">
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { ref, watch } from "vue";
import { Close, Plus, Refresh } from "@element-plus/icons-vue";
import type { TopicType } from "@/interface/TopicOverview";

import { fetchTopicTypeAdd, fetchTopicTypeUpdate } from "@/http/topic";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { fetchFileUpload } from "@/http/question";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";


const props = defineProps<{
  visible: boolean
  data?: TopicType
  subjectId?: any
}>();
const emit = defineEmits<{
  (event: "close", value?: boolean, data?:TopicType): void
}>();
const {t} = useI18n();
const showRefresh = ref<boolean>(false);
const imageLoading = ref(false);
const show = ref(props.visible || false);
const url = ref<string>();
const loading = ref(false);
const userInfoStore = useUserInfo();
const inputValue = ref<string>();
let file: File | undefined = undefined;
const onFileChange = (event: InputEvent) => {
  file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    onUpload(file);
  }
};


const onUpload = async (file: File) => {
  if (file instanceof File) {
    const formData = new FormData();
    formData.append("file", file);
    imageLoading.value = true;
    fetchFileUpload(formData).then((res:Http.Response<string>) => {
      if(res?.code === 200){
        url.value = res.data;
      }
    }).finally(()=> imageLoading.value = false).catch((e:any)=> {
      ElMessage({
        message: e?.msg || t(e),
        icon: "InfoFilled", // 自定义图标
        type: "info",
        duration: 3000,
        offset: 50
      });
    })
  }
}
const onClose = () => {
  emit("close");
};
const onSubmit = async () => {
  if(imageLoading.value) return
  if (inputValue.value?.trim()) {
    loading.value = true;

    const formData = {
      typeImg: url.value,
      subjectId: props.subjectId,
      typeName: inputValue.value,
      userId: userInfoStore?.getUserInfo?.user?.id,
      subjectTypeId: props.data?.id
    }
    props.data?.id ?
      fetchTopicTypeUpdate(formData).then((res: Http.Response<TopicType>) => {
        if (res.code === 200) {
          emit("close", false, res.data);
        }
      }).finally(() => loading.value = false) : fetchTopicTypeAdd(formData).then((res: Http.Response<TopicType>) => {
        if (res.code === 200) {
          emit("close", true, res.data);
        }
      }).finally(() => loading.value = false);
  }
};
watch(() => props.visible, newVal => {
  show.value = newVal;
  if (props.data) {
    inputValue.value = props.data.typeName;
    url.value = props.data.typeImg;
  } else {
    inputValue.value = "";
    url.value = "";
    file = undefined;
  }
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.subject-editor-container {
  width: 440px;
  height: 250px;
  background-color: #f1f1f1;
  border-radius: 5px;
  position: relative;
  --width: 200px;
  --height: 150px;

  .subject-editor__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px 0 10px;
    height: 50px;
    box-sizing: border-box;

    .subject-editor__header--title {
      font-size: 18px;
      font-weight: bold;
    }

    .subject-editor__close {
      font-size: 24px;
      z-index: 1;
      color: #606060;

      &:hover {
        cursor: pointer;
        color: #494949;
      }
    }
  }

  .subject-editor__content {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    align-items: center;
    padding: 0 15px;
    height: 180px;
    box-sizing: border-box;
    .left-side-container {
      width: var(--width);
      height: var(--height);
      position: relative;
    }
    .img-add {
      font-size: 40px;
    }
    .subject-refresh, .subject-file__select, .img-add {
      position: absolute;
      z-index: 4;
      width: var(--width);
      height: var(--height);
      color: #ffffff;
      background-color: rgba(0, 0, 0, 0.3);
      cursor: pointer;
      pointer-events: none;
      border-radius: 10px;
    }

    .subject-file__select {
      opacity: 0;
      z-index: 1;
      pointer-events: auto;
    }

    .subject-editor__content--right {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: space-between;
      height: 150px;

      .subject-editor__footer {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
      }
    }

    .subject-editor__preview {
      width: var(--width);
      height: var(--height);
      border-radius: 10px;
      position: relative;
      z-index: 3;
      pointer-events: none;
      box-sizing: border-box;
      border: 1px solid #c9c9c9;
    }

    .subject-input {
      width: 150px;
      margin-top: 0;
    }
  }
}
</style>