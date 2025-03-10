<template>
  <div class="list-wrapper">
    <div class="list" :style="{height}">
      <VueDraggable v-model="demo" handle=".handle" @start="()=> onMove()" @end="()=> dragging = false">
        <div :class="{'list-item':true,'handle-none':item.disabled}" v-for="(item,i) of demo"
             :key="item.key">
          <el-image :src="tdIcon" :class="{'move-icon':true,handle: !item.disabled}" v-if="i>1" />
          <div :class="{left:true}">
            {{ $t(getTitle(i + 1)) + (i - 2 < 0 ? "" : i - 1) }}
          </div>
          <div class="right" :style="{'pointer-events': dragging? 'none':'auto'}">
            <div class="item-cell" v-for="(it,k) of item.content" :key="k"
                 @mouseenter="()=>showToolPosition={position:i,index:k}"
                 @mouseleave="()=>showToolPosition={position:0,index:0}">
              <div :class="{'cell-title':true, 'theme1-bg':it.type<=3,'theme2-bg':it.type>3}">
                {{ $t(getType(it.type)) }}
              </div>
              <div class="input-box">
                <el-input size="large"
                          v-model="it.title"
                          class="cell-input"
                          :placeholder="$t(getType(it.type))" />
                <el-input class="desc-text"
                          rows="3"
                          v-model="it.description"
                          :maxlength="120"
                          show-word-limit
                          @blur="()=>showDescribePosition={position:0,index:0}"
                          type="textarea" :placeholder="$t('ppt.detailed')"
                          v-if="i>1 && k > 0 && showDescribePosition.index === k && showDescribePosition.position === i"
                          ref="textAreaRef" />
              </div>

              <div class="input-tools" v-if="i>1 && k>0"
                   v-show="showToolPosition.position === i && showToolPosition.index === k">
                <el-icon class="item-icon" @click.stop="onShowDescribe(i,k)">
                  <Edit />
                </el-icon>
                <el-icon class="item-icon" @click.stop="()=>onAddTextItem(i,k)">
                  <CirclePlus />
                </el-icon>
                <el-icon class="item-icon" @click.stop="()=>onRemoveTextItem(i,k)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
          <div class="item-tools" v-if="i>1">

            <el-icon class="item-tools-icon" @click.stop="()=>onShowConfirm(i)">
              <Delete />
            </el-icon>
            <el-icon class="item-tools-icon" @click.stop="()=> onAdd(i)">
              <CirclePlus />
            </el-icon>
          </div>
        </div>
      </VueDraggable>
    </div>
    <div class="setting">
      <div class="setting-title">
        {{$t('ppt.textSetting')}}
      </div>
      <div class="text-style">
        <div :class="[settingData.style === STYLE.STANDARD? 'button-active':'button']"
             style="height: 38px;border: 1px solid #c7c7c7"
             @click="()=>settingData.style = STYLE.STANDARD">{{$t('ppt.standard')}}
        </div>
        <div :class="[settingData.style === STYLE.PRECSSON? 'button-active':'button']"
             style="height: 38px;border: 1px solid #c7c7c7;border-left: none;border-right: none"
             @click="()=>settingData.style = STYLE.PRECSSON">{{$t('ppt.precision')}}
        </div>
        <div :class="[settingData.style === STYLE.RICH? 'button-active':'button']"
             style="height: 38px;border: 1px solid #c7c7c7"
             @click="()=>settingData.style = STYLE.RICH">{{$t('ppt.rich')}}
        </div>
      </div>
      <div class="setting-title">
        {{$t("ppt.toneSetting")}}
      </div>

      <el-select size="large" v-model="settingData.tone" :placeholder="$t('universal.select')" style="width: 100%">
        <el-option v-for="(item,index) of toneList" :key="index" :value="item.value" :label="$t(item.label)" />
      </el-select>
      <div class="setting-title">
        {{$t("ppt.themeSetting")}}
      </div>
      <div class="theme-cover">
        <el-image :src="pptCover" alt="cover" fit="contain" class="cover-img" />
        <span class="more" @click="()=> showThemeList = true">
          {{$t("ppt.moreTheme")}}
        </span>
      </div>
      <el-button size="large" class="default__button-primary done" type="primary" @click.stop="onDone">
        {{rebuild? $t("ppt.doneAgain"):$t("ppt.done")}}
      </el-button>
    </div>
  </div>
  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("home.tips") }}
         </span>
      <span class="confirm-title">{{ $t("ppt.beforeDeleted") }}</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary" style="width: 90px" @click="()=>onRemove()">
          {{ $t("home.confirm") }}
        </el-button>
        <el-button class="buttons-default" @click="showConfirm = false" style="width: 90px;margin-right: 0">
          {{ $t("home.cancel") }}
        </el-button>
      </el-space>
    </div>
  </popup-component>
  <popup-component v-model:modal-value="showThemeList">
    <el-icon class="ppt-theme-close-btn" @click.stop="showThemeList = false">
      <Close />
    </el-icon>
    <power-point-theme />
  </popup-component>
</template>
<script setup lang="ts">

import { VueDraggable } from "vue-draggable-plus";
import { nextTick, reactive, ref, watch } from "vue";
import pptCover from "@/assets/ppt-template-cover.png";
import tdIcon from "@/assets/td.svg";
import { CirclePlus, Close, Delete, Edit, Warning } from "@element-plus/icons-vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { getRandomString } from "@/libs/random";
import { ElMessage } from "element-plus";
import PowerPointTheme from "@cs/Power-Point-Theme/Power-Point-Theme.vue";
import { useI18n } from "vue-i18n";


interface DataContent {
  title?: string;
  type: number;
  content: string;
  description?: string;
}

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

interface Data {
  disabled?: boolean;
  title: string;
  key: string;
  chapter?: number;
  type?: number;
  content: DataContent[] | any[];
}

const props = defineProps<{
  height: string
  rebuild?: string
  dataSource: DataSource[]
}>();
const emit = defineEmits<{
  (ev: "done", value: Result): void
}>();
const showConfirm = ref(false);
const dragging = ref(false);
const showThemeList = ref(false);
const {t} = useI18n();
const demo = ref<Data[]>([]);
const showToolPosition = ref<{ position: number, index: number }>({
  position: 0,
  index: 0
});
const showDescribePosition = ref<{ position: number, index: number }>({
  position: 0,
  index: 0
});
//风格
const STYLE = {
  STANDARD: 1, //标准
  PRECSSON: 2, //精准
  RICH: 3 //丰富
}, TONE = {
  DEFAULT: 1,
  MAJOR: 2,
  HUMOR: 3,
  COLLOQUIAL: 4
};
const toneList = [
  {
    label: "ppt.default",
    value: TONE.DEFAULT
  },
  {
    label: "ppt.major",
    value: TONE.MAJOR
  },
  {
    label: "ppt.humor",
    value: TONE.HUMOR
  },
  {
    label: "ppt.colloquial",
    value: TONE.COLLOQUIAL
  }
];
const settingData = reactive<{
  style: number
  tone: number
}>({
  style: STYLE.STANDARD,
  tone: TONE.DEFAULT
});

const onMove = () => {
  dragging.value = true;
};

const getType = (type: number) => {

  let result = "";
  switch (type) {
    case 1:
      result = "ppt.cover";
      break;
    case 2:
      result = "ppt.catalog";
      break;
    case 3:
      result = "ppt.chapter";
      break;
    case 4:
      result = "ppt.text";
      break;
    default:
      result = "ppt.text";
  }
  return result;
};
const textAreaRef = ref();
const getTitle = (index: number) => {
  let result = "";
  switch (index) {
    case 1:
      result = "ppt.cover";
      break;
    case 2:
      result = "ppt.catalog";
      break;
    case 3:
      result = "ppt.chapter";
      break;
    default:
      result = "ppt.chapter";
  }
  return result;
};
const onShowDescribe = (position: number, index: number) => {
  showDescribePosition.value = {
    position,
    index
  };
  nextTick(() => {
    if (textAreaRef.value?.[0]) {
      textAreaRef.value[0].focus?.();
    }
  });
};
const transformDataToDataSource = (data: Data[]): DataSource[] => {
  let _result: DataSource[] = [];
  data.map((item) => {
    if (item.content) {
      const _content = item.content.map((k: DataContent) => {
        return {
          ...k,
          content: typeof k.content === "string" ? k.content : "",
          chapter: item.chapter,
          description: typeof k.description === "string" ? k.description : ""
        };
      });
      _content.map((iit, i) => {
        _result.push({
          content: iit.content,
          title: iit.title,
          type: iit.type,
          chapter: iit.chapter,
          detail: iit.detail || iit.description || ""
        });
      });
      // _result = (_result.concat(_content)).map((it: DataContent) => {
      //
      //   return {
      //     content: it.content,
      //     title: it.title,
      //     type: it.type,
      //     chapter: it.chapter,
      //     detail: it.detail || it.description || ""
      //   };
      // });
    }
  });
  return _result;
};

const transformDataSourceToData = (data: DataSource[]): Data[] => {
  let result: Data[] = [];
  const title: Data[] = [], catelog: Data[] = [], chapter: Data[] = [], text: Data[] = [];
  data.forEach((it: DataSource) => {
    if (it.type === 1) {
      title.push({
        disabled: true,
        title: it.title,
        key: getRandomString(10),
        chapter: it.chapter,
        type: it.type,
        content: [
          {
            type: it.type,
            title: it.title,
            content: it.title || it.content,
            description: it.detail || ""
          }
        ]
      });
    } else if (it.type === 2) {
      catelog.push({
        disabled: true,
        title: it.title,
        key: getRandomString(10),
        chapter: it.chapter,
        type: it.type,
        content: [
          {
            title: it.title,
            type: it.type,
            content: it.title || it.content,
            description: it.detail || ""
          }
        ]
      });
    } else if (it.type === 3) {
      chapter.push({
        disabled: false,
        title: it.title,
        key: getRandomString(10),
        chapter: it.chapter,
        type: it.type,
        content: [
          {
            type: it.type,
            title: it.title,
            content: it.content,
            description: it.detail || typeof it.content === "string" ? it.content : ""
          }
        ]
      });
    } else {
      text.push({
        disabled: false,
        title: it.title,
        key: getRandomString(10),
        chapter: it.chapter,
        type: it.type,
        content: it.content
      });
    }
  });
  const tempChapter = JSON.parse(JSON.stringify(chapter));
  text.map((it) => {
    const _index = chapter.findIndex(item => item.chapter === it.chapter);
    if (_index >= -1) {
      tempChapter[_index]?.content?.push?.({
        type: it.type,
        title: it.title,
        content: it.content,
        description: it.description || it.content
      });
    }
  });
  result = [...(title.concat(catelog)), ...tempChapter];
  return result;
};
const onAddTextItem = (position: number, k: number) => {
  let tempArr: any[] = [];
  for (let i = 0; i < demo.value[position].content.length + 1; i++) {
    if (i <= k) {
      tempArr.push(demo.value[position].content[i]);
    } else if (i === k + 1) {
      tempArr.push({
        type: 4,
        content: "",
        chapter: demo.value[position].chapter,
        description: ""
      });
    } else {
      tempArr.push(demo.value[position].content[i - 1]);
    }
  }
  demo.value[position].content = tempArr;
};
const onRemoveTextItem = (pos: number, index: number) => {
  if (demo.value[pos].content?.length < 3) {
    ElMessage({
      message: t("ppt.needText"),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  demo.value[pos].content.splice(index, 1);
};
//移除章节
let _index = 0;
let onRemove = () => {
  if (demo.value.length <= 3) {
    ElMessage({
      message: t("ppt.needChapter"),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  demo.value.splice(_index, 1);
  showConfirm.value = false;
};
//增加章节
const onAdd = (i: number) => {
  if (demo.value.length >= 12) {
    ElMessage({
      message: t("ppt.tooMany"),
      icon: "Warning", // 自定义图标
      type: "info",
      duration: 3000,
      offset: 50
    });
    return;
  }
  let tempArr: any[] = [];
  for (let k = 0; k < demo.value.length + 1; k++) {
    if (k === i + 1) {
      tempArr.push(
        {
          key: getRandomString(10),
          title: "ppt.chapter",
          disable: false,
          type: 3,
          content: [
            {
              content: "ppt.chapter",
              type: 3,
              description: ""
            },
            {
              content: "ppt.text",
              description: "",
              type: 4
            }
          ]
        }
      );
    } else if (k <= i) {

      tempArr.push(demo.value[k]);
    } else {
      tempArr.push(demo.value[k - 1]);
    }
  }
  demo.value = tempArr;
};
const onShowConfirm = (i: number) => {

  showConfirm.value = true;
  _index = i;
};
const getSettingData = (type: "style" | "tone", value): string => {
  let _result = "";
  if (type === "style") {
    switch (value) {
      case STYLE.STANDARD:
        _result = "ppt.standard";
        break;
      case STYLE.PRECSSON:
        _result = "ppt.precision";
        break;
      case STYLE.RICH:
        _result = "ppt.rich";
        break;
      default:
        _result = "ppt.standard";
    }
  } else {
    switch (value) {
      case TONE.HUMOR:
        _result = "ppt.humor";
        break;
      case TONE.DEFAULT:
        _result = "";
        break;
      case TONE.MAJOR:
        _result = "ppt.major";
        break;
      case TONE.COLLOQUIAL:
        _result = "ppt.colloquial";
        break;
      default:
        _result = "ppt.default";
    }
  }
  return _result;
};

const resetChapter = (data: Data[]): Data[] => {
  let _currentIndex = 0;
  return data.map((it) => {

    if (it.type === 3) {
      _currentIndex++;
      return {
        ...it,
        chapter: _currentIndex,
        content: it.content?.map?.((item) => {
          return {
            ...item,
            chapter: _currentIndex,
          }
        })
      }
    }
    return it
  });
};
const onDone = () => {
  const _outline = transformDataToDataSource(resetChapter(demo.value));
  const _textType = settingData.style, _textTone = settingData.tone, _template = 1;
  emit("done", {
    outline: _outline,
    textType: t(getSettingData("style", _textType)),
    textTone: t(getSettingData("tone", _textTone)),
    template: _template
  });
};
watch(() => props.dataSource, (cb) => {
  if (cb) {
    demo.value = transformDataSourceToData(cb);

  }
}, {
  immediate: true
});

</script>
<style scoped lang="scss">
@use "@/theme" as theme;

.list-wrapper {
  position: relative;
  background-color: #fff;
  box-sizing: border-box;
  width: 100%;

  display: grid;
  grid-template-columns: 3fr 1.2fr;
  &:deep(.el-input__wrapper){
    border-radius: 0 4px 4px 0;
    overflow: hidden;
  }
  .list {
    height: 500px;
    overflow-y: auto;
    padding: 10px 20px;
    box-sizing: border-box;
    border: 1px solid #dedede;

    .left {
      color: #43536C;
      font-weight: 600;
    }

    .list-item {
      display: grid;
      grid-template-columns: 150px 3fr 50px;
      align-items: center;
      justify-items: center;
      margin: 8px 0;
      //border: 1px solid #dedede;
      box-shadow: 1px 2px 10px #e1e1e1;
      background-color: #fff;
      padding: 10px;
      box-sizing: border-box;
      position: relative;

      &:hover {
        box-shadow: 1px 2px 10px #e1e1e1;
      }

      .theme1-bg {
        background-color: #337ecc;
        color: #fff;
      }

      .theme2-bg {
        background-color: #5fc23e;
        color: #fff;
      }

      .move-icon {
        width: 20px;
        position: absolute;
        left: 20px;
        top: 20px;
        z-index: 1;
        cursor: move;
      }

      .item-tools {
        width: 30px;
        box-sizing: border-box;
        display: flex;
        flex-flow: column;
        justify-content: space-between;
        align-items: center;
        align-self: flex-start;
        font-size: 20px;
        height: 45px;
        color: #333;
        pointer-events: auto;
        transform: translateY(2px);
        .item-tools-icon:hover {
          color: #000;
          cursor: pointer;
          font-weight: 600;
        }
      }

    }

    .handle-none {
      pointer-events: none;
    }

    .right {
      justify-self: flex-start;
      background-color: #fafafa;
      width: 100%;
      box-sizing: border-box;

      .item-cell {
        height: 40px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        width: 100%;
        justify-content: flex-start;
        margin: 5px 0;

        :deep(.el-input--large .el-input__inner) {
          padding-right: 0;
        }

        .input-box {
          position: relative;
          width: 100%;
          box-sizing: border-box;

          .desc-text {
            position: absolute;
            top: 40px;
            left: 0;
            right: 0;
            z-index: 1;
            height: auto;
            background-color: #fff;

            &:deep(.el-textarea__inner) {
              box-shadow: theme.$main-box-shadow-focus;
              text-align: left;
            }
          }
        }

        .cell-title {
          width: 130px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          box-sizing: border-box;
          color: #fff;
          border: 1px solid #dedede;
          border-radius: 4px 0 0 4px;
        }

        .input-tools {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100px;
          height: 30px;
          position: absolute;
          z-index: 1;
          right: 70px;
          background-color: #fff;

          .item-icon {
            font-size: 20px;
            cursor: pointer;
            color: #333;

            &:hover {
              color: #000;
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

.confirm-wrapper {
  width: 380px;
  height: 180px;
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

.setting {
  padding: 10px 20px;
  box-sizing: border-box;
  border: 1px solid #dedede;
  box-shadow: 1px 2px 10px #e1e1e1;
  margin-right: 20px;
  margin-left: 10px;

  .setting-title {
    font-size: 16px;
    font-weight: 600;
    margin: 14px 0;
    color: #43536C;
  }

  .text-style {
    position: relative;
    display: grid;
    margin: 0 auto;
    grid-template-columns: repeat(3, 1fr);
    font-size: 14px;

    .button {
      font-size: 14px;
      color: #222;
      background-color: #fefefe;
      transition: background-color .2s;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .button-active {
      color: #fff;
      cursor: pointer;
      background-color: theme.$main-bg-color;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .theme-cover {
    display: flex;
    flex-flow: row;
    align-items: end;

    .cover-img {
      width: 60%;
      box-shadow: theme.$main-box-shadow;

    }

    .more {
      color: theme.$main-active-font-color;
      text-decoration: underline;
      font-size: 14px;
      margin-left: 10px;
      cursor: pointer;

      &:hover {
        color: theme.$main-active-font-hover-color;
      }
    }
  }

  .done {
    width: 50%;
    display: inline-block;
    margin: 40px auto 0 25%;
  }
}

.ppt-theme-close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 22px;
  cursor: pointer;
  color: #333;

  &:hover {
    color: #111;
  }
}
</style>