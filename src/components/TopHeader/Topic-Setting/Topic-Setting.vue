<template>
  <div class="topic-setting-wrapper">
<!--    <el-input-->
<!--      :placeholder="$t('header.input')"-->
<!--      v-model="inputValue"-->
<!--      readonly-->
<!--      class="input__default_theme"-->
<!--      size="large"-->
<!--    />-->
    <el-button class="button buttons-default" size="default" style="width: 150px;height:40px;margin-top: 15px" @click.stop="onOpenModal">
      {{$t('header.setting')}}
    </el-button>
<!--    <div class="setting-button" @click.stop="onOpenModal">-->
<!--      -->
<!--    </div>-->
  </div>
  <popup-component :width="600" v-model:modal-value="modalVisible" center>
    <div class="modal-wrapper">
      <div class="subject-editor__header">
        <span class="subject-editor__header--title">
          {{$t('header.editQuestion')}}
        </span>
        <el-icon class="subject-editor__close" @click="onClose">
          <Close />
        </el-icon>
      </div>
      <!--      <div style="position: relative;transform: translateY(-40px)">-->
      <!--        <el-image class="img" :src="imageUrl" fit="contain" mode="aspectFill"></el-image>-->
      <!--        <el-icon class="file-refresh" v-show="showImageRefresh"><Refresh /></el-icon>-->
      <!--        <input type="file" class="file-upload" @change="onFileChange"-->
      <!--               title="替换图片"-->
      <!--               @mouseenter="showImageRefresh = true"-->
      <!--               @mouseleave="showImageRefresh = false" />-->
      <!--      </div>-->
      <div class="right-side" style="transform: translateY(-10px);">
        <div class="right-side__item">
          <span class="sub--title">
            {{$t("header.topicName")}}
          </span>
          <el-select v-model="subjectId"
                     filterable
                     remote
                     allow-create
                     :remote-method="onSearch"
                     size="large"
                     class="input__default_theme" style="width: 70%">
            <el-option :value="item.id" :label="item?.subjectName" v-for="(item,i) of subjectList" :key="i" />
          </el-select>
        </div>
        <div class="right-side__item">
          <span class="sub--title">
            {{$t("header.questionBank")}}
          </span>
          <el-input
            v-model="inputValue"
            :placeholder="$t('header.input')"
            class="input__default_theme"
            size="large"
            style="width: 70%"
          />
        </div>
      </div>
      <div class="footer-buttons">
        <el-button class="buttons-primary" size="large" @click="onConfirm" :loading="loading">
          {{$t("header.confirm")}}
        </el-button>
        <el-button class="buttons-default" size="large" style="width: 150px" @click="onClose">
          {{$t('header.cancel')}}
        </el-button>
      </div>
    </div>
   <loading-component :show="loading" />
  </popup-component>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { Close } from "@element-plus/icons-vue";
import PopupComponent from "@cs/Popup/Popup-Component.vue";
import { useRoute, useRouter } from "vue-router";
import { fetchTopicList, fetchTopicTypeList, fetchTopicTypeSearch } from "@/http/topic";
import { useUserInfo, useUserInfoStore } from "@/stores/user";
import type { TopicOverview, TopicType } from "@/interface/TopicOverview";
import type { Http } from "@/interface/Http";
import { fetchSearchTopic, fetchUpdateQuestionSubjectAndType } from "@/http/question";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { useTopicStore } from "@/libs/usePinia";
import type { QuestionItem } from "@/interface/Topic";

const modalVisible = ref(false);
const inputValue = ref("--");
const route = useRoute();
const router = useRouter();
const subjectId = ref<number>();

let subjectIdOrigin: number | undefined = undefined, subjectTypeIdOrigin: number | undefined = undefined;
const subjectTypeId = ref<number>();
const subjectTypeList = ref<TopicType[]>([]);
const topicStore = useTopicStore();
const initSubjectIdAndTypeId = () => {
  if (route.query?.key) {
    try {
      //@ts-ignore
      const createData = window.sessionStorage.getItem(route.query.key);
      //@ts-ignore
      subjectId.value = JSON.parse(decodeURIComponent(createData))?.[0].subjectId;
      //@ts-ignore
      subjectTypeId.value = JSON.parse(decodeURIComponent(createData))?.[0].subjectTypeId;

    } catch (e:any) {
      console.log(e.message);
    }

  } else {
    //@ts-ignore
    subjectId.value = parseInt(route.query?.subjectId);
    //@ts-ignore
    subjectTypeId.value = parseInt(route.query?.subjectTypeId);
  }
  subjectIdOrigin = subjectId.value;
  subjectTypeIdOrigin = subjectTypeId.value;
};
const userStore = useUserInfo();
const getSubjectTypeList = () => {
  fetchTopicTypeList({
    subjectId: subjectId.value,
    userId: userStore.getUserInfo?.user?.id,
    type: route.query?.type || 1
  }).then((res: Http.Response<TopicType[]>) => {
    if (res.code === 200) {
      subjectTypeList.value = res.data;
      inputValue.value = res.data.find(it => it.id === subjectTypeId.value)?.typeName || "";
    }
  });
};

const defaultImage = new URL("@/assets/logo@2x.png", import.meta.url).href;
const subjectList = ref<TopicOverview[]>([]);
const imageUrl = ref(defaultImage);

const onOpenModal = () => {
  modalVisible.value = true;
};

const loading = ref(false);
const getSubject = () => {
  fetchTopicList({
    gradeId: topicStore.get() instanceof Array? (topicStore.get() as Array<QuestionItem>)[0]?.gradeId:undefined,
    userId: userStore.getUserInfo?.user?.id
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.code === 200) {
      subjectList.value = res.data;
    }
  });
};
const onFileChange = (file: any) => {
  const f = file.target.files[0];
  const reader = new FileReader();
  reader.onload = (e: any) => {
    imageUrl.value = e.target.result;
  };
  reader.readAsDataURL(f);
};
const onClose = () => modalVisible.value = false;
const onSearch = (value:string)=> {
  if(!value.trim()) return
  const item = topicStore.getActiveItem();
  fetchSearchTopic({
    subjectName:value||subjectId.value,
    gradeId: item?.gradeId
  }).then((res:Http.Response<TopicOverview[]>) => {
    if (res?.code === 200) {
      subjectList.value = res.data.concat(subjectList.value);
    }
  })

}
const onConfirm = () => {
  if (inputValue.value.trim()) {
    const item = topicStore.getActiveItem();

    loading.value = true;
    fetchTopicTypeSearch({
      //@ts-ignore
      subjectName: isNaN(subjectId.value)? subjectId.value: subjectList.value.find(it=> it.id === subjectId.value)?.subjectName,
      gradeId: item?.gradeId,
      subjectTypeName: inputValue.value.trim()
    }).then((res: Http.Response<{ id: number,subjectId:number }>) => {
      if (res.code === 200) {
        if (res.data.id) {
          subjectTypeId.value = res.data.id;
          updateInfo(res.data.subjectId);
        }
      }
    }).finally(()=> {
      loading.value = false;
    })
  }
};
const updateInfo = (subId:number) => {
  loading.value = true;
  fetchUpdateQuestionSubjectAndType({
    subjectId: subId,
    subjectTypeId: subjectTypeId.value,
    subjectIdOld: subjectIdOrigin,
    subjectTypeIdOld: subjectTypeIdOrigin
  }).then((res:Http.Response<any>)=>{
    if (res.code === 200) {
      updateAllItemHandle(subId);
    }
  }).finally(()=> {
    loading.value = false;
  })
};

const updateAllItemHandle = (subId:number)=> {
  loading.value = true;
   const originData = topicStore.get() as QuestionItem[];
   topicStore.set(originData.map(it=> {
      return {
        ...it,
        subjectId: subId,
        subjectTypeId: subjectTypeId.value
      }
   }));
   if(route.query.subjectId && route.query.subjectTypeId){
     router.replace({
       name: "question-generation",
       query: {
         page: route.query.page,
         pageSize: route.query.pageSize,
         subjectTypeId: subjectTypeId.value,
         subjectId: subId,
         id: topicStore.getActiveItem()?.id
       }
     });
   }  else if(route.query.key){
     const createData = window.sessionStorage.getItem(route.query.key);
     const newData = JSON.parse(decodeURIComponent(createData as string));

     if(newData instanceof Array){
       newData.forEach(item=> {
         item.subjectId = subjectId.value;
         item.subjectTypeId = subjectTypeId.value;
       })
     }
     const newDataString = encodeURIComponent(JSON.stringify(newData));
     router.replace({
       name: "question-generation",
       query: {
         createData: newDataString
       }
     })
   }
   loading.value = false;
  onClose();
}
onBeforeMount(() => {
  initSubjectIdAndTypeId();
  getSubject();
  getSubjectTypeList();
});
</script>
<style scoped lang="scss">
@import "@/theme";


.right-side__item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
}

$img-width: 184px;
.topic-setting-wrapper {
  position: relative;
  color: #111;
  width: auto;


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
  height: 260px;
  width: 340px;

  .footer-buttons {
    position: absolute;
    bottom: 30px;
  }

  .subject-editor__header {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 24px;

    .subject-editor__header--title {
      font-size: 18px;
      font-weight: bold;
      color: #111;
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
    border: 1px solid #ccc;
    margin-top: 30px;

  }

  .sub--title {
    margin-block-start: 10px;
    margin-block-end: 10px;
    font-weight: normal;
    font-size: 15px;
    margin-right: 14px;
    width: 100px;
    text-align: right;
    color: #282828;
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
  right: 1px;
  bottom: 6px;
  background-color: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  pointer-events: none;
  width: $img-width;
  height: calc($img-width / 4 * 3);

}

.file-upload {
  position: absolute;
  width: $img-width;
  height: calc($img-width / 4 * 3);
  right: 1px;
  bottom: 6px;
  overflow: hidden;
  opacity: 0;
  cursor: pointer;
}
</style>