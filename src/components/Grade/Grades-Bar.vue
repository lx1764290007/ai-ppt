<template>
  <div class="wrapper">
    <el-scrollbar style="height: auto" ref="scroll" @scroll="onScrollEnd">
      <div class="tab__component-wrapper-header" v-show="gradeList.length>0">
        <el-icon class="tab__component-icon-left" @click="onScrollHandle(-1, $event)">
          <ArrowLeft />
        </el-icon>
        <el-icon class="tab__component-icon-right" @click="onScrollHandle(1,$event)">
          <ArrowRight />
        </el-icon>
        <div :class="{'tab__component-wrapper-header-item':true,'default__button-active':activeValue === item.id}"
             v-for="(item) of gradeList" :key="item.id" @click="onSelect(item.id)">
          <span>
            {{ locale === "en" ? $t("grade.grade") + item.label : item.label + $t("grade.grade") }}
          </span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue";
import { ElScrollbar } from "element-plus";

const scroll = ref<InstanceType<typeof ElScrollbar>>();

const emit = defineEmits<{
  (ev: "change",value:number): void
}>();
const activeValue = ref();
const gradeList = ref<{ label: string, id: number }[]>([]);

const { locale, t } = useI18n();

let currentScrollLeft: number = 0;
const onScrollEnd = (value: { scrollLeft: number }) => {
  currentScrollLeft = value.scrollLeft;
};
const onScrollHandle = (value: number, event: Event) => {
  if (scroll.value) {
    if (value > 0) {
      scroll.value.setScrollLeft(currentScrollLeft + 81);
    } else {
      scroll.value.setScrollLeft(currentScrollLeft - 81);
    }
  }
  event.stopPropagation();
};

const getGradeList = () => {
  const grades = window.localStorage.getItem("grade");
  if (grades) {
    gradeList.value = JSON.parse(grades).map((it:any) => {
      return {
        label: it.grade,
        id: it.id
      };
    });
    activeValue.value = gradeList.value[0]?.id;
    emit("change", activeValue.value);
  }
};
const onSelect = (id:number)=> {
  if(activeValue.value !== id){
    activeValue.value = id;
    emit("change", id);
  }

}
onBeforeMount(() => {
  getGradeList();
});


</script>

<style scoped lang="scss">
@import "@/theme.scss";

.wrapper {
  overflow-y: hidden;
  background-color: transparent;

  position: relative;

  .header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;

    .tools {
      position: relative;

      .button-icon {
        width: 18px;
        margin-right: 5px;
      }
    }
  }
}


.empty {
  position: fixed;
  top: 30%;
  left: 50%;
}


.tab__component-wrapper-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;

  box-sizing: border-box;
  padding-bottom: 12px;
}

.tab__component-wrapper-header-item {
  flex-shrink: 0;
  background-color: #fff;
  color: #43536C;
  font-size: 15px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  min-width: 100px;
  transition: all .2s;
  position: relative;
  overflow: visible;
  text-align: center;
  border: 1px solid #DBE0ED;
}

.tab__component-wrapper-header-item:hover {
  background-color: $main-active-font-hover-color;
  color: #f1f1f1;
}

.tab__component-wrapper-header-item + .tab__component-wrapper-header-item {
  margin-left: 12px;
}

.tab__component-icon-left {
  position: absolute;
  left: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}

.tab__component-icon-right {
  position: absolute;
  right: 0;
  font-size: 28px;
  top: 0;
  transform: translateY(calc(50% - 14px + 2px));
  color: #222;
  padding: 5px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  box-sizing: border-box;
  border: 1px solid #d1d8dc;
  backdrop-filter: blur(3px);
  z-index: 1;
  cursor: pointer;
}


</style>
