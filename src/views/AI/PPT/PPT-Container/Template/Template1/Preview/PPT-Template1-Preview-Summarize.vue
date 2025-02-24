<template>
  <div class="preview-item-wrapper" >
    <div class="preview-item-content">
      {{$t('ppt.preview_summarize')}}
    </div>
  </div>
</template>
<script setup lang="ts">

</script>
<style scoped>
.preview-item-wrapper {
  height: 100%;
  box-sizing: border-box;
  background-image: url("@/assets/ppt/template/1/2_07.png");
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
.preview-item-content {
  text-align: center;
  transform: translateY(40px);
  display: block;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
}

</style>