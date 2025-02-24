<template>

    <el-alert v-bind="attrs" class="vc-alert" closable show-icon @close="()=> $emit('close')" />

</template>

<script setup lang="ts">

export interface Attrs {
  effect?: "dark" | "light";
  title: string;
  type: "success" | "info" | "warning" | "error";
}

const attrs = withDefaults(defineProps<Attrs>(), {
  effect: "dark",
  type: "success",
  title: ""
});

</script>

<style scoped>
.vc-alert:deep(.el-alert__content) {
  padding-top: 5px;
}
.vc-alert:deep(.el-alert__close-btn) {
  transform: translateY(5px);
}
</style>
