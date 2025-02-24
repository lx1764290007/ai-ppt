<template>
  <div class="tab__component-wrapper">

    <el-scrollbar style="height: auto" ref="scroll" @scroll="onScrollEnd" @mouseenter="showArrow = true"
                  @mouseleave="showArrow = false">
      <div class="tab__component-wrapper-header">
        <el-icon class="tab__component-icon-left" @click="onScrollHandle(-1, $event)" v-if="showArrow">
          <ArrowLeft />
        </el-icon>
        <el-icon class="tab__component-icon-right" @click="onScrollHandle(1,$event)" v-if="showArrow">
          <ArrowRight />
        </el-icon>
        <div :class="{'tab__component-wrapper-header-item':true,'default__button-active':activeValue === item.id}"
             v-for="(item,index) of getGrades" :key="item" @click="onSelect(item.id)">
          <!-- @dblclick="onEdit(index, item.label)" -->
                    <el-icon class="tab__component-icon-delete" @click.stop="onDelete(item.label)" v-if="enableRemove">
                      <Delete />
                    </el-icon>

          <span v-if="!item.editable">
            {{ locale === 'en'? $t('grade.grade') + item.label : item.label + $t('grade.grade')  }}
          </span>
          <input v-else
                 ref="gradeInput"
                 autocomplete="off"
                 @blur="onUpdate(index, $event)"
                 placeholder="输入" class="tab__component-header-input" />
        </div>
      </div>
    </el-scrollbar>
    <div class="tab__component-workspace-container">
      <div class="tab__component-workspace">
        <div class="panes-item" v-loading="it.loading" v-for="(it,index) of list" :key="index"
             @click.stop="onNavigate(it.subjectName, it.id ,it.pptList)">
          <div class="tabs-item"  >
            <!--            <el-icon class="delete-icon" v-show="enableRemove" @click.stop="onRemoveFolder(it.id)">-->
            <!--              <CircleCloseFilled />-->
            <!--            </el-icon>-->
            <!--            <img src="@/assets/folder.png" alt="folder" class="folder" @click.prevent.self="onNavigate(it.themeName, it.id ,it.pptList)" />-->
            <!--            <input v-model="it.themeName"-->
            <!--                   class="folder-name"-->
            <!--                   placeholder="输入名称"-->
            <!--                   @change="onUpdateFolderName(it.id, $event.target.value)" />-->
            <el-image :src="it.subjectImg" alt="image"
                      class="item-cover" fit="cover" />
            <div class="item-info" @click.stop>

              <span :title="it.subjectName? it.subjectName : locale === 'en'? it.subjectNameEn : locale === 'zh_hant'? it.subjectNameHk : it.subjectNameCn"
                style=";text-align:left;;width: 180px;display: inline-block;overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                {{it.subjectName? it.subjectName : locale === 'en'? it.subjectNameEn : locale === 'zh_hant'? it.subjectNameHk : it.subjectNameCn}}
              </span>
              <ContextMenu @select="onContextSelect($event, it)" />
            </div>
          </div>
        </div>
        <div class="panes-item" @click="onAdd" >
          <div class="tabs-item">

            <el-image :src="'https://dreamlab.oss-us-east-1.aliyuncs.com/subject.png'" alt="image"
                      class="item-cover" fit="fill" />
            <div class="item-info">
              <span style="">{{$t('home.home_item_line4')}}</span>

          </div>
          </div>
        </div>
      </div>
    </div>
    <classification-component :current-grade="grade"
                              :grade-list="getGrades"
                              :visible="showTopicEdit"
                              ppt
                              @close="onClose" :data="activeItem" />
    <popup-component v-model:modal-value="showConfirm">
      <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("home.tips") }}
         </span>
        <span class="confirm-title">{{ $t("home.beforeDeleted") }}?</span>
        <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
          <el-button class="buttons-primary" type="primary" style="width: 90px" @click="()=>onDelete()">
            {{ $t("home.confirm") }}
          </el-button>
          <el-button class="buttons-default" @click="showConfirm = false" style="width: 90px;margin-right: 0">
            {{ $t("home.cancel") }}
          </el-button>
        </el-space>
      </div>
    </popup-component>
        <loading-component :show="loading" />
  </div>

</template>
<script setup lang="ts">
import { ArrowLeft, ArrowRight, Delete, Warning } from "@element-plus/icons-vue";
import { computed, nextTick, ref } from "vue";
import { ElMessage, ElScrollbar } from "element-plus";

import ContextMenu from "@cs/Context-Menu/Context-Menu.vue";
import type { TopicOverview } from "@/interface/TopicOverview";
import { MENU_TYPE } from "@cs/Context-Menu/ENUM";
import ClassificationComponent from "@cs/Classification/Classification-Component.vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";

import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import { useI18n } from "vue-i18n";

interface DataObject {
  id: number;
  pptid: number;
  pptname: string;
  themeid: number;
}

const props = withDefaults(defineProps<{
  dataSource: { id: number, label: string, _id: number, editable?: boolean,originGrade?:number }[]
  enableRemove?: boolean
  grade: number

  list: any[]
  activeValue: number
  loading?: boolean
}>(), {
  dataSource: () => {
    return [];
  },
  list() {
    return [];
  },
  grade: 0,

  loading: false,
  enableRemove: false
});
const emit = defineEmits<{
  (ev: "remove", value: string): void
  (ev: "change", value: string): void
  (ev: "edit", value: number): void
  (ev: "update", boolean): void
  (ev: "update:activeValue", value: number): void
  (ev: "add-folder"): void
  (ev: "update-theme-name", index: number, value: string): void
  (ev: "on-copy", id:number): void
  (ev: "remove-theme", id: number): void
  (ev: "navigate", themeName: string, themeId: number, value: DataObject[]): void
}>();
const scroll = ref<InstanceType<typeof ElScrollbar>>();
const {locale} = useI18n();
const showArrow = ref(false);
let activeItem = ref<TopicOverview | undefined>();
const gradeInput = ref<HTMLInputElement[]>();
const showTopicEdit = ref(false);
const showConfirm = ref(false);
let currentScrollLeft: number = 0;
const onScrollEnd = (value: { scrollLeft: number }) => {
  currentScrollLeft = value.scrollLeft;
};
const onScrollHandle = (value: number, event: Event) => {
  if (scroll.value) {
    if (value > 0) {
      scroll.value.setScrollLeft(currentScrollLeft + 81);
    } else {
      scroll.value.setScrollLeft(currentScrollLeft - 81);
    }
  }
  event.stopPropagation();
};
const getGrades = computed(()=> {
  return props.dataSource.map(it=> {

    return {
      ...it,
      label: it.originGrade
    }
  })
})
const onSelect = (item: number) => {
  if (props.activeValue === item) return;
  emit("update:activeValue", item);
};
const onEdit = (index: number, value: string) => {
  emit("edit", index);
  nextTick(() => {
    if (gradeInput.value) {
      gradeInput.value[0]?.focus();
      gradeInput.value[0].value = value;
    }
  });
};
const onClose = (data:boolean)=> {
  showTopicEdit.value = false;
  emit("update", data)
}
const onDelete = () => {
  onRemoveFolder(activeItem.value?.id)
 // emit("remove", activeItem.value?.id);
};
const onUpdate = (index: number, event: InputEvent) => {
  //emit("update", index, (event.target as HTMLInputElement).value);
};
const onCopy = (id:number) => {
   emit("on-copy",id);
};
const onAdd = () => {
  emit("add-folder");
};
const onRemoveFolder = (id: number) => {
  emit("remove-theme", id);
  showConfirm.value = false;
};
const onUpdateFolderName = (id: number, value: string) => {
  if (value) {
    emit("update-theme-name", id, value);
  } else {
    ElMessage.warning("名称不能为空");
  }
};

const onContextSelect = (type: number, item: TopicOverview) => {
  activeItem.value = item;
  switch (type) {
    case MENU_TYPE.EDIT:
      showTopicEdit.value = true;
      break;
    case MENU_TYPE.COPY:
      onCopy(item.id);
      break;
    case MENU_TYPE.DELETE:
      onConfirmDelete();
      break;
  }
};
const onConfirmDelete = () => {
  showConfirm.value = true;
};
const onNavigate = (themeName: string, themeId: number, item: DataObject[]) => {

  emit("navigate", themeName, themeId, item);
};
</script>
<style scoped lang="scss">
@import "@/theme";

.tab__component-wrapper {
  position: relative;
  margin-top: 20px;
  height: calc(100% - 60px);
}

.tab__component-wrapper-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  box-sizing: border-box;
  padding-bottom: 12px;
}

.tab__component-wrapper-header-item {
  flex-shrink: 0;
  background-color: #fff;
  color: #43536C;
  font-size: 15px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  min-width: 100px;
  transition: all .2s;
  position: relative;
  overflow: visible;
  text-align: center;
  border: 1px solid #DBE0ED;
}

.tab__component-wrapper-header-item:hover {
  background-color: $main-active-font-hover-color;
  color: #f1f1f1;
}

.tab__component-wrapper-header-item + .tab__component-wrapper-header-item {
  margin-left: 12px;
}

.tab__component-icon-left {
  position: absolute;
  left: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}

.tab__component-icon-right {
  position: absolute;
  right: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}

.tab__component-icon-delete {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  font-size: 14px;
  cursor: pointer;
  color: red;
}

.tab__component-workspace {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-flow: row wrap;
  margin-top: 8px;
}

.panes-item {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
  margin-left: 10px;
  margin-right:  10px;
}

.panes-item:hover  {

  cursor: pointer
}

.tabs-item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  margin: 0;
  border-radius: 12px;
  box-shadow: 4px 10px 10px 0 #BDC3D3;
  overflow: hidden;
  transition: box-shadow 0.3s;
  color: #43536C;
  &:hover {
    box-shadow: 4px 10px 8px 0 #aeb3c2;
  }
}
.tabs-item + .tabs-item {
  margin-left: 15px;
}
.item-cover {
  width: 240px;
  height: 180px;
  display: flex;
}

.item-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  cursor: default;
}

.tabs-item img:hover:not(img[alt='folder-add']) {
  cursor: pointer;
  transform: scale(1.1);
  transition: transform .2s;
}

.tabs-item img:where(img[alt='folder-add']) {
  width: calc(var(--item_width) - 10px) !important;
  height: calc(var(--item_width) - 10px) !important;
  cursor: pointer;
}

.tabs-item img {
  width: var(--item_width);
  height: var(--item_width);
}

.folder-name {
  width: 90px;
  text-overflow: ellipsis;
  word-wrap: unset;
  text-align: center;
  outline: none;
  border: none;
  font-size: 12px;
  letter-spacing: 1px;
  background-color: transparent;
  padding: 2px 2px 2px 2px;

}

.folder-name:focus {
  box-shadow: #36b0e2 0 0 3px inset;
}

.delete-icon {
  position: absolute;
  z-index: 1;
  font-size: 18px;
  color: #f82f2f;
  left: calc(var(--item_width) + 10px);
  bottom: calc(var(--item_width) + 10px);
  cursor: pointer;
}

.delete-icon:hover {
  transform: scale(1.1);
  transition: transform .2s;
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
}

.tab__component-header-input {
  border: none;
  outline: none;
  padding: 3px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.5);
  max-width: 80px;
}

.tab__component-workspace-container {
  position: relative;
  overflow-y: auto;
  height: calc(100vh - 60px - 20px - 40px - 70px);
  box-sizing: border-box;
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