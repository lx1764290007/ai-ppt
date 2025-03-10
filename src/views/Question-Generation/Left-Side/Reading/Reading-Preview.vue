

<template>

  <div :class="['wrapper', activeItem? 'active':'', dataSource.layout === READING_QUESTION_LAYOUT.HORIZONTAL? 'layout2':'layout1' ]">
    <span class="the_title">{{$t('world.textTitle')}}</span>
    <div class="article">
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>
    <div class="image-preview">
      <el-image :src="dataSource?.questionImg" alt="preview" fit="contain" style="height: 100%" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { QuestionItem } from "@/interface/Topic";
import { READING_QUESTION_LAYOUT } from "@/enum";

defineProps<{ activeItem: boolean; dataSource: QuestionItem }>();
</script>
<style scoped lang="scss">
@use "@/theme.scss" as theme;

.active {
  box-shadow: theme.$main-bg-color 0 0 0 3px !important;
}
.layout1 {
  flex-flow: row nowrap;
}
.layout2 {
  flex-flow: row-reverse nowrap;
}
.wrapper {
  display: flex;

  align-items: center;
  justify-content: center;
  padding: 10px;
  height: 130px;
  width: 185px;
  background-color: #fff;
  position: relative;
  margin-bottom: 10px;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  margin-right: 3px;
  --width: 60px;
  gap: 10px;
  .the_title {
    position: absolute;
    right: 10px;
    top: 1px;
    font-size: smaller;
    color: #868686
  }
  &:hover {
    box-shadow: theme.$main-active-font-hover-color 0 0 0 3px;
  }

  .article {
    position: relative;
    height: 40px;
    display: flex;
    width: 50px;
    flex-flow: column nowrap;
    justify-content: space-around;
    align-items: center;

    .line {
      height: 2px;
      width: var(--width);
      background-color: theme.$question-main-line-background;
    }

  }
  .image-preview {
    height: 50px;
    width: var(--width);
    background-color: transparent;
    text-align: center;

  }
}
</style>