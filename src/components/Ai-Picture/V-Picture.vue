<template>
  <el-dialog v-model="show" :title="$t('aiPicture.title')" show-close width="834" @close="onClose">
    <div class="dialog-wrap">
      <el-form @submit.prevent="onSearch" style="margin-bottom: 10px;width: 100%">
      <el-input :placeholder="$t('aiPicture.search')" size="large" max="30" class="input__default_theme"  v-model="inputSearch">
        <template #append>
          <el-icon class="search-button" @click="onSearch">
            <Search />
          </el-icon>
        </template>
      </el-input>
      </el-form>
      <div class="dialog-item" v-for="(item, i) of images" :key="i">
        <el-image class="img" :src="item.image" fit="contain" @error="()=>onError(i)" @click.self.passive.stop="onChose(item)" />

      </div>
      <el-empty :description="$t('aiPicture.no_data')" class="is-empty" v-if="!loading && images.length === 0"  />
    </div>
<!--    <template #footer>-->
<!--      <el-button type="text" @click="onChange">换一批</el-button>-->
<!--    </template>-->
    <loading-component :show="loading" />
  </el-dialog>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { fetchAIPhoto, fetchDownloadRemotePhoto } from "@/http/question";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { Search } from "@element-plus/icons-vue";


interface AiImage {
  image: string
  title: string
}
const props = withDefaults(
  defineProps<{
    visible: boolean;
    keywords?: string[]
  }>(),
  {
    visible: false
  }
);
const emit = defineEmits<{
  (event: "update:visible", value?: boolean): void;
  (event: "change", value:AiImage): void;
}>();
const images = ref<AiImage[]>([]);
const loading = ref(false);
const show = ref(props.visible);
const inputSearch = ref("");
watch(()=> props.visible, (value) => {
  show.value = value;
  if(props.keywords?.[0] && value){
    getAiPhotos(props.keywords[0])
  }

});
const onClose = () => {
  emit("update:visible");
};
const onChose = (item: AiImage) => {
  loading.value = true;
  fetchDownloadRemotePhoto({
    imageUrl: item.image
  }).then((response:Http.Response<string>) => {
    if(response.code === 200) {
      emit("change", {...item, image: response.data});
      nextTick(onClose);
    }
  }).finally(()=> loading.value = false)

};
const onSearch = ()=> {
  if(inputSearch.value.trim()){
    getAiPhotos(inputSearch.value.trim())
  }
}
const getAiPhotos = (key:string)=> {
  loading.value = true;
  fetchAIPhoto({
    imageDescription: key
  }).then((res:Http.Response<AiImage[]>)=> {
    if(res.code === 200) {
      images.value = res.data;
    }
  }).finally(()=> loading.value = false).catch(e=> console.log(e))
}
const onError = (index:number)=> {
  images.value.splice(index, 1);
}
</script>
<style scoped lang="scss">
.dialog-wrap {

  justify-content: flex-start;
  align-items: flex-start;
  flex-flow: row wrap;
  max-height: 550px;
  overflow-y: auto;
  min-height: 230px;
  display: inline-flex;
  width: 100%;
  .dialog-item {
    position: relative;
    margin: 5px 10px;
    cursor: pointer;

    //height: calc(280px / 4 * 3);

    transition: transform 0.2s;
    display: flex;
    border: 1px solid #e5e5e5;
    align-items: center;
    justify-content: space-around;
    &:hover {
      border: 1px solid #9f37da;
    }

    .img {
      width: 176px;
      height: 150px;
    }
  }
  .is-empty {
    margin: 0 auto;
    font-size: 16px;
    color: #333;

  }
  .search-button {
    cursor: pointer;
    font-size: 24px;
  }
}
</style>
