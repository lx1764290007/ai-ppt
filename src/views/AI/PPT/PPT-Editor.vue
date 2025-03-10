<template>
  <div class="header-wrapper">
    <el-button class="go-back-btn buttons-default" size="large" @click="()=> onBack()"
               style="transform: translateY(-10px)">
      <el-image :src="backIcon" alt="back" class="icon img" @click="onBack" style="margin-left: 20px" />
    </el-button>

    <el-select :placeholder="$t('universal.area')" v-model="area" class="default__select header-select" size="large">
      <el-option v-for="item of areaList" :key="item.label" :value="item.label" :label="item.label">
        <div class="area-item">
          <el-image :src="item.icon" class="area-icon" fit="contain"></el-image>
          <span> {{ item.label }}</span>
        </div>

      </el-option>
    </el-select>
    <el-select :placeholder="$t('grade.grade')" v-model="grade" class="default__select header-select" size="large">
      <el-option v-for="item of gradeList" :key="item.id" :value="item.id"
                 :label="locale.locale.value === 'en'? `${$t('grade.grade')}${item.label}`:`${item.label}${$t('grade.grade')}`" />

    </el-select>
    <el-select :placeholder="$t('ppt.nums')" v-model="page" class="default__select header-select" size="large">
      <el-option v-for="item of pageList" :key="item.value" :value="item.value"
                 :label="$t('ppt.about') + item.value + $t('universal.page')" />
    </el-select>
    <el-select :placeholder="$t('ppt.language')" v-model="lang" class="default__select header-select" size="large">
      <el-option value="中文繁體" label="中文繁體">中文繁體</el-option>
      <el-option value="中文简体" label="中文简体">中文简体</el-option>
      <el-option value="English" label="English">English</el-option>

    </el-select>

  </div>
  <div class="creator">
    <el-input ref="inputRef"
              size="large"
              class="default__input theme-input"
              :placeholder="$t('ppt.theme_placeholder')"
              v-model="themeValue" />
    <div class="creator-right">
      <div class="ppt-list-module">
        <img src="@/assets/img.png" alt="img" class="tag-icon" />
        <img src="@/assets/pdf.png" alt="img" class="tag-icon" />
        <img src="@/assets/video.png" alt="img" class="tag-icon" />
      </div>
      <div class="editor-generate">
        <el-button type="primary" class="default__button-primary" v-if="false"
                   :style="{width: locale.locale.value === 'en'? '100px':'100px'}"
                   size="large" @click="onGenerate(0)"
                   :loading="loading">
          {{ $t("ppt.generate") }}
        </el-button>
        <el-button type="primary"
                   v-else
                   class="default__button-primary"
                   :style="{width: locale.locale.value === 'en'? '150px':'150px'}"
                   size="large" @click="onGenerate(2)"
                   :loading="loading">{{ $t("ppt.generate_again") }}
        </el-button>
      </div>
    </div>
  </div>
  <el-empty :description="$t('universal.empty')" style="margin-top: 150px" v-if="jsonData.length<1 && !loading" />
  <div class="ppt-editor-theme" v-else-if="loading">
    <loading-area :show="loading" />
  </div>
  <div class="ppt-editor-theme" v-else>
    <div class="ppt-list-back">
      <span style="color: #222">
        {{ $t("ppt.theme") }}
      </span>
    </div>
    <div class="ppt-editor-theme-list">
      <t-leading :height="contentHeight" :data-source="jsonData" @done="onDone" :rebuild="isAgain" />
    </div>
  </div>
  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("ppt.pptEditorTips") }}
         </span>
      <span class="confirm-title">{{ $t("ppt.pptSuccess") }}</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary" style="width: 90px" @click="onOpenUrl">
          {{ $t("ppt.go") }}
        </el-button>
      </el-space>
    </div>
  </popup-component>
  <loading-component :show="showLoading" />
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElInput, ElMessage } from "element-plus";
import vcSubscribePublic from "@/libs/eventBus";
import TLeading from "@cs/PPT-Leading/T-Leading.vue";

import { fetchAddPPT, fetchGeneratePPT2, fetchGeneratePPTOutline, fetchTagAddAndEdit, fetchTagList } from "@/http/ppt";
import type { Http } from "@/interface/Http";
import { Warning } from "@element-plus/icons-vue";
import LoadingArea from "@cs/Loading-Com/Loading-Area.vue";
import { useI18n } from "vue-i18n";
import { fetchAreas } from "@/http/topic";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import backIcon from "@/assets/back.png";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";


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
const contentHeight = `calc(100vh - 225px)`;
const tags = reactive<{ id: number, value: string }[]>([]);
const addTagState = ref(false);
const newTagValue = ref("");
const themeValue = ref();
const bgImage = ref();
const hasContext = ref(false);
const grade = ref();
const page = ref<number>(25);
const area = ref<string>();
const areaList = ref<{ label: string; value: string, icon: string }[]>([]);
const lang = ref("中文繁體");
const themeId = ref();
const isAgain = ref(false);
const showConfirm = ref(false);
const gradeList = ref<any[]>([]);
const jsonData = ref<DataSource[]>([]);
const showLoading = ref(false);
const generateAgainId = ref("");
/**
 * Array(15).fill(0).map((_, i) => {
 *   if(locale.locale.value === 'zh_hant'){
 *     return {
 *       value: i+1,
 *       label: `${i+1} ${locale.t('universal.page')}`
 *     }
 *   } else {
 *     return {
 *       value: i+1,
 *       label: `${i+1} ${locale.t('universal.page')}${i === 0? '':'s'}`
 *     }
 *   }
 * });
 */
const pageList = [
  {
    value: 20,
    label: `${locale.t("ppt.about")}${20}${locale.t("universal.page")}`
  },
  {
    value: 25,
    label: `${locale.t("ppt.about")}${25}${locale.t("universal.page")}`
  },
  {
    value: 30,
    label: `${locale.t("ppt.about")}${30}${locale.t("universal.page")}`
  },
  {
    value: 35,
    label: `${locale.t("ppt.about")}${35}${locale.t("universal.page")}`
  },
  {
    value: 40,
    label: `${locale.t("ppt.about")}${40}${locale.t("universal.page")}`
  },
  {
    value: 45,
    label: `${locale.t("ppt.about")}${45}${locale.t("universal.page")}`
  },
  {
    value: 50,
    label: `${locale.t("ppt.about")}${50}${locale.t("universal.page")}`
  }
];
page.value = pageList[0].value;
let urlData: any = [];

interface Theme {
  id: number;
  json: { title: string, content: string };
}

let finalUrl = "";
const themeList = ref<Theme[]>([]);
// eslint-disable-next-line no-undef
const InputRef = ref<InstanceType<typeof ElInput>>();
const loading = ref<boolean>(false);
const onTagAdd = async () => {
  if (newTagValue.value) {
    const res = await fetchTagAddAndEdit({
      lable: newTagValue.value
    });
    if (res && res.code === 0) {
      getTagList();
      newTagValue.value = "";
    }
  }
  addTagState.value = false;
};
const onOpenUrl = () => {
  console.log(finalUrl);
  if (finalUrl) {
    window.open(finalUrl, "_blank");
  }
  showConfirm.value = false;
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
      area.value = res.data.find(it => it.countryCode === "HK")?.countryName;
    }
  });
};
const onDone = async (result: Result) => {

    showLoading.value = true;
    fetchGeneratePPT2({
      query: themeValue.value,
      pptId: props.pptId,
      subjectId: props.subjectId,
      template: themeId.value,
      //@ts-ignore
      classes: props.grades.find(it => it.id === grade.value)?.label + "年級",
      num: page.value,
      area: area.value,
      language: lang.value,
      type: isAgain.value? 2:1,  //2重新生成1第一次生成
      ...result
    }).then((res: Http.Response<any>) => {
      if (res?.code === 200) {
        const base_edit_url_start = "https://docs.google.com/presentation/d/";
        const base_edit_url_end = "/edit";
        isAgain.value = true;
        try {
          const _data = JSON.parse(res.data.pptOutline) as DataSource[];
          const newJson = _data.map((item: { title: string, content?: string }) => {
            return {
              imageDescription: item.title || item.content
            };
          });
          finalUrl = `${base_edit_url_start}${props.pptId}${base_edit_url_end}?data=${encodeURIComponent(JSON.stringify(newJson))}`;
          showConfirm.value = true;
        } catch (err) {
          console.log(err);
        }
      }

    }).finally(() => {
      showLoading.value = false;
    });
};

const onGeneratePoint = () => {
  loading.value = true;
  showLoading.value = true;
  fetchAddPPT({
    //@ts-ignore
    subjectId: props.subjectId,
    userId: props.userId
  }).then((res: Http.Response<any>) => {

    if (res && res.code === 200) {
      //@ts-ignore
      generateAgainId.value = res.data.pptid;

    }
  }).finally(() => {
    loading.value = false;
    showLoading.value = false;
  });
};
const onGenerate = (types?: number) => {
  if (!themeValue.value) return;
  hasContext.value = true;
  loading.value = true;
  // const target = "課程設計需要包括以下幾個：1，教學目標 2,教学重点和难点, 3，教学过程设计，4，教學建議。列出的事項需要換行！請你設計具體的課題。本次課題的內容是：";
  let value = `${themeValue.value}，the number of ppts is ${page.value}`;
  if (grade.value) {
    value += `,Suitable for ${grade.value} students`;
  }
  if (lang.value) {
    value += `,Please use ${lang.value} language,`;
  }
  fetchGeneratePPTOutline({
    query: themeValue.value,
    pptId: props.pptId,
    subjectId: props.subjectId,
    template: themeId.value,
    //@ts-ignore
    classes: props.grades.find(it => it.id === grade.value)?.label + "年級",
    num: page.value,
    area: area.value,
    language: lang.value,
    type: types
  }).then((res: any) => {
    if (res && res.code === 200) {

      try {
        jsonData.value = JSON.parse(res.data.pptOutline) as DataSource[];

      } catch (err) {
        console.log(err);
      }
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
  pptId?: number
  subjectId: number
  grade: number
  userId: number
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
const getTagList = async () => {
  const res: Http.ListData<{ lable: string, id: number }> = await fetchTagList();
  if (res && res.code === 200) {
    tags.length = 0;
    for (let i = 0; i < res.list.length; i++) {
      tags.push({
        id: res.list[i].id,
        value: res.list[i].lable
      });
    }
  }
};
const onSelectBg = (item: number) => {
  if (bgImage.value === item) {
    bgImage.value = null;
    themeId.value = null;
  } else {
    bgImage.value = item;
    themeId.value = themeList.value[item].id;
  }

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
  gradeList.value = props.grades;
  grade.value = props.grade;
});
onBeforeUnmount(() => {
  vcSubscribePublic.unsubscribe("useAI");
});
</script>

<style scoped lang="scss">
@import "@/theme";

.header-wrapper {
  position: relative;
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
  margin-right: 20px;
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
</style>