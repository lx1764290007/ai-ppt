<template>
  <div class="container" v-show="state===0" >
    <div class="row">

      <div>
        <el-button class="go-back-btn buttons-default" size="large" @click="()=> onBack()">
          <el-image :src="backIcon" fit="contain" alt="back" style="width: 20px" />
        </el-button>
        <el-input
          style="width: 250px;margin-right: 22px"
          size="large"
          prefix-icon="Search"
          class="default__input default__input--search"
          :placeholder="$t('universal.placeholder')"
          v-model="searchValue"
        >
        </el-input>
        <el-button size="large" type="primary"
                   @click="getData"
                   class="default__button-primary" style="width: 100px">
          {{ $t("universal.search") }}
        </el-button>
      </div>
      <div>
<!--        <el-button class="button" size="large" title="AI" @click="onAddPPT" :loading="addPPTLoading">-->
<!--          <img src="@/assets/add-ppt.png" alt="add_folder" class="icon " />-->
<!--        </el-button>-->
<!--        <el-button :class="{button:true, 'button-remove': removeAble}" size="large" :title="$t('universal.delete_mode')"-->
<!--                   @click="toggleRemoveAbleState"-->
<!--                   :type="removeAble? 'warning': 'danger'">-->
<!--          <img src="@/assets/delete.png" alt="add_folder" class="icon" />-->
<!--        </el-button>-->
        <el-button class="default__button-primary" size="large" type="primary"
                   :loading="addPPTLoading"
                   style="width: 120px"
                   :title="$t('ppt.createPpt')"
                   @click="onAddPPT" >
          <el-image :src="createPptIcon" fit="contain" class="create-ppt-icon" />
          {{$t('ppt.createPpt')}}
        </el-button>
      </div>
    </div>

    <div class="ppt-list__container">
<!--      <div class="ppt-list-back">-->
<!--        <img src="@/assets/back.png" alt="back" class="icon img" @click="onBack" />-->
<!--        <span class="split-dash">|</span>-->
<!--        <span style="cursor: pointer;font-size: smaller;color: #505050" @click="onBack">{{ folder.themeName }}</span>-->
<!--      </div>-->
      <div class="ppt-list__wrapper">
      <div class="tab-pane" @click.self="pptPreviewItem = null">
        <div  @click.prevent.stop ="()=>openPreview(it)" @dblclick.prevent.stop="toGoogleSlide(it.pptid, it.gptJson)" :class="{'panes-item':true,'panes-item-active':pptPreviewItem?.pptid === it?.pptid}"
              v-for="(it,index) of dataSource"
              :title="it?.pptname"

              :key="index">
<!--          <div class="tabs-item">-->
<!--            <el-icon class="delete-icon" v-show="removeAble" @click.stop="onRemovePPT(it.id, index)">-->
<!--              <CircleCloseFilled />-->
<!--            </el-icon>-->
<!--            <img src="@/assets/PPT.png" alt="ppt" class="folder" />-->
<!--            <input v-model="it.pptname"  @click.stop :placeholder="$t('universal.placeholder')"-->
<!--                   @change="onUpdateName(it.pptid, $event.target.value)" class="folder-name" />-->
<!--          </div>-->
          <div :class="{'tabs-item':true,'tabs-item-without-bs':pptPreviewItem?.pptid === it?.pptid}"  >
            <!--            <el-icon class="delete-icon" v-show="enableRemove" @click.stop="onRemoveFolder(it.id)">-->
            <!--              <CircleCloseFilled />-->
            <!--            </el-icon>-->
            <!--            <img src="@/assets/folder.png" alt="folder" class="folder" @click.prevent.self="onNavigate(it.themeName, it.id ,it.pptList)" />-->
            <!--            <input v-model="it.themeName"-->
            <!--                   class="folder-name"-->
            <!--                   placeholder="输入名称"-->
            <!--                   @change="onUpdateFolderName(it.id, $event.target.value)" />-->
            <el-image :src="it.pptImg" alt="image"
                      class="item-cover" fit="cover" />
            <div class="item-info" @click.stop>
              <div style="display: flex;flex-flow: column;justify-content: flex-start;align-items: flex-start">
                <span  :title="it.pptname" style="text-align:left;width: 180px;display: inline-block;overflow: hidden;white-space: nowrap;text-overflow: ellipsis">{{it.pptname}}</span>
                <span  style="color:#5e5e5e;font-size: smaller;">{{dayjs(it.createtime).format("YYYY-MM-DD HH:mm:ss")}}</span>
              </div>
              <ContextMenu @select="onContextSelect($event, it)" ppt />
            </div>
          </div>
        </div>
        <div class="panes-item"   @click.stop="onAddPPT" title="Ai PPT" :style="{pointerEvent:removeAble? 'none':'auto'}">
          <div class="tabs-item">
            <el-image :src="pptAddBg" alt="image"
                      class="item-cover" fit="fill" />
            <div class="item-info" style="cursor: pointer;height:49px;">
              <span style="">{{$t('ppt.new_ppt')}}</span>
            </div>
          </div>
        </div>
      </div>
        <div :class="{'ppt-preview':true, 'ppt-preview-show':pptPreviewItem}">
          <div class="ppt-preview-content" v-html="getPreview(pptPreviewItem?.pptOutline ||pptPreviewItem?.gptJson ,pptPreviewItem?.pptname)" v-show="pptPreviewItem">
          </div>
          <div class="preview-button" v-show="pptPreviewItem">
            <el-button type="primary" class="default__button-primary" style="width: 100px" @click.stop="toGoogleSlide(pptPreviewItem?.pptid, pptPreviewItem?.gptJson)">
              {{$t('ppt.enter')}}
            </el-button>
          </div>
        </div>

    </div>
    </div>
  </div>
  <LoadingComponent :show="loading" />
  <PPTEditor :subjectId="folder?.themeId" v-if="state!==0" :grade="grade" :grades="gradeList" @back="onChangeStateTo0" :ppt-name="activeItem.pptName" :ppt-id="activeItem.id" />
  <PptListEditor :visible="pptListEditorVisible"
                 :current-grade="grade"
                 @close="onClose"
                 :data="activeItem"
                 :grade-list="gradeList"/>
  <popup-component v-model:modal-value="showConfirm">
    <div class="confirm-wrapper">
         <span class="confirm-tip">
         <el-icon style="font-size: 20px;transform: translateY(3px);margin-right: 3px"><Warning /></el-icon>
           {{ $t("home.tips") }}
         </span>
      <span class="confirm-title">{{ $t("home.beforeDeleted") }}?</span>
      <el-space style="display: flex;margin-top: 30px;margin-left: 8px">
        <el-button class="buttons-primary" type="primary" :loading="deleteLoading" style="width: 90px" @click="()=>removePPT()">
          {{ $t("home.confirm") }}
        </el-button>
        <el-button class="buttons-default" @click="showConfirm = false" style="width: 90px;margin-right: 0">
          {{ $t("home.cancel") }}
        </el-button>
      </el-space>
    </div>
  </popup-component>
</template>
<script setup lang="ts">
import createPptIcon from "@/assets/create-ppt.png";
import backIcon from "@/assets/back.png";
import { inject, onMounted, ref, watch } from "vue";
import { ElMessageBox } from "element-plus";
import { oAlert } from "@/libs/useKeys";
import PPTEditor from "@vs/AI/PPT/PPT-Editor.vue";
import { useI18n } from "vue-i18n";
import { fetchAddPPT, fetchPPTAndThemeList, fetchRemovePPT, fetchUpdatePPT2 } from "@/http/ppt";
import type { Http } from "@/interface/Http.d.ts";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import { useUserInfo } from "@/stores/user";
import type { Code } from "@/interface/Login";
import ContextMenu from "@cs/Context-Menu/Context-Menu.vue";
import dayjs from "dayjs";
import { MENU_TYPE } from "@cs/Context-Menu/ENUM";
import PptListEditor from "@cs/PPT-Edit/PPT-Editor.vue"
import pptAddBg from "@/assets/ppt-add.png";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { Warning } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

interface DataObject {
  id: number;
  pptid: number;
  pptname: string;
  themeid: number;
  gptJson: string;
}

const { t } = useI18n();

const emit = defineEmits(["back"]);
const addPPTLoading = ref(false);
const loading = ref(false);
const pptPreviewItem = ref();
const pptListEditorVisible = ref(false);
const showConfirm = ref(false);
const props = withDefaults(defineProps<{
  folder: { themeName: string, themeId: number, pptList: DataObject[] }
  grade: number
  gradeList: any[]
}>(), {
  folder: () => {
    return {
      themeName: "back",
      themeId: 0,
      pptList: []
    };
  },
  gradeList: ()=> {
    return []
  }
});
const alertFn = inject(oAlert) as Function;
const removeAble = ref(false);
const dataSource = ref<{ pptname: string, id: number, pptid: number, subjectId: number, pptImg: string, gptJson: string,createtime:number }[]>([]);
const createAble = ref(true);
const searchValue = ref("");
const activeItem = ref<any>();
const toggleRemoveAbleState = () => removeAble.value = !removeAble.value;
const state = ref(0);
const userInfo = useUserInfo();
const deleteLoading = ref(false)
const router = useRouter();

const onAddPPT = async () => {
  if (removeAble.value) return;
  if (createAble.value) {
    loading.value = true;
    createAble.value = false;
    addPPTLoading.value = true;
    //@ts-ignore
    fetchAddPPT({
      //@ts-ignore
      subjectId: props.folder.themeId,
      userId: userInfo.getUserInfo.user?.id
    }).then((res: { data: DataObject } & { code: Code })=>{

      if (res && res.code === 200) {
        //@ts-ignore
        dataSource.value.unshift(res.data);
        toPPTEditor({ id: res.data.pptid, label: res.data.pptname });
      }
    }).finally(()=>{
      loading.value = false;
      addPPTLoading.value = false;
    })
  } else {
    alertFn({
      title: t("universal.operate_too_frequently"),
      type: "warning"
    });
  }
};
const onContextSelect = (type: number, item: any) => {
  activeItem.value = item;

  switch (type) {
    case MENU_TYPE.EDIT:
     pptListEditorVisible.value = true;
      break;
    case MENU_TYPE.COPY:
     // onCopy(item.id);
      break;
    case MENU_TYPE.DELETE:
      onConfirmDelete();
      break;
  }
};
const onConfirmDelete = () => {
  showConfirm.value = true;
};
//@ts-ignore
const removePPT = async (id?: number = activeItem.value.id ) => {
  deleteLoading.value = true;
  const res = await fetchRemovePPT({
    id
  }).finally(()=>{
    deleteLoading.value = false;
    showConfirm.value = false;
  });
  if (res && res.code === 200) {
    const index = dataSource.value.findIndex(item => item.id === id);
    if(index>-1){
      dataSource.value.splice(index, 1);
    }
  }
};
const openPreview = (item:any)=>{
  pptPreviewItem.value = item;

}
const onClose = (res:boolean)=>{
  pptListEditorVisible.value = false;
  activeItem.value = undefined;
  if(res){
    getData()
  }
}
const toGoogleSlide = (id: number, json: string) => {

  const base_edit_url_start = "https://docs.google.com/presentation/d/";
  const base_edit_url_end = "/edit";
  let _json: any;

    try {
      _json = JSON.parse(json) as { title: string, content: any[]}[];
      const newJson = _json.map((item:{ title: string, content: any[] }) => {
        return {
          title: item.title,
          imageDescription: item.content?.find((it:any)=> Boolean(it.imageKeyWord))?.imageKeyWord || ""
        };
      });

      const resultParas = encodeURIComponent(JSON.stringify(newJson));
      const url = `${base_edit_url_start}${id}${base_edit_url_end}?data=${resultParas}`;
      if (removeAble.value) return;
      window.open(url, "_blank");
    } catch (e) {
      const url = `${base_edit_url_start}${id}${base_edit_url_end}?data=null`;
      if (removeAble.value) return;
      window.open(url, "_blank");
    }

};
const onBack = () => emit("back");
const toPPTEditor = (obj: { label: string, id: number }) => {

  if (removeAble.value) return;
  activeItem.value = {
    pptname: obj.label,
    id: obj.id
  }
  state.value += 1;
};
const openMessage = (fn: Function) => {
  ElMessageBox.confirm(
    t("universal.delete_tips"),
    "Warning",
    {
      confirmButtonText: t("universal.confirm"),
      cancelButtonText: t("universal.cancel"),
      type: "warning"
    }
  )
    .then(() => {
      fn();
    })
    .catch(() => {
      console.log(1);
    });
};
const onChangeStateTo0 = () => state.value = 0;

const getData = async () => {
  loading.value = true;
   fetchPPTAndThemeList({
    gradeId: props.grade,
    userId: userInfo.getUserInfo.user?.id,
    pptName: searchValue.value,
     //@ts-ignore
    subjectId: props.folder.themeId
  }).then((res:Http.Response<any>) => {
     if (res && res.code === 200) {
       //dataSource.value.length = 0;
       dataSource.value = res.data.pptList;
       // for (let i = 0; i < item.pptList.length; i++) {
       //   dataSource.value.push({
       //     label: item.pptList[i].pptname,
       //     id: item.pptList[i].pptid,
       //     pptId: item.pptList[i].id,
       //     json: item.pptList[i].gptJson
       //   });
       // }
     }
   }).finally(()=>{
     loading.value = false;
   })
};
// const onUpdateName = (id: number, name: string) => {
//   fetchUpdatePPT2({
//     id: id,
//     pptName: name
//   });
// };
const previewIcon = new URL("@/assets/ppt-preview.png", import.meta.url).href;
const getPreview = (json?:string, name?:string)=>{

  if(json){
    const obj = JSON.parse(json);
    let h5 = `<div style="text-align: left;
color: #1368CE;
font-weight: bold;
display: flex;
padding-top: 20px;
border-bottom: 3px solid #0092FE;
flex-flow: row;
align-items: flex-end;
justify-content: space-between;
font-size: 18px;
padding-bottom: 8px;

position: relative;
background-color: #fff;
">
     <span>${name}</span>
     <img style="width: 60px;transform: translateY(8px) " src="${previewIcon}" alt="icon" />
</div>`;

    if(obj instanceof Array){
      let _h5 = "";
      obj.map((item:any)=>{
        _h5 += `<h4 style="margin-bottom: 5px;color: #43536C; margin-block-start: 12px;
 margin-block-end: 12px;">${item.title}</h4><p style="font-size: 14px;white-space: pre-wrap;">${item.content}</p>`;
      })
      return `${h5}<div class="preview-content" style="height: calc(100% - 60px - 30px);padding: 10px; box-sizing: border-box; background-color: #F3F3F3;overflow-y: auto">${_h5}</div>`;
    }
  }
  return `<h4 style='text-align: center;margin-top: 80%;color: #b2b2b2;'>${t("ppt.empty")}</h4>`
}
onMounted(() => {
  getData();
});
watch(createAble, (newState) => {
  if (!newState) {
    setTimeout(() => createAble.value = true, 8000);
  }
});
watch(addPPTLoading, (newState) => {
  if (newState) {
    setTimeout(() => addPPTLoading.value = false, 20000);
  }
});
watch(loading, (newState) => {
  if (newState) {
    setTimeout(() => loading.value = false, 20000);
  }
});
watch(state, (newState, oldState) => {
  if (newState === 0 && oldState === 1) {
    getData();
  }
});
</script>

<style scoped lang="scss">
@import "@/theme.scss";
.container {
  --item_width: 90px;
  height: 100%;
  ::-webkit-scrollbar {
    width: 5px;
    height: 8px;
    background-color: #eaeaea; /* or add it to the track */
  }
  /* Add a thumb */
  ::-webkit-scrollbar-thumb {
    background: #f8f8f8;
  }
}
.create-ppt-icon {
  width: 16px;
  margin-right: 5px;
}
.row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  .go-back-btn {
    margin-right: 20px;
    background-color: #fff;
    width: 40px;
  }
}

.icon {
  width: 40px;
  height: 40px;
}

.split-dash {
  color: #d5d5d5;
  padding: 0 5px 2px 5px;
}

.button {
  font-weight: 600;
  background: transparent;
  border: none;
  padding: 5px;
}

.border-card {
  margin-top: 20px;
  user-select: none;
}

.panes-item {
  display: inline-flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  position: relative;
  transition: background-color .3s;
  cursor: pointer;
  margin: 8px;
  padding: 2px 1px 2px 4px;
}

.panes-item:hover {
 // background-color: #E0EFFF;
}
.panes-item:active {
  //background-color: #d1d9e3;
}
.tabs-item-without-bs {
  box-shadow: none !important;
}
.tabs-item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  margin: 3px;
  border-radius: 12px;
  box-shadow: 4px 10px 10px 0 #BDC3D3;
  overflow: hidden;

  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 4px 10px 8px 0 #aeb3c2;
  }
}
.tabs-item:first-of-type {
  margin-left: 0;
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
  padding: 3px 10px;
  cursor: default;
  color: #43536C;
  background-color: #fff;
}
.panes-item-active {
  background-color: #1368CE !important;
  border-radius: 12px;
  overflow: hidden;
}
.tabs-item img:hover {
  cursor: pointer;
  transform: scale(1);
  transition: transform .2s;
}

.tabs-item img {
  width: var(--item_width);
  height: var(--item_width);
}

.folder-name, .item-label {
  width: 90px;
  text-overflow: ellipsis;
  word-wrap: unset;
  text-align: center;
  outline: none;
  border: none;
  font-size: 12px;
  letter-spacing: 1px;
  background-color: transparent;
  padding: 4px 2px 2px 2px;
  cursor: text;

}

.item-label {
  width: var(--item_width);
  font-size: 14px;
  font-weight: 600;
  user-select: none;

  -webkit-user-select: none; /* 针对 Chrome, Safari 和 Opera */
  -moz-user-select: none; /* 针对 Firefox */
  -ms-user-select: none; /* 针对 Internet Explorer 和 Edge */
}

.tab-pane {
  //display: flex;
  //flex-flow: row wrap;
  //justify-content: flex-start;
  //align-items: center;
  //display: flex;
  //justify-content: flex-start;
  //align-items: flex-start;
  //flex-flow: row wrap;
  //margin-top: 8px;
  box-sizing: border-box;
  flex: 3;
}

.delete-icon {
  position: absolute;
  z-index: 1;
  font-size: 16px;
  color: #f82f2f;
  left: calc(var(--item_width) + 10px);
  bottom: calc(var(--item_width) + 10px);
  cursor: pointer;
}

.delete-icon:hover {
  transform: scale(1.1);
  transition: transform .2s;
}

.ppt-add::before {
  content: "+";
  position: absolute;
  color: #fff;
  font-weight: bold;
  font-size: 20px;
  z-index: 1;
  margin-top: 3px;
  cursor: pointer;
  pointer-events: none;
}

.ppt-add2 {
  width: 90px;
  height: 94px;
  border: 2px solid #939393;
  box-sizing: border-box;
  cursor: pointer;
}

.ppt-add2:hover {
  box-shadow: #313131 0 0 3px inset;
}

.ppt-add2::before {
  content: "+";
  position: absolute;
  color: #494949;
  font-weight: bold;
  font-size: 40px;
  z-index: 1;
  margin-bottom: 0;
  cursor: pointer;
  pointer-events: none;
}

.ppt-list-back {
  height: 30px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid #efefef;
  padding: 0;
  color: #369ae2;
}

.ppt-list-back .img {
  width: 24px;
  height: auto;

  cursor: pointer;
}
.ppt-list__wrapper {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  height: calc(100vh - 60px - 20px - 56px);
  overflow-y: auto;
  .ppt-preview {
    flex: 0;
    min-height: 50%;
    max-height: 99%;
    //border: 1px solid #4f8dd5;
    background-color: #fff;
    overflow-y: hidden;
    box-sizing: border-box;
    padding: 0;
    transition: all .2s ease-in;
    position: relative;
    box-shadow: 0px 3px 7px 0px rgba(13,4,8,0.15);
    border-radius: 10px;
  }
  .ppt-preview-content {
    position: relative;
    color: #43536C;
    height: calc(100% - 60px - 30px);
    padding: 10px;
    overflow-y: hidden;
    .preview-content {
      height: 100%;
      background-color: #F3F3F3;
      overflow-y: auto;

    }
  }
  .preview-button {
    position: relative;
    text-align: center;
    background-color: rgba(255,255,255,.7);
    backdrop-filter: blur(5px);

  }
  .ppt-preview-show {
    flex: 1.2;
    padding: 0 10px;


  }
}
.ppt-list__container {

  margin-top: 15px;
  //padding-left: 10px;
  //padding-right: 10px;
  padding-bottom: 10px;
  box-sizing: border-box;
}

.button-remove {
  box-shadow: #b8281f 0 0 2px inset;
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