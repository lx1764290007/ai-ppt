<template>
  <div id="__use_ai"></div>
  <!--  <el-button icon="ArrowLeftBold" class="edit-back" type="primary" text @click="onBack">-->
  <!--    {{ pptName }}-->
  <!--  </el-button>-->

  <div class="header-wrapper">
    <!--    <el-scrollbar class="header">-->
    <!--      <div class="header-item" v-for="(item,i) of tags" :key="i">-->
    <!--        <el-tag size="large" type="primary" effect="light" @click="onAddToTheme(item.value)" @close="onRemoveTag(i)"-->
    <!--                class="tag" closable>{{ item.value }}-->
    <!--        </el-tag>-->
    <!--      </div>-->
    <!--      <el-tag type="success" effect="light"  size="large" @click="onAddTag" v-if="!addTagState" style="cursor: pointer">-->
    <!--        {{$t('universal.add')}}-->
    <!--      </el-tag>-->
    <!--      <el-input ref="InputRef" @blur="onTagAdd" @keyup.enter="onTagAdd" size="default" placeholder="请输入" v-else-->
    <!--                style="width: 100px;" v-model="newTagValue" />-->
    <!--    </el-scrollbar>-->
    <el-select :placeholder="$t('universal.area')" v-model="area" class="default__select header-select">
      <el-option v-for="item of areaList" :key="item.label" :value="item.label" :label="item.label">
        <div class="area-item">
          <el-image :src="item.icon" class="area-icon" fit="contain"></el-image>
          <span> {{ item.label }}</span>
        </div>

      </el-option>
    </el-select>
    <el-select :placeholder="$t('grade.grade')" v-model="grade" class="default__select header-select">
      <el-option v-for="item of gradeList" :key="item.id" :value="item.id" :label="locale.locale.value === 'en'? `${$t('grade.grade')}${item.label}`:`${item.label}${$t('grade.grade')}`" />

    </el-select>
    <el-select :placeholder="$t('ppt.nums')" v-model="page" class="default__select header-select">
      <el-option v-for="item of pageList" :key="item.value" :value="item.value" :label="$t('ppt.about') + item.value + $t('universal.page')" />
    </el-select>
    <el-select :placeholder="$t('ppt.language')" v-model="lang" class="default__select header-select">
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
        <el-button type="primary" class="default__button-primary" v-if="!isAgain"
                   :style="{width: locale.locale.value === 'en'? '100px':'100px'}"
                   size="large" @click="onGenerate(0)"
                   :loading="loading">
          {{ $t("ppt.generate") }}
        </el-button>
        <el-button type="primary"
                   v-else
                   class="default__button-primary"
                   :style="{width: locale.locale.value === 'en'? '150px':'100px'}"
                   size="large" @click="onGenerate(2)"
                   :loading="loading">{{ $t("ppt.generate_again") }}
        </el-button>
      </div>
    </div>
  </div>
  <div class="ppt-editor-theme">
    <div class="ppt-list-back">
      <img src="@/assets/back.png" alt="back" class="icon img" @click="onBack" />
      <span class="split-dash">|</span>
      <span style="color: #222">
        {{$t('ppt.theme')}}
      </span>
    </div>
    <div class="ppt-editor-theme-list">
      <div :class="{'ppt-editor-theme-item':true, 'ppt-editor-theme-item-active':true}">
        <el-icon class="selector-active-icon">
          <Check />
        </el-icon>
        <el-image class="preview-theme-image"
                  :src="templateIcon"
                  alt="preview" fit="contain" />
      </div>
    </div>
  </div>
  <LoadingComponent :show="loading" />

  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("ppt.pptEditorTips") }}
         </span>
      <span class="confirm-title">{{ $t("ppt.pptSuccess") }}</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary"  style="width: 90px" @click="onOpenUrl">
          {{ $t("ppt.go") }}
        </el-button>

      </el-space>
    </div>

  </popup-component>
</template>
<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { ElInput, ElMessage } from "element-plus";
// import PPTContent from "@vs/AI/PPT/PPT-Content.vue";
import vcSubscribePublic from "@/libs/eventBus";

import {fetchCreatePPT, fetchTagAddAndEdit, fetchTagList } from "@/http/ppt";
import type { Http } from "@/interface/Http";
import { Check, Warning } from "@element-plus/icons-vue";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import {useI18n} from "vue-i18n";
import { fetchAreas } from "@/http/topic";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import templateIcon from "@/assets/ppt-template-cover.png";

const locale = useI18n();

const tags = reactive<{ id: number, value: string }[]>([]);
const addTagState = ref(false);
const newTagValue = ref("");
const themeValue = ref();
const bgImage = ref();
const hasContext = ref(false);
const grade = ref();
const page = ref<number>(25);
const area = ref<string>();
const areaList = ref<{label: string; value: string, icon:string}[]>([]);
const lang = ref("中文繁體");
const themeId = ref();
const isAgain = ref(false);
const showConfirm = ref(false);
const gradeList = ref<any[]>([]);
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
    label: `${locale.t("ppt.about")}${20}${locale.t('universal.page')}`,
  },
  {
    value: 25,
    label: `${locale.t("ppt.about")}${25}${locale.t('universal.page')}`,
  },
  {
    value: 30,
    label: `${locale.t("ppt.about")}${30}${locale.t('universal.page')}`,
  },
  {
    value: 35,
    label: `${locale.t("ppt.about")}${35}${locale.t('universal.page')}`,
  },
  {
    value: 40,
    label: `${locale.t("ppt.about")}${40}${locale.t('universal.page')}`,
  },
  {
    value: 45,
    label: `${locale.t("ppt.about")}${45}${locale.t('universal.page')}`,
  },
  {
    value: 50,
    label: `${locale.t("ppt.about")}${50}${locale.t('universal.page')}`,
  },
]
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
const onOpenUrl = ()=>{
  if(finalUrl){
    window.open(finalUrl,"_blank");
  }
  showConfirm.value = false;
}
const getCountries = ()=> {
  fetchAreas().then((res:any) => {
    if(res?.code === 200){
      areaList.value = res.data.map((it:any)=> {
        return {
          label: it.countryName,
          value: it.countryCode,
          icon: it.flagUrl
        }
      })
      area.value = res.data.find(it=> it.countryCode === "HK")?.countryName;
    }
  })
}
const onGenerate = (types?:number) => {
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

  fetchCreatePPT({
    query: themeValue.value,
    pptId: props.pptId,
    subjectId: props.subjectId,
    template: themeId.value,
    classes: props.grades.find(it=> it.id === grade.value)?.label + '年級',
    num: page.value,
    area: area.value,
    language: lang.value,
    type: types
  }).then((res: any) => {
    if (res && res.code === 200) {
      isAgain.value = true;
      // urlData = [...urlData, res.list || []];
      // const resultDescs = encodeURIComponent(JSON.stringify((res.data || []).map((it:any)=> {
      //   return {
      //     imageDescription: it.imageDescription
      //   }
      // })));
      const base_edit_url_start = "https://docs.google.com/presentation/d/";
      const base_edit_url_end = "/edit";
      try {
        const json = JSON.parse(res.data.pptOutline);
        const _data = json.map((item:any)=> {
          return {
            title: item.title,
            imageDescription: item.title || ""
          };
        })

        finalUrl = `${base_edit_url_start}${props.pptId}${base_edit_url_end}?data=${encodeURIComponent(JSON.stringify(_data))}`;

      }catch(err){
        finalUrl = `${base_edit_url_start}${props.pptId}${base_edit_url_end}`;
      }

      showConfirm.value = true;
      // ElMessageBox.confirm(
      //   locale.locale.value === 'zh_hant'? "PPT已生成":"PPT has been generated",
      //   "",
      //   {
      //     confirmButtonText: locale.t("universal.confirm"),
      //     cancelButtonText: locale.t("universal.cancel"),
      //     showCancelButton: false,
      //     showClose: false,
      //     type: "success"
      //   }
      // )
      //   .then(() => {
      //     window.open(url, 'Idea Lab',
      //       'width=1024,height=764,left=100,top=100,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');
      //   })
      //   .catch(() => {
      //     window.open(url, "_blank");
      //   });
    } else {
      ElMessage.info(res.msg);
    }
  }).finally(() => {
    loading.value = false;
  });

};

const props = withDefaults(defineProps<{
  pptName?: string
  pptId?: number
  subjectId: number
  grade: number
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
  if(bgImage.value === item) {
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
.area-icon:deep(.el-image__inner){
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
  height: calc(100% - 52px - 40px - 20px);
  background-color: #fff;
  position: relative;
  margin-top: 15px;
}

.ppt-editor-theme-list {
  padding: 15px 15px 15px 15px;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-flow: row wrap;
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
  width: 330px;
  height: 160px;
  background: #fff;
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