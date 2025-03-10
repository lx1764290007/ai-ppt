<template>
  <div v-for="(item, index) of dataSource" :key="index">
    <div class="right-side-form"
         style="height: calc(100vh - 60px)"
         v-show="topicStore.getActive() === index && (topicStore.getActiveItem()?.type === questionType.READING1 || topicStore.getActiveItem()?.type === questionType.READING2)">
      <el-space direction="vertical">
        <div>
          <p class="right-side-form-label">
            {{ $t("questionEditRightSide.reading") }}
          </p>
          <el-select
            size="large"
            @change="onChange"
            class="input__default_theme"
            v-model="item.type"
            placeholder="选择"
            style="width: 100%;padding-bottom: 15px;"
          >
            <el-option v-for="it of typeDict" :key="it.value" :label="$t(it.label)" :value="it.value">
              <div class="right-side-form-option">
                <img :src="it.icon" alt="icon" :class="{'icon':true, 'icon-fix':it.value === questionType.JUDGEMENT}" />
                <span :class="{ 'active-color': it.value === item.type }">{{ $t(it.label) }}</span>
                <el-icon class="check" v-if="it.value === item.type">
                  <Check />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </div>
        <div style="margin: 0 3px;">
          <p class="right-side-form-label" style="padding-left: 12px">
            {{ $t("questionEditRightSide.template") }}
          </p>
          <div class="layout-template">
            <el-image :src="TEMPLATE_1"
                      alt="layout1"
                      fit="contain"
                      @click="onUpdateLayout(READING_QUESTION_LAYOUT.HORIZONTAL)"
                      class="layout-template-image" />
            <el-image :src="TEMPLATE_2"
                      alt="layout2"
                      fit="contain"
                      @click="onUpdateLayout(READING_QUESTION_LAYOUT.HORIZONTAL_REVERSE)"
                      class="layout-template-image" />
            <el-image :src="SELECT_ICON"
                      alt="selected"
                      fit="contain"
                      :class="['layout-template-image-selected', item.layout === READING_QUESTION_LAYOUT.HORIZONTAL? 'layout-template-image-selected-2':'layout-template-image-selected-1'] " />
          </div>
        </div>
      </el-space>
      <el-button
        style="left:10%;right: 10%;width:80%;position: absolute;bottom: 20px;"
        size="large"
        @click="onSave"
        class="buttons-primary"
        :loading="topicStore.isSaving"
      >
        {{ $t("questionEditRightSide.done") }}
      </el-button
      >
    </div>
    <div class="right-side-form"
         v-show="topicStore.getActive() === index && topicStore.getActiveItem()?.type !== questionType.READING1 && topicStore.getActiveItem()?.type !== questionType.READING2">
      <el-space direction="vertical" size="large" style="height: 100%">
        <div style="margin: 0 13px;">
          <p class="right-side-form-label">
            {{ $t("questionEditRightSide.type") }}
          </p>
          <el-select
            size="large"
            @change="onChange"
            class="input__default_theme"
            v-model="item.type"
            placeholder="选择"
            style="width: 100%"
          >
            <el-option v-for="it of topicDict" :key="it.value" :label="$t(it.label)" :value="it.value">
              <div class="right-side-form-option">
                <img :src="it.icon" alt="icon" :class="{'icon':true, 'icon-fix':it.value === questionType.JUDGEMENT}" />
                <span :class="{ 'active-color': it.value === item.type }">{{ $t(it.label) }}</span>
                <el-icon class="check" v-if="it.value === item.type">
                  <Check />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </div>
        <div style="margin-top: 7px">
          <p class="right-side-form-label">
            {{ $t("questionEditRightSide.time") }}
          </p>
          <el-select
            class="input__default_theme"
            size="large"
            v-model="item.maxTime"
            placeholder="选择"
            @click="onChange"
          >
            <el-option
              class="input__default_theme"
              v-for="it of timeDict"
              :key="it.value"
              :label="it.value + $t(it.label)"
              :value="it.value"
            >
              <div class="right-side-form-option">
                <span :class="{ 'active-color': it.value === item.time }">{{ it.value + $t(it.label) }}</span>
                <el-icon class="check" v-if="it.value === item.time">
                  <Check />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </div>
        <div style="margin-top: 7px;position: relative">
          <p class="right-side-form-label" style="margin: 0 14px;">
            {{ $t("questionEditRightSide.template") }}
          </p>

          <el-image :src="QUESTION_TEMPLATE_1" fit="contain" alt="layout" class="question-layout" />
          <el-image :src="SELECT_ICON"
                    alt="selected"
                    fit="contain"
                    :class="['layout-template-image-selected2']" />
        </div>
        <!--        <div v-if="topicStore.getActiveItem()?.type === questionType.SINGLE_CHOICE || topicStore.getActiveItem()?.type === questionType.MULTIPLE_CHOICE">-->
        <!--          <p class="right-side-form-label">答题选项</p>-->
        <!--          <el-select-->
        <!--            class="input__default_theme"-->
        <!--            size="large"-->
        <!--            v-model="item.type"-->
        <!--            placeholder="选择"-->
        <!--            @change="onChooseChange"-->
        <!--          >-->
        <!--            <el-option v-for="it of chooseDict" :key="it.value" :label="it.label" :value="it.value">-->
        <!--              <div class="right-side-form-option">-->
        <!--                <span :class="{ 'active-color': String(it.value) === String(item.type) }">{{ it.label }}</span>-->
        <!--                <el-icon class="check" v-if="it.value === item.type">-->
        <!--                  <Check />-->
        <!--                </el-icon>-->
        <!--              </div>-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--        </div>-->
      </el-space>
      <div class="buttons">
        <el-button style="width: 45%" size="large" :loading="deleteLoading" class="buttons-default"
                   @click="onDelete(index,item.id||0)"
        >{{ $t("questionEditRightSide.delete") }}
        </el-button
        >
        <el-button
          style="width: 45%"
          size="large"
          class="buttons-default"
          @click="onCopy(item, index)"
          :loading="copyLoading"
        >{{ $t("questionEditRightSide.copy") }}
        </el-button
        >
        <div style="height: 15px; width: 100%"></div>
        <el-button style="width: 45%" size="large" class="buttons-default" @click="onExit"
        >
          {{ $t("header.header_item_line5") }}
        </el-button
        >
        <el-button
          style="width: 45%"
          size="large"
          @click="onSave"
          class="buttons-primary"
          :loading="topicStore.isSaving"
        >
          {{ $t("questionEditRightSide.done") }}
        </el-button
        >
      </div>
    </div>
  </div>
  <div class="empty-button" v-if="dataSource.length<1">
    <el-button size="large" class="buttons-default" @click="router.back()">
      {{ $t("universal.close") }}
    </el-button>
  </div>
</template>
<script setup lang="ts">
import { useTimeDict, useTopicDict } from "@/libs/useTopicDict";
import { ref, watch } from "vue";
import { Check } from "@element-plus/icons-vue";
import { useTopicStore } from "@/libs/usePinia";
import type { QuestionItem } from "@/interface/Topic";
import { useRouter } from "vue-router";
// import { useQuestionType } from "@/libs/useQuestionType";
import { fetchDeleteItem } from "@/http/question";
import type { Http } from "@/interface/Http";
import { useQuestionType } from "@/libs/useQuestionType";
import pub from "vc-subscribe-publish";
import TEMPLATE_1 from "@/assets/reading-template1.png";
import TEMPLATE_2 from "@/assets/reading-template2.png";
import SELECT_ICON from "@/assets/seleted.png";
import { READING_QUESTION_LAYOUT } from "@/enum";
import QUESTION_TEMPLATE_1 from "@/assets/question-template1.png";

const topicStore = useTopicStore();
const questionType = useQuestionType();
const router = useRouter();
const timeDict = useTimeDict();
const topicDict = useTopicDict().filter(item => item.value > 0).filter(it => !it.special);
const typeDict = useTopicDict().filter(item => item.value > 0).filter(it => it.special);
const copyLoading = ref(false);
const deleteLoading = ref(false);


const onChange = (value: number) => {
  // console.log( topicStore.getActiveItem())

  // if (value === questionType.SINGLE_CHOICE || value === questionType.BLANKS) {
  //   const options = [1, 2, 3, 4].map(() => "");
  //   topicStore.update(
  //     Object.assign({}, topicStore.getActiveItem(), { options, answers: [] }),
  //     topicStore.getActive()
  //   );
  if (value === questionType.JUDGEMENT) {
    const activeItem = topicStore.getActiveItem();
    topicStore.update(
      Object.assign({}, activeItem, { options: activeItem?.options?.slice(0, 2) }),
      topicStore.getActive()
    );
  }
  if (value === questionType.SINGLE_CHOICE || value === questionType.MULTIPLE_CHOICE) {
    const activeItem = topicStore.getActiveItem();
    topicStore.update(
      Object.assign({}, activeItem),
      topicStore.getActive()
    );
  }
};
const onUpdateLayout = (target: number) => {
  const activeItem = topicStore.getActiveItem();
  if (activeItem?.layout === target) return;
  topicStore.update(
    Object.assign({}, activeItem, { layout: target }),
    topicStore.getActive()
  );
};

const dataSource = ref<QuestionItem[]>([]);

const onDelete = (index: number, id: number) => {
  if (!id) {
    topicStore.remove(index);
    return;
  }
  deleteLoading.value = true;
  fetchDeleteItem({
    id
  }).then((res: Http.Response<any>) => {
    if (res.code === 200) {
      topicStore.remove(index);
    }
  }).finally(() => deleteLoading.value = false);

};
const onCopy = (topic: QuestionItem, index: number) => {
  const _topic = Object.assign({}, topic, { id: undefined });
  topicStore.insert(_topic, index);
};
const onSave = () => {
  const _topic = topicStore.get(0);
  if (_topic) {
    // router.push({
    //   path: "/subject-page",
    //   query: {
    //     id: _topic.subjectId,
    //     name: ""
    //   }
    // });
    router.back();
  } else {
    router.push({
      path: "/question-home"
    });
  }
};

const onExit = () => {
  pub.public("on-preview");
};

watch(() => topicStore.get(), cb => {
  dataSource.value = cb as QuestionItem[];
}, {
  deep: true,
  immediate: true
});
</script>

<style scoped lang="scss">
@import "@/theme";

.active-color {
  color: $main-active-font-color;
}

.right-side-form {
  padding: 15px;
  box-sizing: border-box;
  font-size: 16px;
  color: #333;

  .right-side-form-label {
    font-size: 16px;
    font-weight: 600;
    padding-bottom: 15px;
    color: #43536C;
  }
}

.right-side-form-option {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding: 3px 0;

  &:hover {
    color: $main-active-font-hover-color;
  }

  .check {
    position: absolute;
    right: 5px;
    color: $main-active-font-color;
    font-size: larger;
  }
}

.icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  margin-right: 20px;
}

.icon-fix {
  width: 27px;
  height: 27px;
  margin-left: -2px;
}

.buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  bottom: 22px;
  z-index: 1;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.empty-button {
  text-align: center;
  margin-top: calc((100vh - 60px) / 2 - 40px)
}

.layout-template {
  width: 100%;
  position: relative;

  .layout-template-image {
    cursor: pointer;

    & + & {
      margin-top: 10px;
    }
  }

  .layout-template-image-selected {
    position: absolute;
    right: 20px;
    z-index: 1;
    box-sizing: border-box;
    width: 24px;
    transition: all .2s ease-in-out;
  }

  .layout-template-image-selected-1 {
    bottom: 30px;
  }

  .layout-template-image-selected-2 {
    top: 126px;
  }
}
.layout-template-image-selected2 {
  position: absolute;
  right: 20px;
  bottom: 30px;
  width: 24px;
}
.question-layout {
  cursor: pointer;
}
</style>
