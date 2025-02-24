<template>
  <el-dialog v-model="show"
             append-to-body
             :title="$t('cropper.title')"
             width="650"
             @close="onClose" show-close
             :close-on-press-escape="false" :close-on-click-modal="false">
    <div style="position: relative" v-if="!rebuild">
      <!--      <div class="v-tools">-->
      <!--        <div-->
      <!--          :class="{ item: true, 'tools-active': activeId === item.id }"-->
      <!--          v-for="(item, index) in tools"-->
      <!--          :key="index"-->
      <!--          @click="onChange(item.id)"-->
      <!--        >-->
      <!--          <span :class="item.className"></span>-->
      <!--          <span class="label">{{ item.label }}</span>-->
      <!--        </div>-->
      <!--      </div>-->
      <vue-picture-cropper
        :width="600"
        :height="600 * 3 / 4"

        style="width: 600px;height: calc(600px * 3 / 4);"
        :boxStyle="{
          width: '600px',
          height: 'calc(600px * 3 / 4)',
          position: 'relative',
          backgroundColor: 'transparent',
          margin: 'auto'
        }"
        :img="pictureUrl"

        :options="{
          viewMode: 1,
          dragMode: 'crop',
          outputType: 'png',
          width: 600,
          height: 600 * 3 / 4,
          zoom: 1,

          zoomOnWheel: false,
          canMove: false,
           centerBox: true,
           autoCropArea: 0,
           movable: false,
           scalable: true,
           zoomable: false,
           zoomOnTouch: false,
        }"
        outputType="png"
        :zoom="1"
        @ready="ready"
      />
      <div class="loading__mask" v-if="loading">
        <el-icon class="icon-loading">
          <Loading />
        </el-icon>
      </div>
      <loading-component :show="loading"></loading-component>
      <div class="slider-block">
        <img src="@/assets/zoom_1.png" alt="zoom_1" @click="setZoomByClick(0)" />
        <el-slider v-model="zoom" @change="onZoomChange" />
        <img src="@/assets/zoom_2.png" alt="zoom_2" @click="setZoomByClick(1)" />
      </div>
    </div>
    <template #footer>
      <div class="footer-wrapper">
        <el-button @click="onClose"
                   class="buttons-default"
                   size="large"
                   style="width: 100px;">{{$t('cropper.cancel')}}
        </el-button>
        <el-button @click="onCropperHandle"
                   class="buttons-primary"
                   size="large"
                   :loading="handleLoading || loading"
                   style="width: 100px;">{{$t('cropper.crop')}}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import VuePictureCropper, { cropper, type PresetModeOptions } from "vue-picture-cropper";
import { Loading } from "@element-plus/icons-vue";
import { fetchFileUpload } from "@/http/question";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    pictureUrl?: string;
  }>(),
  {
    visible: false
  }
);

const tools = [
  {
    label: "方形",
    className: "square",
    id: 1,
    aspectRatio: 1
  },
  {
    label: "横向",
    className: "vertical",
    id: 2,
    aspectRatio: 4 / 3
  },
  {
    label: "纵向",
    className: "horizontal",
    id: 3,
    aspectRatio: 9 / 16
  },
  {
    label: "圆形",
    className: "circle",
    id: 4,
    aspectRatio: 1
  }
];
const activeId = ref(1);
const show = ref(false);
const handleLoading = ref(false);

const emit = defineEmits<{
  (event: "update:visible", value?: boolean): void;
  (event: "done", value?: string): void;
}>();
const rebuild = ref(false);
const loading = ref(true);
const zoom = ref(0);
watch(() => props.visible, (value) => {
  show.value = value;
  if (value) {
    rebuild.value = false;
  }
  if (!value) {
    loading.value = !value;
  }
});
const setZoomByClick = (value: number) => {
  if (value === 0) {
    zoom.value = 0;
    cropper?.scale(1, 1);
  } else {
    zoom.value = 100;
    cropper?.scale(3, 3);
  }

};
const ready = () => {
  setTimeout(()=> {
    loading.value = false;
  }, 500)
};
const onClose = () => {
  emit("update:visible");
  nextTick(() => {
    cropper?.destroy();
    rebuild.value = true;
    activeId.value = tools[0].id;
  });
};

const onCropperHandle = async () => {
  if (tools.find((item) => item.id === activeId.value)!!.className === "circle") {
    const canvas = cropper?.getCroppedCanvas({
      width: 200,
      height: 200,
      imageSmoothingQuality: "high"
    });
    // 使用 canvas API 处理黑色区域
    const context = canvas?.getContext("2d");
    if (context && cropper && canvas) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas!!.width, canvas!!.height);

      // 2. 创建圆形路径
      context.beginPath();
      context.arc(100, 100, 100, 0, 2 * Math.PI, false);
      context.clip(); // 应用圆形路径作为裁剪区域

      // 3. 绘制图像（图像会在圆形裁剪区域内显示）
      context.drawImage(cropper.getCroppedCanvas(), 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // 判断白色（可以根据需要调整阈值）
        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
          // 将透明度设置为 0
          data[i + 3] = 0;
        }
      }

      // 将修改后的像素数据放回 Canvas
      context.putImageData(imageData, 0, 0);
      const url = canvas.toDataURL("image/png");
      const _url = convertBase64ToBlobUrl(url);
      const _remoteFile = await uploadFile(_url);
      _remoteFile && emit("done", _remoteFile);
    }

  } else {
    const blob = await cropper?.getBlob();

    // const _url = convertBase64ToBlobUrl(url as string);

    const _remoteFile = await uploadFile(blob as Blob);
    emit("done", _remoteFile);
  }
  emit("update:visible");
};

function convertBase64ToBlobUrl(base64: string, mimeType = "image/png") {

  // Step 1: 解码 Base64 数据为二进制数据
  const byteCharacters = window.atob(base64.split(",")[1]); // 去掉 Base64 的头部 `data:image/png;base64,`
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 1024) {
    const slice = byteCharacters.slice(i, i + 1024);
    const byteNumbers = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  // Step 2: 创建 Blob 对象
  return new Blob(byteArrays, { type: mimeType });

}


const uploadFile = async (file: File | Blob) => {
  handleLoading.value = true;
  const _formData = new FormData();
  _formData.append("file", file);
  const _result: Http.Response<string> = await fetchFileUpload(_formData).catch((e:any)=> {
    console.log(`${e}`);
  });
  handleLoading.value = false;
  return _result?.data;
};
const onChange = (id: number) => {
  activeId.value = id;
  const asp = tools.find((item) => item.id === id)?.aspectRatio;
  if (asp) {
    if (asp > 0) {
      cropper?.setAspectRatio(asp);
    } else {
      nextTick(cropper?.reset);
    }
  }
};
const onZoomChange = (value: number) => {
  cropper?.scale(1 + value / 50, 1 + value / 50);
};
const presetMode: PresetModeOptions = computed(() =>
  tools.find((item) => item.id === activeId.value)!!.className === "circle"
    ? {
      mode: "round",
      width: 200,
      height: 200,
      backgroundColor: "#f8f8f8"
    }
    : {
      mode: "fixedSize",
      width: 270,
      height: 270,
      backgroundColor: "#f8f8f8"
    }
) as PresetModeOptions;

watch(() => props.visible, (value) => {
  show.value = value;
  if (!props.visible) {
    zoom.value = 0;
  }
});

watch(show, (value) => {
  emit("update:visible", value);
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.loading__mask {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: space-around;
  align-items: center;

  .icon-loading {
    font-size: 30px;
    color: #8a17d5;
    animation: trans360 1s infinite linear;
  }
}

@keyframes trans360 {
  from {
    transform: rotateZ(0);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.button {
  box-shadow: rgba(0, 0, 0, 0.25) 0px -4px inset;
  background: rgb(19, 104, 206);
  color: rgb(255, 255, 255);
  border-radius: 4px;
  width: 100px;
}

.v-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  --width: 24px;
  --height: 24px;
  --border: 2px solid #565656;
  width: 320px;
  margin: 0 auto 15px auto;

  .tools-active {
    color: #fff !important;
    text-decoration: none !important;
    background-color: $main-confirm-bg-color-active !important;
    --border: 2px solid #ffffff;

    &:hover {
      color: #fff !important;
    }
  }

  .item {
    width: calc(var(--width) + 50px);
    height: calc(var(--height) + 10px);
    background-color: #fff;
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border-radius: 12px;

    &:hover {
      cursor: pointer;
      color: $main-confirm-bg-color;
      text-decoration: underline;
    }

    &:active {
      color: $main-confirm-bg-color;

    }
  }

  .label {
    height: 20px;
    font-size: 12px;
    color: inherit;
    margin-left: 5px;
  }

  .v-tools .tools-active {

  }

  .square {
    width: calc(var(--width));
    height: calc(var(--height));
    border: var(--border);
    padding: 4px;
    box-sizing: border-box;
  }

  .vertical {
    width: calc(var(--width));
    height: calc(var(--height) - 10px);
    border: var(--border);
    padding: 4px;
    box-sizing: border-box;

  }

  .horizontal {
    width: calc(var(--width) - 10px);
    height: calc(var(--height));
    border: var(--border);
    padding: 4px;
    box-sizing: border-box;
  }

  .circle {
    width: calc(var(--width));
    height: calc(var(--height));
    border-radius: 50%;
    box-sizing: border-box;
    border: var(--border);
  }
}

.footer-wrapper {
  width: 100%;
  text-align: center;
}

.slider-block {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-content: center;
  align-items: center;
  justify-items: center;
  padding-top: 5px;

  img {
    width: 20px;
    cursor: pointer;

    &:first-of-type {
      justify-self: end;
      margin-right: 15px;
    }

    &:last-of-type {
      justify-self: start;
      margin-left: 15px;
    }
  }
}
</style>
