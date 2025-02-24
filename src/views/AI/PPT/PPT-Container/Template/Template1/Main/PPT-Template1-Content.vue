<template>
  <div class="content-container" data-template="export" data-prefix-sort="3" :data-after-sort="idx">
    <el-icon class="deleted-item" @click="handleDelete">
      <Delete />
    </el-icon>
    <div class="content-content" v-html="myTarget.item1">
    </div>
    <el-icon class="content-edit" @click="openDialog('item1')" v-if="!exporting">
      <Edit />
    </el-icon>
    <div class="content-title">
      <div v-html="myTarget.item2"></div>
      <el-icon class="content-title-edit" @click="openDialog('item2')" v-if="!exporting">
        <Edit />
      </el-icon>
    </div>

    <div class="img-wrapper">
      <el-popover
        placement="bottom-end"
        :width="255"
        :visible="picEditPopoverVisible"
      >
        <template #reference>
          <el-icon class="img-edit" @click="picEditPopoverVisible = !picEditPopoverVisible" v-if="!exporting">
            <Edit v-if="!picEditPopoverVisible" />
            <Close v-else />
          </el-icon>
        </template>
        <el-button-group v-if="!exporting">
          <el-button @click="onRemovePic" :disabled="!picUrl">
            {{$t('universal.delete')}}
          </el-button>
          <el-button>{{$t('universal.upload')}}</el-button>
          <el-button @click="onOpenAiDialog">{{$t('ppt.pick_AI_picture')}}</el-button>
        </el-button-group>
      </el-popover>
      <div class="img-container">
        <img class="img"
             :src="picUrl"
             v-if="picUrl"
             @click="handleImgPreviewToggle"
             alt="pic"
             :style="currentPicStyle"
             @load="onPicLoad"
             crossorigin="anonymous" />
      </div>

    </div>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('ppt.pick_AI_picture')"
    show-close
    append-to-body
    width="640">
    <div class="block">
      <el-image class="dialog-img"
                style="height: 120px;width:auto"
                v-for="(item, index) in demoPics"
                :key="index"
                @click="onChoose(item)"
                :src="item" fit="contain" />
    </div>
  </el-dialog>
  <EditorModal :h5="h5" :visible="visible" @close="onClose" @done="onDone" />
  <Teleport to="body" v-if="imgPreviewVisible">
    <ImagePreview v-model:visible="imgPreviewVisible" :src="picUrl" />
  </Teleport>
</template>
<script setup lang="ts">
import { Close, Delete, Edit } from "@element-plus/icons-vue";
import EditorModal from "@vs/AI/PPT/Editor/Editor-Modal.vue";
import { inject, reactive, ref } from "vue";
import { EXPORTING } from "@vs/AI/enum";
import ImagePreview from "@cs/Image-Preview/Image-Preview.vue";


const exporting = inject(EXPORTING);
const picEditPopoverVisible = ref(false);
const picUrl = ref("https://cdn.pixabay.com/photo/2023/05/09/01/47/gold-7980065_640.jpg");
const demoPics = ref(["https://cdn.pixabay.com/photo/2024/01/10/20/43/flowers-8500337_640.jpg", "https://cdn.pixabay.com/photo/2023/05/23/15/42/bengal-tiger-8013012_640.jpg", "https://cdn.pixabay.com/photo/2024/05/30/19/37/girl-8799169_640.jpg", "https://cdn.pixabay.com/photo/2022/02/11/23/09/san-francisco-7008147_640.jpg", "https://cdn.pixabay.com/photo/2024/07/13/07/40/cars-8891625_640.jpg", "https://cdn.pixabay.com/photo/2024/07/12/08/05/venice-8889871_640.jpg", "https://cdn.pixabay.com/photo/2022/05/19/01/34/bird-7206444_640.jpg", "https://cdn.pixabay.com/photo/2023/05/23/15/42/bengal-tiger-8013012_640.jpg", "https://cdn.pixabay.com/photo/2024/05/30/19/37/girl-8799169_640.jpg", "https://cdn.pixabay.com/photo/2022/02/11/23/09/san-francisco-7008147_640.jpg", "https://cdn.pixabay.com/photo/2024/07/13/07/40/cars-8891625_640.jpg", "https://cdn.pixabay.com/photo/2024/07/12/08/05/venice-8889871_640.jpg", "https://cdn.pixabay.com/photo/2022/05/19/01/34/bird-7206444_640.jpg", "https://cdn.pixabay.com/photo/2023/05/23/15/42/bengal-tiger-8013012_640.jpg", "https://cdn.pixabay.com/photo/2024/05/30/19/37/girl-8799169_640.jpg", "https://cdn.pixabay.com/photo/2022/02/11/23/09/san-francisco-7008147_640.jpg", "https://cdn.pixabay.com/photo/2024/07/13/07/40/cars-8891625_640.jpg", "https://cdn.pixabay.com/photo/2024/07/12/08/05/venice-8889871_640.jpg", "https://cdn.pixabay.com/photo/2022/05/19/01/34/bird-7206444_640.jpg", "https://cdn.pixabay.com/photo/2023/05/23/15/42/bengal-tiger-8013012_640.jpg", "https://cdn.pixabay.com/photo/2024/05/30/19/37/girl-8799169_640.jpg", "https://cdn.pixabay.com/photo/2022/02/11/23/09/san-francisco-7008147_640.jpg", "https://cdn.pixabay.com/photo/2024/07/13/07/40/cars-8891625_640.jpg", "https://cdn.pixabay.com/photo/2024/07/12/08/05/venice-8889871_640.jpg"]);
const dialogVisible = ref(false);
const currentPicStyle = ref({});
const imgPreviewVisible = ref(false);

const handleImgPreviewToggle = ()=> imgPreviewVisible.value = !imgPreviewVisible.value;

const onRemovePic = () => {
  picUrl.value = "";
  picEditPopoverVisible.value = false;
};
const props = defineProps<{ idx: number }>();

const onOpenAiDialog = () => {
  dialogVisible.value = !dialogVisible.value;
  picEditPopoverVisible.value = false;
};
const onChoose = (target: string) => {
  picUrl.value = target;
  dialogVisible.value = !dialogVisible.value;
};
const h5 = ref("");
const myTarget = reactive({
  item1: `人类聚落 - 末次冰期结束和人类聚落涌现的地理前提\r\n
史前时代 - 没有文字记载和充满传说的时代\r
大河文明的诞生 - 四大文明古国\r\n
海洋文明的源头 - 爱琴海文明`,
  item2: "<h2>石器、青铜和铁器时代</h2>"
});
const activeTarget = ref<null | "item1" | "item2">(null);
const emit = defineEmits(["delete"]);
const onDone = (value: string) => {
  h5.value = value;
  if (activeTarget.value != null) {
    myTarget[activeTarget.value] = value;
  }
};
const visible = ref(false);

const openDialog = (target: "item1" | "item2") => {
  visible.value = !visible.value;
  activeTarget.value = target;
  h5.value = myTarget[target];
};

const onClose = () => visible.value = false;
const handleDelete = () => emit("delete", props.idx);
const onPicLoad = (event: any) => {
  if (event.target) {
    const { width, height } = (event.target as HTMLElement).getBoundingClientRect();
    if (width / (height || 1) >= 4 / 3) {
      currentPicStyle.value = {
        height: "auto",
        width: "100%"
      };
    } else {
      currentPicStyle.value = {
        height: "100%",
        width: "auto"
      };
    }
  }
};
</script>
<style scoped>
.content-container {
  background-image: url("@/assets/ppt/template/1/2_03.png");
  background-repeat: no-repeat;
  background-size: cover;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  --color: #3e3e3e;
  --content-border-color: #5E8C54FF;
}

.content-content {
  display: block;
  width: calc(var(--width) * 0.33);
  position: absolute;
  right: calc(var(--width) * 0.125);
  top: 10%;
  z-index: 1;
  border: 1px solid #808080;
  box-sizing: border-box;
  padding: 3px;
  height: 80%;
  text-align: justify;
  letter-spacing: 1px;
  word-wrap: anywhere;
  white-space: pre-line;
}

.content-edit {
  position: absolute;
  right: calc(var(--width) * 0.125);
  color: var(--color);
  cursor: pointer;
  top: 4%;
}

.img-wrapper {
  position: absolute;
  left: calc(var(--width) * 0.039);
  top: 21%;
  width: calc(var(--width) * 0.455);
  height: 65%;
  overflow: hidden;

}

.img {
  display: block;
  margin: 0 auto;
  height: auto;
  object-fit: contain;

}

.img-edit {
  position: absolute;
  z-index: 2;
  right: 0;
  cursor: pointer;
}

.block {
  max-height: 500px;
  overflow-y: auto;
}

.block .dialog-img {
  margin: 5px;
  transition: transform .2s;
  display: inline-block;
}

.block .dialog-img:hover {
  transform: scale(1.1);
}

.dialog-img {
  margin: 5px;
}

.content-title {
  position: absolute;
  z-index: 1;
  right: 2.5%;
  border: 1px solid var(--content-border-color);
  writing-mode: vertical-lr;
  letter-spacing: 1px;
  top: calc(50% - calc(var(--width) * 0.34) / 2);
  height: calc(var(--width) * 0.34);
  text-align: center;
  font-weight: 500;
  display: flex;
  justify-content: space-around;
  width: calc(var(--width) * 0.06);
  align-items: center;
}

.content-title-edit {
  position: absolute;
  z-index: 1;
  right: 0;
  top: 0;
  cursor: pointer;
}

h2 {
  font-size: 2vw;
}

.deleted-item {
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  color: #f61d33
}

.img-container {
  position: relative;
  height: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
</style>