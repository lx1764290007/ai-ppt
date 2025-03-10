<template>
  <div class="container" v-show="state===0">
    <div class="row">
      <div>
        <el-input
          style="width: 250px;margin-right: 22px"
          size="large"
          clearable
          prefix-icon="Search"
          class="default__input default__input--search"
          :placeholder="$t('universal.placeholder')"
          v-model="searchValue"
        >
        </el-input>
        <el-button size="large"
                   @click="onGradeChange"
                   type="primary"
                   style="width: 100px;"
                   class="default__button-primary">
          {{$t('universal.search')}}
        </el-button>
      </div>
      <div class="right--items">
<!--        <el-button class="button" size="large" :loading="folderLoading" title="新建标签" @click="onAddPanes">-->
<!--          <img src="@/assets/add-tags.png" alt="add_tag" class="icon" />-->
<!--        </el-button>-->
        <el-button class="button default__button-primary" size="large" type="primary"
                   :loading="addFolderLoading"
                   style="width: 120px"
                   :title="$t('ppt.new_folder')"
                   @click="onAddFolder" :disabled="panes.length<1">
            {{$t('home.home_item_line4')}}
        </el-button>
<!--        <el-button :class="{button:true, 'button-remove': removeAble}" size="large" :title="$t('universal.delete_mode')"-->
<!--                   @click="toggleRemoveAbleState"-->
<!--                   :type="removeAble? 'warning': 'danger'">-->
<!--          <img src="@/assets/delete.png" alt="delete" class="icon" />-->
<!--        </el-button>-->
      </div>
    </div>
    <tab-component :data-source="panes"
                   @remove="removeTab"
                   ref="tabComponentRef"
                   v-model:active-value="tab"
                   :enable-remove="removeAble"
                   :list="folderList"
                   :grade-list="getGradeList"
                   :loading="addFolderLoading"
                   @edit="onEditAble"
                   @update-theme-name="onThemeUpdate"
                   @add-folder="onAddFolder"
                   @update="(event:boolean)=> event && onGradeChange()"
                   @remove-theme="onRemoveFolder"
                   @navigate="onNext"
                   @on-copy="onCopy"
                   @change="onGradeChange" />


    <LoadingComponent :show="loading || folderLoading || addFolderLoading" />
    <el-empty v-if="panes.length<1" style="margin-top: 100px" />
    <classification-component :current-grade="getCurrentTabId"
                              :grade-list="getGrades"
                              ppt
                              :visible="addFolderVisible"
                              @close="onClose"   />
  </div>
  <PPTList v-if="state===1"
           :grade-list="getGrades"
           :grade="getCurrentTabId"
           :subject-name="''"
           :folder="folder" @back="onBack" />

</template>
<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref, watch } from "vue";
import PPTList from "@vs/AI/PPT/PPT-List.vue";
import { useI18n } from "vue-i18n";

import {  fetchDelTheme,  fetchTagUpdate } from "@/http/ppt";
import { useUserInfo } from "@/stores/user";
import {  fetchGradeList, fetchRemoveGrade } from "@/http/grade";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import type { Http } from "@/interface/Http.d.ts";
import TabComponent from "@cs/Tab/Tab-Component.vue";
import { fetchTopicCopy, fetchTopicDelete, fetchTopicList } from "@/http/topic";
import type { TopicOverview } from "@/interface/TopicOverview";
import ClassificationComponent from "@cs/Classification/Classification-Component.vue";


interface DataObject {
  id: number
  pptid: number
  pptname: string
  themeid: number
}
const { t,locale } = useI18n();
const addFolderVisible = ref(false);
const folderLoading = ref(false);
const folderList = ref<any[]>([]);
const addFolderLoading = ref(false);
const loading = ref(false);
let panes = reactive<{ id: number, label: string,currentId?: number, editable?: boolean, originGrade?: number }[]>([]);
const tab = ref<number>(1);
const folder = ref<{ themeName: string; themeId: number, pptList:DataObject[] }>({ themeName: "", themeId: 0, pptList: [] });
const searchValue = ref("");
const folderFetchLoading = ref(false);

const userInfo = useUserInfo();
const tabComponentRef = ref<typeof TabComponent>();

const getGradeList = async () => {
  loading.value = true;
  const data: Http.Response<any> = await fetchGradeList({
    userId: userInfo.getUserInfo.user?.id,
    page: 1,
    pageSize: 100
  });
  loading.value = false;
  panes.length = 0;
  if(data.code === 200) {
    for (let i = 0; i < data.data?.length; i++) {
      //@ts-ignore
      panes.push({ id: data.data[i].grade, currentId: data.data[i].id, label: locale.value === 'zh_hant'? data.data[i].gradeName + t('grade.grade'):t('grade.grade') + data.data[i].gradeName, editable: false,originGrade: data.data[i].gradeName});
    }
    tab.value = panes[0]?.id;
  }
};
const state = ref(0);
const removeAble = ref(false);


const removeTab = (value: number) => {
  const handler = () => {
    onRemoveGrade(value);
  };
  openMessage(handler);
};
const getCurrentTabId = computed(()=>{

  return panes.find(it=> it.id === tab.value)?.currentId;
})
const onEditAble = (index: number) => {
  panes[index].editable = true;
};
const onAddFolder = () => {
  addFolderVisible.value = true;
};
const onGradeChange = ( ) => {
  loading.value = true;
  fetchTopicList({
    userId: userInfo?.getUserInfo?.user?.id,
    gradeId: panes.find(it=> it.id === tab.value)?.currentId,
    subjectName: searchValue.value
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.code === 200) {

      folderList.value = res.data?.map((it: { themename: string, id: number }) => {
        return {
          ...it,
          themeName: it.themename,
          loading: false,
        };
      });
      // dataSource.value = res.data.map(it => {
      //   return {
      //     ...it,
      //     loading: false
      //   };
      // });
    }
  }).finally(() => {
    loading.value = false;
    folderFetchLoading.value = false;

  });
  //@ts-ignore
  // fetchPPTAndThemeList({
  //   gradeId: tab.value as number,
  //   userId: userInfo.getUserInfo.user?.id,
  //   themeName: searchValue.value,
  // }).then((res: any) => {
  //   if (res.code === 200) {
  //     folderList.value = res.data?.list.map((it: { themename: string, id: number, pptList:DataObject[] }) => {
  //       return {
  //         themeName: it.themename,
  //         id: it.id,
  //         pptList: it.pptList
  //       };
  //     });
  //   }
  // }).finally(() => {
  //   folderFetchLoading.value = false;
  //   loading.value = false;
  // });
};
const getGrades = computed(()=> {
  return panes.map(it=> {

    return {
      ...it,
      label: it.originGrade,
      id: it.currentId
    }
  })
})
const onRemoveFolder = (id: number) => {
  onThemeRemove(id);
};
const onCopy = (id:number) => {
  const index = folderList.value.findIndex(it => it.id === id);
  if (index > -1) {
    folderList.value[index].loading = true;
  }
  fetchTopicCopy({
    subjectId: id
  }).then((res: Http.Response<TopicOverview>) => {
    if (res.code === 200) {
      folderList.value.push({
        ...res.data,
        loading: false
      });
    }
  }).finally(() => {
    index > -1 && (folderList.value[index].loading = false);
  });
};
const onBack = () => state.value -= 1;
const openMessage = (fn: Function) => {
  return

};
const onNext = (themeName:string, themeId: number, item:DataObject[]) => {

  folder.value = {
    themeName,
    themeId,
    pptList: item
  }
  state.value += 1;
};

const onRemoveGrade = (value: number) => {
  fetchRemoveGrade({
    userId: userInfo.getUserInfo.user?.id,
    grade: value
  }).then((res: any) => {
    if (res && res.code === 200) {
      const idx = panes.findIndex(item => item.id === value);
      panes.splice(idx, 1);
      if (tab.value === value) {
        tab.value = panes[0]?.id;
      }
    }
  });
};
const onThemeUpdate = (id: number, value: string) => {
  fetchTagUpdate({
    id,
    themeName: value,
    userId: userInfo.getUserInfo.user?.id
  }).catch((e => {
    console.error(e);
  }));
};
const onThemeRemove = (id: number) => {
  const index = folderList.value.findIndex(item => item.id === id);
  if(index>-1){
    folderList.value[index].loading = true;
  }
  fetchTopicDelete({
    subjectId: id
  }).then((res: Http.Response<undefined>) => {
    if (res.code === 200) {
      if (index > -1) {
        folderList.value[index].loading = false;
        folderList.value.splice(index, 1);
      }
    }
  }).catch(() => {
    if (index > -1) {
      folderList.value[index].loading = false;
    }
  })
  fetchDelTheme({ id }).then((res: any) => {
    if (res && res.code === 200) {
      onGradeChange();
    }

  });
};
const onClose = (result:boolean)=> {
  console.log(result)
  if(result){
    onGradeChange();
  }
  addFolderVisible.value = false;
}
defineExpose({
  folder
});
watch(loading, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      loading.value = false;
    }, 8000);
  }
});
watch(tab, (newValue) => {
  if (newValue !== 0 && newValue) {
    onGradeChange();
  }
});
watch(folderLoading, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      folderLoading.value = false;
    }, 8000);
  }
});
watch(folderFetchLoading, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      folderFetchLoading.value = false;
    }, 8000);
  }
});
onBeforeMount(async () => {
  await getGradeList();
  if (panes[0]) {
    tab.value = panes[0].id;
    onGradeChange();
  }
});
</script>

<style scoped lang="scss">
@import "@/theme";
.container {
  --item_width: 90px;
  height: 100%;
}

.row {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
}

.icon {
  width: 40px;
  height: 40px;
}

.button {
  font-weight: 600;
  border: none;
  padding: 5px;
}

.border-card {
  margin-top: 20px;
  user-select: none;
}

.panes-item {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.tabs-item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  margin: 10px 10px;

}

.tabs-item img:hover {
  cursor: pointer;
  transform: scale(1.1);
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
  padding: 0 2px 2px 2px;
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
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: center;
}

.delete-icon {
  position: absolute;
  z-index: 1;
  font-size: 16px;
  color: #e31d1d;
  left: calc(var(--item_width) + 20px);
  bottom: calc(var(--item_width) + 10px);
  cursor: pointer;
}

.delete-icon:hover {
  transform: scale(1.1);
  transition: transform .2s;
}

.pane-loading {
  position: absolute;
  left: calc(50% - 15px);
  top: calc(50% - 15px);
  z-index: 1;
  color: #369ae2;
  font-size: 30px;
  animation: loading 2s infinite linear;
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
}

.button-remove {
  box-shadow: #b8281f 0 0 2px inset;
}
</style>