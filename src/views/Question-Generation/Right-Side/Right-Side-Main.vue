<template>
  <div v-for="(item, index) of dataSource" :key="index">
    <div class="right-side-form" v-show="topicStore.getActive() === index">
      <el-space direction="vertical" size="large" style="height: 100%">
        <div>
          <p class="right-side-form-label">
            {{$t("questionEditRightSide.type")}}
          </p>
          <el-select
            size="large"
            @change="onChange"
            class="input__default_theme"
            v-model="item.type"
            placeholder="选择"

          >
            <el-option v-for="it of topicDict" :key="it.value" :label="$t(it.label)" :value="it.value">
              <div class="right-side-form-option">
                <img :src="it.icon" alt="icon" class="icon" />
                <span :class="{ 'active-color': it.value === item.type }">{{ $t(it.label) }}</span>
                <el-icon class="check" v-if="it.value === item.type">
                  <Check />
                </el-icon>
              </div>
            </el-option>
          </el-select>
        </div>
        <div>
          <p class="right-side-form-label">
            {{$t("questionEditRightSide.time")}}
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
        <el-button style="width: 45%" size="large" :loading="deleteLoading" class="buttons-default" @click="onDelete(index,item.id||0)"
          >{{$t("questionEditRightSide.delete")}}</el-button
        >
        <el-button
          style="width: 45%"
          size="large"
          class="buttons-default"
          @click="onCopy(item, index)"
          :loading="copyLoading"
          >{{$t("questionEditRightSide.copy")}}</el-button
        >
        <div style="height: 15px; width: 100%"></div>
        <el-button style="width: 45%" size="large" class="buttons-default" @click="onExit"
          >
          {{$t("header.header_item_line5")}}
        </el-button
        >
        <el-button
          style="width: 45%"
          size="large"
          @click="onSave"
          class="buttons-primary"
          :loading="topicStore.isSaving"
          >
          {{$t("questionEditRightSide.done")}}
        </el-button
        >
      </div>
    </div>
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

const topicStore = useTopicStore();
const questionType = useQuestionType();
const router = useRouter();
const timeDict = useTimeDict();
const topicDict = useTopicDict().filter(item => item.value > 0);
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
      Object.assign({}, activeItem, { options: activeItem?.options?.slice(0,2)}),
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


const dataSource = ref<QuestionItem[]>([]);

const onDelete = (index: number,id:number) => {
  if(!id){
    topicStore.remove(index);
    return
  }
  deleteLoading.value = true;
  fetchDeleteItem({
    id
  }).then((res:Http.Response<any>) => {
    if(res.code === 200){
      topicStore.remove(index);
    }
  }).finally(()=> deleteLoading.value = false)

};
const onCopy = (topic: QuestionItem, index: number) => {
  const _topic = Object.assign({}, topic, {id: undefined});
  topicStore.insert(_topic, index);
};
const onSave = () => {
 const _topic = topicStore.get(0);
  if(_topic) {
    router.push({
      path: "/subject-page",
      query: {
        id: _topic.subjectId,
        name: ""
      }
    })
  } else {
    router.push({
      path: "/question-home",
    })
  }
};

const onExit = () => {
  pub.public("on-preview");
};

watch(()=> topicStore.get(), cb=> {
  dataSource.value = cb as QuestionItem[];
},{
  deep: true,
  immediate: true
})
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
    padding-bottom: 10px;
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
</style>
