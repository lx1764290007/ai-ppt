<template>
  <popup-component v-model:modal-value="modalVisible">
    <div class="modal-wrapper">
      <div class="subject-editor__header">
        <span class="subject-editor__header--title">
          {{$t("world.update")}}
        </span>
        <el-icon class="subject-editor__close" @click="onClose">
          <Close />
        </el-icon>
      </div>
      <div style="position: relative;padding: 15px 0;box-sizing: border-box;transform: translateY(-20px)">
        <div class="left-side-container" v-loading="imageLoading">
          <el-image class="img" :src="imageUrl" fit="cover" mode="aspectFill" v-loading="imageLoading"
                    v-show="imageUrl"></el-image>
          <el-icon class="file-refresh" v-show="showImageRefresh && imageUrl">
            <Refresh />
          </el-icon>
          <input type="file" class="file-upload"
                 accept=".jpg, .jpeg, .png, .webp, .bmp, .svg"
                 @mouseenter="showImageRefresh = true"
                 @mouseleave="showImageRefresh = false"
                 @change="onFileChange" />
          <el-icon class="img-add" v-if="!imageUrl">
            <Plus />
          </el-icon>
        </div>
      </div>
      <div class="right-side" style="padding-left: 15px;transform: translateY(-40px)">
        <p class="sub--title">{{ $t("subject.name") }}</p>
        <el-input
          v-model="suject"
          :placeholder="$t('subject.input')"
          class="input__default_theme"
          size="large"
        />

        <p class="sub--title">
          {{ $t("subject.grade") }}
        </p>
        <el-select v-model="grade"
                   size="large"
                   placeholder=""
                   class="input__default_theme"
                   style="border-radius: 10px">
          <el-option
            v-for="item in gradeList"
            :key="item.id"
            :label="locale === 'en'? 'K' + item.label : item.label + $t('grade.grade')"
            :value="item.currentId || item.id"
          />
        </el-select>
      </div>
      <div class="footer-buttons">
        <el-button class="buttons-primary" size="large" @click="onSubmit" :loading="imageLoading">
          {{ $t("subject.confirm") }}
        </el-button>
        <el-button class="buttons-default" size="large" style="width: 150px" @click="()=> onClose()">
          {{ $t("subject.cancel") }}
        </el-button>
      </div>
    </div>
    <loading-component :show="loading" />
  </popup-component>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { Close, Plus, Refresh } from "@element-plus/icons-vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { useUserInfo } from "@/stores/user";
import { ElMessage } from "element-plus";


import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { fetchFileUpload } from "@/http/question";
import { useI18n } from "vue-i18n";
import { fetchUpdatePPT2 } from "@/http/ppt";

const props = defineProps<{
  visible: boolean;
  data?: any
  currentGrade?: number
  ppt?: boolean
  gradeList: { label: string, currentId: number, id: number }[]
}>();
const emit = defineEmits<{
  (event: "close", value?: boolean): void
}>();
const modalVisible = ref(props.visible);
const loading = ref(false);
const userInfoStore = useUserInfo();
const grade = ref(props.currentGrade);
const imageLoading = ref(false);


// const defaultSuject = "新建题库";
const suject = ref("");
const { t, locale } = useI18n();

const showImageRefresh = ref(false);
const imageUrl = ref();
let file: undefined | File;

const onFileChange = (f: any) => {
  file = f.target.files[0] as File;
  onUpload(file);
};

async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  const blob = await response.blob();
  return blob;
}

const onUpload = async (file: File) => {
  if (file instanceof File) {
    const formData = new FormData();
    formData.append("file", file);
    imageLoading.value = true;
    fetchFileUpload(formData).then((res: Http.Response<string>) => {
      if (res?.code === 200) {
        imageUrl.value = res.data;
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
};
const getErrTips = () => t("ppt.pptNameEmpty");
const onSubmit = () => {
  // "name":"李克勤dddd2",
  //   "topic":10,
  //   "question_types":130,
  //   "cover": "https://cdn.pixabay.com/photo/2023/03/21/20/39/facade-7868160_640.jpg",
  //   "answer_questions": 100

  if (suject.value.trim() && suject.value.length > 0) {
    //const formData = new FormData();
    loading.value = true;
    // const _file = (file ? file : urlToBlob(defaultImage)) as File;
    // formData.append("subjectName", suject.value);
    // formData.append("gradeId", String(grade.value));
    // formData.append("userId", String(userInfoStore?.userInfo?.user?.id));
    const formData = {
      pptName: suject.value,
      userId: userInfoStore?.getUserInfo?.user?.id,
      id: props.data?.id,
      pptImg: imageUrl.value
    };
    fetchUpdatePPT2(formData).then((res: Http.Response<any>) => {
      res.code === 200 && emit("close", true);
    }).finally(() => {
      //   modalVisible.value = false;
      loading.value = false;
    })
  } else ElMessage({
    message: getErrTips(),
    icon: "Warning", // 自定义图标
    type: "warning",
    duration: 3000,
    offset: 50
  });
};
watch(modalVisible, cb => {
  if (!cb) {
    emit("close", cb);
  }
});
const onClose = () => {
  emit("close",false);
};
watch(() => props.visible, (newValue) => {

  modalVisible.value = newValue;
  if (!newValue && !props.ppt) {
    grade.value = undefined;
    imageUrl.value = "";
  } else {
    setTimeout(()=>{
      grade.value = props.currentGrade || props.gradeList?.[0]?.currentId || props.gradeList?.[0]?.id;
    },200)

  }
});
// watch(userInfoStore.userInfo, (newValue) => {
//   if (newValue?.grade) {
//     options.value = newValue.grade.map((it: Grade.Item) => {
//       return {
//         gradeName: it.gradeName,
//         grade: it.id
//       };
//     });
//     grade.value = newValue.grade[0]?.id;
//   }
// }, {
//   immediate: true
// });
watch(() => props.data, (newValue) => {
  if (newValue) {

    grade.value = newValue.gradeId;
    suject.value = newValue.pptname;
    imageUrl.value = newValue.pptImg;
  } else {
    if(!props.ppt){
      grade.value = undefined;
      suject.value = "";
      imageUrl.value = "";
    }

    file = undefined;
  }
});
watch(()=> props.currentGrade,(cb)=>{
  grade.value = cb;
})
</script>
<style scoped lang="scss">
@import "@/theme";

$img-width: 200px;
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
  --width: 200px;
  --height: 150px;

  .left-side-container {
    width: var(--width);
    height: var(--height);
    position: relative;
    border-radius: 10px;
    overflow: hidden;
  }

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
    border-radius: 10px;
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
  left: 1px;
  top: 0;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: none;
  width: $img-width;
  height: calc($img-width / 4 * 3);

}

.img-add {
  font-size: 30px;
  opacity: 1 !important;
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  pointer-events: none;
  border-radius: 8px;
}

.file-upload, .img-add {
  position: absolute;
  width: $img-width;
  height: calc($img-width / 4 * 3);
  left: 1px;
  top: 0;
  overflow: hidden;
  opacity: 0;
  cursor: pointer;
}

.file-upload:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

</style>
