<template>
  <div :class="{'image-preview-wrapper':true, hidden: !visible}" @click.self="onClose">
    <div class="image-preview-close" @click="onClose">
      <el-icon class="image-preview-close-icon">
        <Close />
      </el-icon>
    </div>
    <div class="image-preview">
      <img alt="picture" :src="src" :style="{transform: `scale(${scale})`}" />
    </div>
  </div>


</template>
<script setup lang="ts">
import { Close } from "@element-plus/icons-vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

withDefaults(defineProps<{
  src: string
  visible: boolean
}>(), {
  src: "",
  visible: false
});
const scale = ref(1);
const emit = defineEmits(['update:visible']);
const onClose = ()=> emit('update:visible');


const handleWheel = (event:WheelEvent)=>{
  const deltaY = event.deltaY;
  if(deltaY < 0 && scale.value < 2.5) {
    scale.value += 0.1;
  } else if(deltaY > 0 && scale.value > 0.3){
    scale.value -= 0.1;
  }
}
onMounted(()=>{
  window.addEventListener('wheel', handleWheel);
})
onBeforeUnmount(()=>{
  window.removeEventListener('wheel', handleWheel);
})
</script>
<style scoped>
.image-preview-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.image-preview {
  position: relative;
  transition: transform 0.3s ease-in-out;
  transform: scale(1);
}
.hidden {
  display: none;
  transform: scale(0.6);
}
.image-preview-close {
  position: absolute;
  background-color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  right: 50px;
  top: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-sizing: border-box;
  z-index: 50;
}
.image-preview-close:hover {
  cursor: pointer;
}
.image-preview-close-icon {
  color: #333;
  font-size: 24px;
}
.image-preview img {
  transition: transform 0.3s ease-in-out;
}
</style>