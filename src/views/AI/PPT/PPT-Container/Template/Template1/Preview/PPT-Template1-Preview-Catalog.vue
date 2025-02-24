<template>
  <div class="preview-item-wrapper" >
    <div class="preview-item-content">
      {{$t('ppt.preview_catalog')}}
    </div>
  </div>
</template>
<script setup lang="ts">

</script>
<style scoped>
.preview-item-wrapper {
  height: 100%;
  box-sizing: border-box;
  background-image: url("@/assets/ppt/template/1/2_02.png");
  background-repeat: no-repeat;
  background-size: cover;
  position: relative;
}
.preview-item-content {
  text-align: right;
  transform: translateY(60px);
  display: block;
  width: 100%;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  padding-right: 15px;
  box-sizing: border-box;
}
</style>