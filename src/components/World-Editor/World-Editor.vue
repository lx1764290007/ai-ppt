<template>
  <div class="header-wrapper">
    <el-button class="go-back-btn buttons-default" size="large" @click="()=> onBack()"
               style="transform: translateY(-10px)">
      <el-image :src="backIcon" alt="back" class="icon img" @click="onBack" style="margin-left: 20px" />
    </el-button>
    <div class="subject-name">{{ subjectName }}</div>
    <el-select :placeholder="$t('universal.area')" v-model="area" class="default__select header-select" size="large">
      <el-option v-for="item of areaList" :key="item.label" :value="item.label" :label="item.label">
        <div class="area-item">
          <el-image :src="item.icon" class="area-icon" fit="contain"></el-image>
          <span> {{ item.label }}</span>
        </div>

      </el-option>
    </el-select>
    <el-select :placeholder="$t('grade.grade')" v-model="grade" class="default__select header-select" size="large">
      <el-option v-for="item of gradeList" :key="item.value" :value="item.value"
                 :label="locale.locale.value === 'en'? `${$t('grade.grade')}${item.label}`:`${item.label}${$t('grade.grade')}`" />

    </el-select>
    <el-select :placeholder="$t('ppt.language')" v-model="lang" class="default__select header-select" size="large">
      <el-option value="中文繁體" label="中文繁體">中文繁體</el-option>
      <el-option value="中文简体" label="中文简体">中文简体</el-option>
      <el-option value="English" label="English">English</el-option>

    </el-select>
    <!--    <el-select :placeholder="$t('ppt.nums')" v-model="page" class="default__select header-select" size="large">-->
    <!--      <el-option v-for="item of pageList" :key="item.value" :value="item.value"-->
    <!--                 :label="$t('ppt.about') + item.value + $t('universal.word')" />-->
    <!--    </el-select>-->
    <el-input-number size="large" v-model="word"
                     :max="10000"
                     :min="100"
                     placeholder="100 - 10,000"
                     class="default__select header-select"
                     style="transform: translateY(-9px)" :controls="false">

    </el-input-number>
    <span class="word-text">
      {{ $t("universal.word") }}
    </span>
  </div>
  <div :class="{creator:true,file: Boolean(fileData)}">
    <el-input ref="inputRef"
              size="large"
              class="default__input theme-input"
              :placeholder="$t('ppt.theme_placeholder')"
              v-model="themeValue" />
    <div class="file-preview" v-show="Boolean(fileData)">
      <el-image :src="TXT_PNG" alt="file" fit="contain" />
      <el-icon class="close-preview-icon" @click.stop="onRemoveFile">
        <CloseBold />
      </el-icon>
    </div>
    <div class="creator-right">
      <div class="ppt-list-module" @click.stop="onOpenFileModal">
        <img src="@/assets/img.png" alt="img" class="tag-icon" />
        <img src="@/assets/pdf.png" alt="img" class="tag-icon" />
        <img src="@/assets/video.png" alt="img" class="tag-icon" />
      </div>
      <div class="editor-generate">
        <el-button type="primary" class="default__button-primary" v-if="false"
                   :style="{width: locale.locale.value === 'en'? '100px':'100px'}"
                   size="large" @click="onGenerate(0)"
                   :loading="loading">
          {{ $t("world.generate") }}
        </el-button>
        <el-button type="primary"
                   v-else
                   :disabled="!themeValue && !fileData"
                   class="default__button-primary"
                   :style="{width: locale.locale.value === 'en'? '150px':'150px'}"
                   size="large" @click="onGenerate(1)"
                   :loading="loading">{{ $t("world.generate") }}
        </el-button>
      </div>
    </div>
  </div>
  <div class="ppt-editor-theme">
    <div class="ppt-editor-theme-list">
      <div :class="{'theme-item':true}" @click.stop="()=>onSelectBg(1)">
        <el-image :src="QUESTION_IMG1" alt="THEME1" fit="contain" />
        <el-image class="selected-icon" :src="CORRECT_ICON" alt="correct" fit="contain" v-if="activeThemeItem === 1" />
        <span class="tips-question">整段提問</span>
      </div>
      <div :class="{'theme-item':true}" @click.stop="()=>onSelectBg(2)">
        <el-image :src="QUESTION_IMG2" alt="THEME2" fit="contain" />
        <el-image class="selected-icon" :src="CORRECT_ICON" alt="correct" fit="contain" v-if="activeThemeItem ===2" />
        <span class="tips-question">分段提問</span>
      </div>
    </div>
  </div>
  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("ppt.pptEditorTips") }}
         </span>
      <span class="confirm-title">{{ $t("ppt.wordSuccess") }}</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary" style="width: 90px" @click="onOpenUrl">
          {{ $t("ppt.go") }}
        </el-button>
      </el-space>
    </div>
  </popup-component>
  <loading-component :show="loading" />
  <popup-component v-model="showFileUpload">
    <div class="upload-wrapper" v-loading="fileLoading">
      <el-icon class="close-upload-icon" @click.stop="()=> showFileUpload = false">
        <close />
      </el-icon>
      <el-upload
        class="upload"
        drag
        action="#"
        accept=".txt, .docx, .doc"
        :before-upload="onFileChange"
      >
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">
          {{ $t("universal.drop") }} <em>{{ $t("universal.click") }}</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            .txt/.docx/.doc files with a size less than 2mb
          </div>
        </template>
      </el-upload>
    </div>
  </popup-component>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElInput, ElMessage } from "element-plus";
import vcSubscribePublic from "@/libs/eventBus";

import QUESTION_IMG1 from "@/assets/question1.png";
import QUESTION_IMG2 from "@/assets/question2.png";

import type { Http } from "@/interface/Http";
import { Close, CloseBold, UploadFilled, Warning } from "@element-plus/icons-vue";

import { useI18n } from "vue-i18n";
import { fetchAreas } from "@/http/topic";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import backIcon from "@/assets/back.png";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import CORRECT_ICON from "@/assets/seleted.png";
import { fetchWorldGenerate, fetchWorldUpload } from "@/http/world";
import TXT_PNG from "@/assets/txt.png";


interface DataSource {
  chapter: number;
  content: string;
  order?: number;
  title: string;
  type: number;
  detail?: string;
}

interface Result {
  template: number;
  textType: string;
  textTone: string;
  outline: DataSource[];
}

const locale = useI18n();
const activeThemeItem = ref<number>(1);
const tags = reactive<{ id: number, value: string }[]>([]);
const themeValue = ref();
const showFileUpload = ref(false);
const hasContext = ref(false);
const grade = ref();
const page = ref<number>(25);
const area = ref<string>();
const areaList = ref<{ label: string; value: string, icon: string }[]>([]);
const lang = ref("中文繁體");
const themeId = ref();
const isAgain = ref(false);
const fileLoading = ref(false);
const showConfirm = ref(false);
const gradeList = ref<any[]>([]);

const showLoading = ref(false);

const fileData = ref<string>("");
const word = ref<number>(300);

let finalUrl = "";
const loading = ref<boolean>(false);
const onOpenUrl = () => {
  if (finalUrl) {
    window.open(finalUrl, "_blank");
  }
  showConfirm.value = false;
};
const onFileChange = (event: any) => {
  fileLoading.value = true;
  const formData = new FormData();
  formData.append("file", event);
  fetchWorldUpload(formData).then((res: Http.Response<string>) => {
    if (res?.code === 200) {
      fileData.value = res.data;
    }
  }).finally(() => {
    fileLoading.value = false;
    showFileUpload.value = false;
  });
  return false;
};
const onRemoveFile = () => {
  fileData.value = "";
};
const getCountries = () => {
  fetchAreas().then((res: any) => {
    if (res?.code === 200) {
      areaList.value = res.data.map((it: any) => {
        return {
          label: it.countryName,
          value: it.countryCode,
          icon: it.flagUrl
        };
      });
      area.value = res.data.find((it: any) => it.countryCode === "HK")?.countryName;
    }
  });
};

const onGenerate = async (types?: number) => {
  hasContext.value = true;
  loading.value = true;
  fetchWorldGenerate({
    //@ts-ignore
    query: themeValue.value,
    docId: props.docId,
    subjectId: props.subjectId,
    templateType: activeThemeItem.value,//1整段 2分段
    fileText: fileData.value,
    gradeIds: "",
    wordCount: word.value,
    //@ts-ignore
    classes: props.grades.find(it => it.id === grade.value)?.grade + locale.t("grade.grade"),
    num: page.value,
    area: area.value,
    language: lang.value,
    type: isAgain.value ? 2 : 1
  }).then((res: any) => {
    if (res && res.code === 200) {
      showConfirm.value = true;
      isAgain.value = true;
      const str1 = "https://docs.google.com/document/d/";
      const str2 = "/edit";
      finalUrl = `${str1}${props.docId}${str2}`;
    } else {
      ElMessage.info(res.msg);
    }
  }).finally(() => {
    loading.value = false;
    showLoading.value = false;
  });

};

const props = withDefaults(defineProps<{
  pptName?: string
  docId?: number
  subjectId: number
  grade: number
  userId: number
  subjectName: string
  grades: any[]
}>(), {
  pptName: "",
  pptId: 0,
  subjectId: 0
});


const themeStyle = ref(0);
const inputRef = ref<InstanceType<typeof ElInput>>();

const onModifyPlain = (text: string[]) => {
  themeValue.value = `请帮我修改这段内容: ${text[0]}`;
  window.location.href = "#__use_ai";
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.textarea!.focus();
    }
  });
};
const emit = defineEmits(["back"]);
const onBack = () => emit("back");
defineExpose({
  themeStyle
});

const onSelectBg = (item: number) => {
  activeThemeItem.value = item;
};
const onOpenFileModal = () => {
  showFileUpload.value = true;
};
const getThemeList = async () => {
  // fetchThemeList().then((res: Http.InfoListData<Theme & { json: string }>) => {
  //   if (res.code === 200) {
  //     themeList.value = res.data.map((it: Theme) => {
  //       return {
  //         id: it.id,
  //         //@ts-ignore
  //         json:  JSON.parse(it.json)
  //       };
  //     });
  //     onSelectBg(0);
  //   }
  // });
};
onMounted(() => {
  vcSubscribePublic.subscribe("useAI", onModifyPlain);
  // getTagList();
  getThemeList();
  getCountries();
  gradeList.value = props.grades.map(it => {
    return {
      label: it.grade,
      value: it.id
    };
  });

  grade.value = props.grade;
});
onBeforeUnmount(() => {
  vcSubscribePublic.unsubscribe("useAI");
});
</script>

<style scoped lang="scss">
@use "@/theme" as theme;

.file:deep(.el-input__wrapper) {
  padding-right: 50px;
}

:deep(.el-upload-dragger) {
  height: 240px;
  padding-top: 60px;
}

.upload-wrapper {
  width: 500px;
  height: 300px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #fff;
  position: relative;

  .el-upload__text {
    text-align: center;
  }

  .el-upload__tip {
    text-align: center;
  }

  .close-upload-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
    font-size: 22px;
    cursor: pointer;
    color: #333;

    &:hover {
      color: #111;
    }
  }
}

.header-wrapper {
  position: relative;

  .subject-name {
    display: inline-block;
    margin-right: 20px;
    transform: translateY(-8px);
  }

}

.area-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;

}

.area-icon {
  width: 24px;
  align-items: center;
  margin-right: 5px;
}

.area-icon:deep(.el-image__inner) {
  margin-top: 5px;
}

.creator {
  display: flex;
  align-items: center;
  position: relative;

  .file-preview {
    position: relative;
    transform: translate(-55px, 3px);
    width: 40px;

    .close-preview-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      color: #f31717;
      font-size: 18px;

      &:hover {
        cursor: pointer;
        color: #c90a09;
      }
    }
  }
}

.file:deep(.el-input__wrapper) {
  padding-right: 50px;
  position: relative;
}

.theme-input {
  width: 95%;
  margin-right: 15px;
  border-radius: 10px;
}

.theme-input:deep(.el-input__wrapper) {
  border-radius: 10px;
}

.theme-style-item img {
  width: 50px;
  height: 50px;
}

.header-select {
  width: 120px;
  margin-right: 15px;
  margin-bottom: 20px;

}

.go-back-btn {
  margin-right: 10px;
  background-color: #fff;
  width: 40px;
}

.header-select:deep(.el-input) {
  --el-input-border-radius: 8px;
}

.ppt-list-module {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-content: end;
  cursor: pointer;
}

.tag-icon {
  width: 40px;
  justify-self: end;
  margin-right: 2px;
}

.editor-generate {
  text-align: right;
}

.creator-right {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  min-width: 350px;
}

.ppt-editor-theme {
  height: calc(100% - 52px - 40px - 25px);

  position: relative;
  margin-top: 15px;
}

.ppt-editor-theme-list {

  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-flow: row wrap;

  .theme-item {
    width: 160px;
    cursor: pointer;
    position: relative;
    border-radius: 5px;
    overflow: hidden;


    .tips-question {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 30px;
      font-size: 14px;
      color: #43536C;
      text-align: center;
      font-weight: 600;
    }

    .selected-icon {
      position: absolute;
      right: 12px;
      bottom: 24px;
      width: 24px;
    }
  }

  .theme-active {
    box-shadow: theme.$main-box-shadow-focus !important;
  }

  .theme-item + .theme-item {
    margin-left: 20px;
  }
}

.icon {
  width: 24px;
  margin-right: 20px;
}

.ppt-editor-theme-item {
  --width: 240px;
  width: var(--width);
  height: calc(var(--width) * 9 / 16);
  background-color: #ccc;
  margin-right: 5px;
  margin-top: 5px;
  flex-shrink: 0;
  cursor: pointer;
  box-sizing: border-box;
  border: 2px solid rgba(0, 0, 0, 0);
  position: relative;
  transition: transform .2s;
  border-radius: 6px;
}

.ppt-editor-theme-item-active {
  border: 2px solid #0096FF;
  transform: scale(1) !important;
}

.ppt-editor-theme-item:hover {
  transform: scale(1.02);
}

.ppt-list-back {
  height: 30px;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #efefef;
  padding: 0 10px;
  color: #369ae2;
}

.ppt-list-back .img {
  width: 20px;
  height: auto;
  margin-right: 5px;
  cursor: pointer;
}

.split-dash {
  color: #d5d5d5;
  padding: 0 5px 2px 5px;
}

.selector-active-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  background: #0096FF;
  border-radius: 3px;
}

.preview-theme-image {
  width: 100%;
  height: 100%;
}

.confirm-wrapper {
  width: 380px;
  height: 180px;
  background-color: #fff;
  border-radius: 12px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  position: relative;

  .confirm-tip {
    position: absolute;
    left: 20px;
    top: 10px;
    font-size: 16px;
    font-weight: 600;
  }

  .confirm-title {
    font-weight: normal;
    padding: 30px 0 0 0;
    font-size: 16px;
  }
}

.word-text {
  color: #5d5d5d;
  font-size: smaller;
  transform: translate(-5px, -10px);
  display: inline-block;
  position: relative;
}
</style>
