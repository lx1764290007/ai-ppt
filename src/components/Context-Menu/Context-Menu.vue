<template>
  <div :class="{'context-menu-wrapper':true,'context-menu-wrapper-auto-width':language}">
    <div v-if="!language">
      <input readonly @focus="onMenuShow" @blur="onBlur" name="p" />
      <el-icon :class="{ 'context-menu-more': true, vertical: vertical }" :style="{ color: color }">
        <More />
      </el-icon>
    </div>
    <div v-else style=" display: flex;
  align-items: center;
  justify-content: center;">

      <el-button size="small" class="buttons-default" @focus="onMenuShow" @blur="onBlur">
        <img :src="langIcon" alt="lang" class="lang-icon" />
        <span style="margin-left: 5px">{{ langEnum[lang] }}</span>
      </el-button>
    </div>
    <div v-if="menuPopupVisible && !language"
         :style="{position: 'absolute',transform: `translate(0,${ppt? '20px':'-11px'})`,zIndex: 99999}">
      <div
        :class="{ 'context-menu-popup': !vertical, 'is-vertical': vertical }"
        :style="{ color: color }"
      >
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.EDIT)">
          <el-icon style="margin-right: 5px;margin-top: 2px">
            <Edit />
          </el-icon>
          {{ $t("modal.edit") }}
        </div>
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.COPY)" v-if="!ppt">
          <el-icon style="margin-right: 5px">
            <CopyDocument />
          </el-icon>
          {{ $t("modal.copy") }}
        </div>
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.DELETE)">
          <el-icon style="margin-right: 5px">
            <Delete />
          </el-icon>
          {{ $t("modal.delete") }}
        </div>
      </div>
    </div>
    <div v-if="menuPopupVisible && !language"
         :style="{position: 'absolute',transform: `translate(0,${ppt? '20px':'-11px'})`,zIndex: 99999}">
      <div
        :class="{ 'context-menu-popup': !vertical, 'is-vertical': vertical }"
        :style="{ color: color }"
      >
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.EDIT)">
          <el-icon style="margin-right: 5px;margin-top: 2px">
            <Edit />
          </el-icon>
          {{ $t("modal.edit") }}
        </div>
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.COPY)" v-if="!ppt && !world">
          <el-icon style="margin-right: 5px">
            <CopyDocument />
          </el-icon>
          {{ $t("modal.copy") }}
        </div>
        <a :href="`https://docs.google.com/document/d/${fileId}/export?format=docx`" download class="down">
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.DOWNLOAD)" v-if="world">
            <el-icon style="margin-right: 5px;transform: translateY(1px)" @click.stop="onDownload">
              <Download />
            </el-icon>
            {{ $t("modal.download") }}
        </div>
        </a>
        <div class="context-menu-inner" @click="onMenuClick(MENU_TYPE.DELETE)">
          <el-icon style="margin-right: 5px">
            <Delete />
          </el-icon>
          {{ $t("modal.delete") }}
        </div>
      </div>
    </div>
    <div v-show="menuPopupVisible && language" style="transform: translate(90px,11px);z-index: 99999">
      <div
        :class="{ 'context-menu-popup': !vertical, 'is-vertical': vertical }"
        :style="{ color: color }"
      >
        <div class="context-menu-inner" @click="()=> onLanguageChange(item.value)"
             v-for="(item) of useLanguageIdeaLab()" :key="item.value">
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { CopyDocument, Delete, Download, Edit, More } from "@element-plus/icons-vue";
import { ref } from "vue";
import { MENU_TYPE } from "./ENUM";
import langIcon from "@/assets/lang.png";
import { useLanguageIdeaLab } from "@/libs/useLanguageEnum";

withDefaults(
  defineProps<{
    color?: string;
    vertical?: boolean;
    language: boolean
    ppt?: boolean
    fileId?: string
    world?: boolean
    lang: "zh_hant" | "zh" | "en"
  }>(),
  {
    color: "#333",
    vertical: false,
    language: false,
    lang: "en",
    ppt: false
  }
);
const emit = defineEmits<{
  (event: "select", value: number): void;
  (event: "languageChange", value: "zh_hant" | "zh" | "en" | string): void;
}>();
const langEnum = {
  "en": "En",
  "zh_hant": "繁",
  "zh": "简"
};
const menuPopupVisible = ref(false);

const onMenuShow = () => {
  menuPopupVisible.value = !menuPopupVisible.value;
};
const onMenuClick = (type: number) => {

  emit("select", type);
};
const onLanguageChange = (value: string) => {
  emit("languageChange", value);
};
const onBlur = () => {
  setTimeout(() => {
    menuPopupVisible.value = false;
  }, 200);
};
</script>
<style scoped lang="scss">
@import "@/theme";

a.down {
  text-decoration: none;
  color: inherit;
  box-sizing: border-box;
}

.context-menu-wrapper-auto-width {
  width: auto !important;
  height: auto !important;

}

.context-menu-wrapper {
  position: relative;
  width: 20px;
  height: 20px;
  background-color: transparent;

  input {
    width: 20px;
    height: 20px;
    padding: 0;
    cursor: pointer;
    outline: none;
    background-color: transparent;
    border: none;

    &:hover {
      box-shadow: 1px 0 3px #d0d0d0;
    }
  }

  .context-menu-more {
    position: absolute;
    width: 20px;
    height: 20px;
    z-index: 5;
    pointer-events: none;
    top: 4px;
    left: 1px;
  }

  .context-menu-popup {
    position: absolute;
    z-index: 10;
    background-color: #f6f6f6;
    min-width: 120px;
    min-height: 40px;
    transform: translate(-100px, -130px);
    box-sizing: border-box;
    box-shadow: 2px 3px 8px #a8a8a8;
    border-radius: 6px;
    overflow: hidden;
    animation: pop; /* referring directly to the animation's @keyframe declaration */
    animation-duration: 0.2s; /* don't forget to set a duration! */
    animation-timing-function: ease-in-out;

    .context-menu-inner {
      padding: 10px 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #e1e1e1;
      font-size: smaller;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      a {
        text-decoration: none;

      }

      &:hover {
        background-color: $main-active-font-color;
        color: #fff;
        cursor: pointer;
      }
    }
  }

  .is-vertical {
    @extend .context-menu-popup;
    transform: translate(-90px, 0);
    animation-name: pop-vertical;

    .context-menu-inner {
      padding: 10px 10px;
      box-sizing: border-box;
      border-bottom: 1px solid #e1e1e1;
      font-size: smaller;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      color: #333;

      &:hover {
        background-color: $main-active-font-color;
        color: #fff;
      }
    }
  }
}

@keyframes pop {
  from {
    border-radius: 50%;
  }
  to {
    border-radius: 6px;
  }
}

@keyframes pop-vertical {
  from {
    border-radius: 50%;
  }
  to {
    border-radius: 6px;
  }
}

.vertical {
  transform: rotateZ(90deg);
}

.lang-icon {
  width: 12px;
}
</style>
