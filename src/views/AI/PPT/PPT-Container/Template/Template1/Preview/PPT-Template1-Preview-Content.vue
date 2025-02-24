<template>
  <div class="preview-item-wrapper" >
    <div class="preview-item-content">
      {{$t('ppt.preview_content')}}
    </div>
  </div>
</template>
<script setup lang="ts">

</script>
<style scoped>
.preview-item-wrapper {
  height: 100%;
  box-sizing: border-box;
  background-image: url("@/assets/ppt/template/1/2_03.png");
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
.preview-item-content {
  box-sizing: border-box;
  transform: translateY(50px);
  display: block;
  width: 40%;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  position: absolute;
  z-index: 1;
  right: 10px;
  text-align: center;
}
</style>