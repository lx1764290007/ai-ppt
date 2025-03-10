

<template>
  <teleport to="body">
  <div class="popup-wrapper" v-if="modalValue ||modelValue">
    <div class="popup-animate">
      <slot name="default"></slot>
    </div>
  </div>
  </teleport>
</template>
<script setup lang="ts">
defineProps<{
  modalValue?: boolean
  modelValue?: boolean
}>()
defineEmits<{
  'update:modalValue'(value:boolean): void
  (event: "update:modelValue", value: boolean): void
}>()
</script>
<style scoped lang="scss">
.popup-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 101;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  .popup-animate {
    position: relative;
    animation-name: animate;
    animation-duration: .3s;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }

}
@keyframes animate {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }

}
</style>