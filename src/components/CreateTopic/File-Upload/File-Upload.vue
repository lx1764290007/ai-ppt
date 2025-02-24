<template>
  <div class="upload-wrapper">
    <el-upload
      class="upload-container"
      drag
      action="#"
      :before-upload="onBeforeUpload"
      :multiple="false"
      @change="onChange"
    >
      <div style="transform: translateY(140px)">
        <el-icon class="upload-icon"><upload-filled /></el-icon>
        <div class="el-upload__text">拖动文件到这里 或<em> 点击上传</em></div>
        <div class="el-upload__tip">文件大小不超过<em> 60MB </em></div>
      </div>

      <!--      <template #tip>-->
      <!--        <div class="el-upload__tip">-->
      <!--          文件大小不超过60mb-->
      <!--        </div>-->
      <!--      </template>-->
    </el-upload>
    <div class="upload--loading-mask" v-if="loading">
      <el-icon class="icon__loading">
        <Loading />
      </el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Loading, UploadFilled } from "@element-plus/icons-vue";
import { ref, watch } from "vue";

const loading = ref(false);
const onBeforeUpload = () => false;

const onChange = (event: any) => {
  // const reader = new FileReader();
  // reader.onload = function(e: ProgressEvent<FileReader>){
  //   const file = e.target!!.result;
  //   console.log(file);
  // }
  //
  loading.value = true;
  console.log(event);
};

watch(loading, (newVal) => {
  if (newVal) setTimeout(() => (loading.value = false), 2000);
});
</script>
<style scoped lang="scss">
@import "@/theme";
.upload-wrapper {
  position: relative;
  .upload-container {
    :deep(.el-upload-dragger) {
      min-height: 460px;
    }
  }
  .upload-icon {
    color: #a6a6a6;
    font-size: 60px;
    margin-bottom: 30px;
  }
}
.upload--loading-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.icon__loading {
  font-size: 30px;
  color: $main-confirm-bg-color;
  animation: loading 2s infinite linear;
}
@keyframes loading {
  from {
    transform: rotateZ(0);
  }
  to {
    transform: rotateZ(720deg);
  }
}
</style>
