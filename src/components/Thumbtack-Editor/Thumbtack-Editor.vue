<template>
  <el-dialog
    v-model="show"
    class="no-padding"
    width="850"
    append-to-body
    title="新增正确区域"
    @close="onClose"
    show-close
  >
    <div class="editor-tools-container">
      <div
        :class="{ 'editor-tools-item': true, 'tools-active': tool === too.id }"
        v-for="too of tools"
        :key="too.id"
        @click="onTypeChange(too.id)"
      >
        <span :class="too.className"></span>
        <span class="editor-tools-item-title">{{ too.label }}</span>
      </div>
      <span class="editor-tools-item-eraser" @click.stop="onClear"></span>
    </div>
    <div
      style="
        position: relative;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div style="position: relative">
        <el-image
          :src="pictureUrl"
          class="el__image"
          :style="{ width: width + 'px', height: height + 'px' }"
          alt="picture"
          fit="contain"
        />
        <canvas
          ref="canvas"
          :width="width"
          :height="height"
          style="position: relative; z-index: 10"
        ></canvas>
        <el-icon
          class="delete-icon"
          :style="iconPositionStyle"
          v-show="deleteIconVisible"
          @click="onDeleteIconHandleClick"
        >
          <Delete></Delete>
        </el-icon>
      </div>
    </div>

    <div class="loading__mask" v-if="loading">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
    </div>
    <template #footer>
      <div class="footer-wrapper">
        <el-button class="buttons-primary" size="large" @click="onFinish">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { Delete, Loading } from "@element-plus/icons-vue";
import { createReact, deleteReact, removeAllReactEvent } from "./createReact";
import {
  createCircle,
  deleteCircle,
  removeAllCircleEvent
} from "@cs/Thumbtack-Editor/createCircle";
import {
  createPolygon,
  deletePolygon,
  removeAllPolygonEvent,
  removePointAndLine
} from "@cs/Thumbtack-Editor/createPolygon";
import { Canvas } from "fabric";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    jsonData: JSON | null;
    pictureUrl?: string;
    width: number;
    height: number;
  }>(),
  {
    visible: false
  }
);

const emit = defineEmits<{
  (event: "update:visible", value?: boolean): void;
  (event: "change", value: string): void;
  (event: "done", value: JSON): void;
}>();
const show = ref(props.visible);
const tool = ref(1);

const tools = [
  {
    label: "矩形",
    id: 1,
    className: "editor-tools-item-square"
  },
  {
    label: "圆形",
    id: 2,
    className: "editor-tools-item-circle"
  },
  {
    label: "多边形",
    id: 3,
    className: "editor-tools-item-polygon"
  }
];
watch(props, (values) => {
  show.value = values.visible;
  if (props.jsonData === null) {
    onClear();
  } else if (fabricCanvas) {
    fabricCanvas.loadFromJSON(props.jsonData, () => {
      setTimeout(() => {
        fabricCanvas?.renderAll();
      }, 200);
    });
  }
});
const onClear = () => {
  removeAllCircleEvent();
  removeAllReactEvent();
  removeAllPolygonEvent();
  removePointAndLine();
  fabricCanvas?.clear();
  createDefaultReact();
};
const onClose = () => {
  //fabricCanvas && fabricCanvas.dispose();
  emit("update:visible");
};
const deleteIconVisible = ref(false);
const iconPositionStyle = reactive<{ left: string; top: string }>({ left: "0", top: "0" });
const loading = ref(false);
const canvas = ref<HTMLCanvasElement>();

const toggleDeleteIconHandle = (value: boolean = false) => {
  deleteIconVisible.value = value;
};
const setDeleteIconHandle = (style: { left: number; top: number }) => {
  iconPositionStyle.left = style.left + 6 + "px";
  iconPositionStyle.top = style.top - 4 + "px";
};
const onDeleteIconHandleClick = () => {
  if (tool.value === 1) {
    deleteReact();
  } else if (tool.value === 2) {
    deleteCircle();
  } else {
    deletePolygon();
  }
  deleteIconVisible.value = false;
};
let fabricCanvas: Canvas | null = null;
const beginHandle = () => {
  if (canvas.value) {
    fabricCanvas = new Canvas(canvas.value, {
      width: canvas.value.width,
      height: canvas.value.height,
      selection: true // 禁用 Fabric.js 默认的多选
    });
    if (props.jsonData) {
      fabricCanvas.loadFromJSON(props.jsonData, () => {
        setTimeout(() => {
          fabricCanvas?.renderAll();
        }, 200);
      });
    }
    createDefaultReact();
  } else {
    setTimeout(() => {
      beginHandle();
    }, 600);
  }
  loading.value = Boolean(!canvas.value);
};
const createDefaultReact = () => {
  if (canvas.value && fabricCanvas) {
    if (tool.value === 1) {
      createReact(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    } else if (tool.value === 2) {
      createCircle(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    } else {
      createPolygon(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    }
  }
};
const onTypeChange = (id: number) => {
  tool.value = id;
  if (canvas.value && fabricCanvas) {
    removeAllCircleEvent();
    removeAllReactEvent();
    removeAllPolygonEvent();
    if (tool.value === 1) {
      createReact(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    } else if (tool.value === 2) {
      createCircle(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    } else {
      createPolygon(canvas.value, toggleDeleteIconHandle, setDeleteIconHandle, fabricCanvas);
    }
    removePointAndLine();
  }
};
const onFinish = () => {
  if (fabricCanvas) {
    const data: JSON = fabricCanvas.toJSON();
    emit("done", data);
    onClose();
  }
};
onMounted(() => {
  beginHandle();
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.no-padding {
  box-sizing: content-box;

  :deep(.el-dialog__body) {
    padding-top: 5px !important;
  }
}

.loading__mask {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;

  backdrop-filter: blur(5px);
  display: flex;
  justify-content: space-around;
  align-items: center;

  .loading-icon {
    font-size: 30px;
    color: #298ded;
    animation: trans360 1s infinite linear;
  }

  @keyframes trans360 {
    from {
      transform: rotateZ(0);
    }
    to {
      transform: rotateZ(360deg);
    }
  }
}

.delete-icon {
  position: absolute;
  z-index: 10;
  font-size: 16px;
  color: #3d3d3d;
  background-color: #fff;
  padding: 6px;
  border-radius: 50%;
  left: 0;
  top: 0;
  cursor: pointer;

  &:hover {
    color: #d9335a;
  }
}

.el__image {
  width: 607px;
  height: 405px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.editor-tools-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  --width: 32px;
  --height: 32px;
  --border: 1px solid #ccc;
  width: 240px;
  margin: 0 auto 0 auto;
  transform: translateY(-20px);

  .tools-active {
    color: #fff !important;
    text-decoration: none !important;
    background-color: $main-confirm-bg-color-active-opacity !important;
  }

  .editor-tools-item {
    width: calc(var(--width) + 40px);
    height: calc(var(--height) + 30px);
    padding-top: 10px;
    background-color: #fff;
    display: flex;
    flex-flow: column nowrap;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    .editor-tools-item-square {
      border: 2px solid #5e5e5e;
      width: var(--width);
      height: var(--height);
      box-sizing: border-box;
    }

    .editor-tools-item-circle {
      border: 2px solid #5e5e5e;
      width: var(--width);
      height: var(--height);
      box-sizing: border-box;
      border-radius: 50%;
    }

    .editor-tools-item-polygon {
      width: var(--width);
      height: var(--height);
      background-image: url("@/assets/demo/polygon_with_border.svg");
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
    }

    &:hover {
      cursor: pointer;
      color: $main-confirm-bg-color;
      text-decoration: underline;
    }

    &:active {
      color: #194a80;
    }
  }
}

.footer-wrapper {
  width: 100%;
  text-align: center;
}

//eraser
.editor-tools-item-eraser {
  width: var(--width);
  height: var(--height);
  background-image: url("@/assets/demo/eraser.svg");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  margin-left: 15px;
  cursor: pointer;
  position: relative;
  margin-bottom: 10px;
  color: #333;

  &:after {
    content: "擦除";
    position: absolute;
    bottom: 0;
    transform: translateY(20px);
  }

  &:hover {
    color: $main-confirm-bg-color;
  }
}
</style>
