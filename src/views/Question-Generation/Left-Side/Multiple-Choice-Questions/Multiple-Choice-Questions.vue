<template>
  <div :class="{ 'multiple-choice-question-wrapper': true, active: activeItem }">
    <div class="multiple-choice-question-content-left">
      {{ dataSource?.maxTime }}
    </div>
    <div class="multiple-choice-question-content">
      <div class="multiple-choice-question-content-title">
        {{ dataSource?.question }}
      </div>
      <div class="new-content">
        <div class="multiple-choice-question-content-img">
          <el-image
            class="img"
            :src="dataSource?.images?.[0].image"
            type="image/png"
            fit="contain"
            alt="preview"
            v-if="dataSource?.images?.[0].image"
          />
          <div v-else class="img-none">
            <el-icon>
              <Picture />
            </el-icon>
          </div>
        </div>

      <div class="multiple-choice-question-content-footer">
        <div class="multiple-choice-question-content-footer-demo" v-for="item of 4" :key="item"></div>
      </div>
    </div>
    </div>
  </div>
</template>
<script setup lang="ts">

import type { QuestionItem } from "@/interface/Topic";

defineProps<{ activeItem: boolean; dataSource: QuestionItem }>();
</script>

<style scoped lang="scss">
@import "@/theme.scss";

.multiple-choice-question-wrapper {
  height: $question-generation-aside-preview-item-height;
  width: calc($question-generation-left-side-width - 40px);
  background-color: $question-generation-aside-preview-item-bg;
  position: relative;
  margin-bottom: 10px;
  box-sizing: border-box;
  transition: all 0.2s ease-in-out;
  margin-right: 3px;

  &:hover {
    box-shadow: $main-active-font-hover-color 0 0 0 3px;
  }
}

.active {
  box-shadow: $main-bg-color 0 0 0 3px !important;
}

.multiple-choice-question-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
}
.new-content {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  height: 80%;
  gap: 5px;
}
.multiple-choice-question-content-left {
  position: absolute;
  text-align: right;
  top: calc(50% - 28px);
  left: 8%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border: 1px solid #e1e1e1;
  font-size: 10px;
  color: #cccccc;
}

.multiple-choice-question-content-title {
  font-weight: normal;
  font-size: 12px;
  padding: 10px 15px;
  box-sizing: border-box;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
}

.multiple-choice-question-content-right {
  flex: 3;
  display: flex;
  flex-flow: column nowrap;
  height: calc($question-generation-aside-preview-item-height * 0.5);
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
}

.multiple-choice-question-content-img {
  width: $question-generation-aside-preview-item-img-width;
  height: $question-generation-aside-preview-item-img-height;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.img {
  width: $question-generation-aside-preview-item-img-width;
  height: $question-generation-aside-preview-item-img-height;
}

.multiple-choice-question-content-footer {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-around;
  align-items: center;
  box-sizing: border-box;

}

.multiple-choice-question-content-footer-demo {
  height: 2px;
  background-color: $question-main-line-background;
  border-radius: 2px;
  width: 20px;
  margin: 8px 0;
  box-sizing: border-box;
}

.img-none {
  font-size: 26px;
  color: #d2d2d2;
  padding: 4px 7px 0 7px;
  border: 1px dashed #c5c5c5;
}

</style>
