<template>
  <div class="subscription-confirm " v-show="visible">
    <div class="subscription-confirm-container" :style="{width}">
      <div class="subscription-confirm--close">
        <el-icon class="subscription-confirm--close-icon" @click="toggleConfirm">
          <Close />
        </el-icon>
      </div>
      <div class="subscription-confirm--content" :style="{height:height}">
        <slot name="default">{{content}}</slot>
      </div>
      <div class="subscription-center--footer">
        <button class="subscription-confirm--button default__button-active"
                v-if="confirmText" @click="onConfirm">
          {{confirmText}}
        </button>
        <button class="subscription-confirm--button_cancel"
                v-if="cancelText" @click="onCancel">
          {{cancelText}}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Close } from "@element-plus/icons-vue";

const props = withDefaults(defineProps<{
  visible: boolean;
  cancelText?: string;
  confirmText?: string;
  content?: string;
  height?: number|string;
  width?: number|string;
}>(), {
  visible: false,
  content: "",
  width: '380px'
});

const emit = defineEmits<{
  (ev: "confirm"):void
  (ev: "cancel"):void
  (ev: "close"): void
  (ev: "update:visible",val:boolean):void
}>();
const toggleConfirm = () => {
  emit("update:visible", !props.visible)
  emit('close');
};
const onConfirm = ()=> {
  emit("confirm");
}
const onCancel = () => {
  emit("cancel")
}
</script>

<style scoped>
.subscription-confirm {
  position: fixed;
  z-index: 99;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.subscription-confirm-container {
  width: 380px;
  border-radius: 10px;
  background-color: #E8ECEF;
  padding: 5px 15px;

  animation: show-confirm .2s forwards ease-out;
}

.subscription-confirm--close {
  color: #222;
  font-size: 18px;
  text-align: right;
  display: block;
  font-weight: bold;
  padding-bottom: 10px;
}

.subscription-confirm--close-icon {
  cursor: pointer;
  padding: 5px;
}

.subscription-confirm--close-icon:hover {
  color: #838383;
}

.subscription-confirm--content {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes show-confirm {
  from {
    transform: scale(0.50);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.subscription-confirm--button, .subscription-confirm--button_cancel {
  border-radius: 5px;
  width: 120px;
  padding: 10px 0;
  border: none;
  outline: none;
  margin: 20px auto;
  cursor: pointer;
  display: block;
}

.subscription-confirm--button_cancel {
  background-color: #FF8123;
  color: #fff;
  box-shadow: 0px 5px 10px 0px rgba(255, 129, 35, 0.5);
}
.subscription-center--footer {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
}
.subscription-center--footer button + button {
  margin-left: 15px;
}

</style>


