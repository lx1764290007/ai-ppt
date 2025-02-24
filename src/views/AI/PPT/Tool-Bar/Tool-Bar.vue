

<template>
 <el-button-group class="el-button-group">
   <el-popover
     placement="bottom-start"
     :width="190"
     class="popover"
     trigger="click"
   >
     <template #reference>
       <el-button icon="Edit" style="position: relative"></el-button>
     </template>
      <div class="edit-items">
        <el-button size="small" >AI修改</el-button>
        <el-button size="small" @click="modifyHandle">手工修改</el-button>
      </div>
   </el-popover>
   <el-button icon="Delete"></el-button>
 </el-button-group>
</template>
<script setup lang="ts">

const emit = defineEmits(['modifyHandle'])
const modifyHandle = ()=> emit('modifyHandle');

</script>
<style scoped>
.el-button-group {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1;
}
.popover {
  height: 50px;
}
</style>