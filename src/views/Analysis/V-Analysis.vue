<template>
  <div class="analysis-wrapper">

    <el-scrollbar class="scroll-wrapper">
      <header class="analysis-header">
        <el-space direction="horizontal">
          <span>{{ $t("analysis.grade") }}</span>
          <el-select v-model="grade"
                     size="large"
                     @change="onChange"
                     :placeholder="$t('analysis.empty')"
                     class="input__default_theme"
                     style="border-radius: 10px">
            <el-option
              v-for="item in options"
              :key="item.grade"
              :label="item.grade === 0? $t(item.gradeName) : locale === 'en'? 'K' + item.gradeName : item.gradeName + $t('grade.grade')"
              :value="item.grade"
            />
          </el-select>
        </el-space>
        <el-space direction="horizontal" style="margin-left: 20px">
          <span>{{ $t("analysis.topic") }}</span>
          <el-select v-model="subjectId"
                     size="large"
                     :placeholder="$t('analysis.empty')"
                     class="input__default_theme"
                     style="border-radius: 10px">
            <el-option
              v-for="item in topicList"
              :key="item.id"
              :label="item.subjectName || locale === 'en'? item.subjectNameEn:locale === 'zh'? item.subjectNameCn:item.subjectNameHk"
              :value="item.id"
            />
          </el-select>
        </el-space>
        <el-space direction="horizontal" style="margin-left: 20px">
            <span>
              {{ $t("subject.questionBank") }}
            </span>
          <el-select v-model="typeId"
                     size="large"
                     @change="($event)=>selectQuestion({data:{id:$event}})"
                     :placeholder="$t('analysis.empty')"
                     class="input__default_theme"
                     style="border-radius: 10px">
            <el-option
              v-for="item in list"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-space>
      </header>
      <div class="scroll-wrapper">

        <div class="first-items">
          <div class="item">
            <div class="item-title">
              {{ $t("analysis.topicAnalysis") }}
            </div>
            <div id="column-canvas"></div>
          </div>
          <div></div>
          <div class="item">
            <div class="item-title">
              {{ $t("analysis.popular") }}
            </div>
            <div id="bar-canvas"></div>
          </div>
        </div>

        <div class="item" style="margin-top: 20px">
          <div class="item-title">
            {{ topicList.find(it => it.id === subjectId)?.subjectName }} {{ $t("analysis.topicAnalysis") }}
          </div>
          <div id="dual-canvas"></div>

          <el-table :data="tableData" stripe style="width: 100%;" class="item-data" border
                    :empty-text="$t('analysis.empty')" v-loading="loading">
            <el-table-column prop="type" :label="$t('analysis.type')" width="200" align="center">
              <template #default="scope">
                <span
                  style="color:#333;font-weight: 500">{{ $t(questionType.find(it => it.value === scope.row.type)?.label || "--")
                  }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="question" :label="$t('analysis.question')" align="center" min-width="180">
              <template #default="scope">
                <span style="color:#333;font-weight: 500">{{ scope.row.question }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="questionNum" :label="$t('analysis.numberOfAnswers')" width="200" align="center">
              <template #default="scope">
                <span style="color:#333;font-weight: 500">{{ scope.row.questionNum }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" :label="$t('analysis.questionAnsweringTime')" width="200" align="center">
              <template #default="scope">
                <span style="color:#333;font-weight: 500">{{ scope.row.time }}s</span>
              </template>
            </el-table-column>
            <el-table-column prop="accuracy" :label="$t('analysis.accuracy')" align="center" width="300">
              <template #default="scope">
                <el-progress :percentage="scope.row.accuracy === 0? 0 : (scope.row.accuracy * 100).toFixed(2)"
                             color="#553fc5" />
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="page"
            background
            style="margin: 20px auto;text-align: center;"
            layout="prev, pager, next"
            :total="total"
            hide-on-single-page
            :page-size="PAGE_SIZE"
          />
        </div>

        <div style="height: 40px"></div>
      </div>
    </el-scrollbar>
    <loading-component :show="pageLoading" />
  </div>
</template>
<script setup lang="ts">
import { Bar, Column, DualAxes } from "@antv/g2plot";

import { nextTick, onBeforeMount, onMounted, ref, watch } from "vue";
import { fetchAnalysis, fetchAnalysisQuestion } from "@/http/analysis";
import type { Grade } from "@/interface/Grade";
import { useUserInfo } from "@/stores/user";
import { useI18n } from "vue-i18n";
import { fetchTopicList } from "@/http/topic";
import type { Http } from "@/interface/Http";
import type { TopicOverview } from "@/interface/TopicOverview";

import { useTopicDict } from "@/libs/useTopicDict";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { getGradeList } from "@/libs/useGrade";


interface Subject {
  questionCount: number;
  subjectName: string;
}

interface Question {
  answer: number;
  question: number;
  typeName: string;
  typeId: number;
}

interface Type {
  questionName: string;
  questionSize: number;
}

interface List {
  type: number;  //题目类型
  question: string; //题目内容
  questionNum: number; //答题次数
  time: number;  //答题时长
  accuracy: number; //正确率
}

interface AnalysisData {
  type: Type[];
  question: Question[];
  subject: Subject[];
  list: List[];
}

const tableData = ref<List[]>([]);
const grade = ref();
const subjectId = ref();
const { t, locale } = useI18n();
const options = ref<{ grade: number, gradeName: string }[]>([]);
const userInfoStore = useUserInfo();
const page = ref(1);
const PAGE_SIZE = 10;
const total = ref(0);
const loading = ref(false);
const pageLoading = ref(false);
const topicList = ref<TopicOverview[]>([]);
const list = ref<{ label: string, id: number }[]>([]);
const typeId = ref<number>();
const onChange = (event: string) => {
  getSubjectList();
  subjectId.value = undefined;
  topicList.value.length = 0;
  setColumnCanvas([]);
  setBarCanvas([]);
  setDualCanvas([]);
};

const questionType = useTopicDict();
const setGrades = async () => {
  const gradeList = await getGradeList();

  options.value = gradeList.map((it: Grade.Item) => {
    return {
      gradeName: it.gradeName,
      grade: it.id
    };
  });
  await nextTick(() => {
    grade.value = options.value[0]?.grade;
    getSubjectList();
  });
};
const getSubjectList = () => {
  // pageLoading.value = true;
  fetchTopicList({
    userId: userInfoStore.getUserInfo?.user?.id,
    gradeId: grade.value
  }).then((res: Http.Response<TopicOverview[]>) => {
    if (res?.code === 200) {
      topicList.value = res.data;
      subjectId.value = res.data[0].id;
    }
  }).finally(() => pageLoading.value = false);
};

function getRandomHexColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

const color = ["#5B8FF9", "#5AD8A6", "#5D7092", "#F6BD16", "#E86454", "#6DC8EC", "#9270CA", "#FF9D4D", "#2FC25B", "#1ca9e6", "#f88c24", "#ff4d4f"];
for (let i = 0; i < 40; i++) {
  color.push(getRandomHexColor());
}
const initColumnCanvas = () => {
  const columnPlot = new Column("column-canvas", {
    autoFit: true,
    data: [],
    columnWidthRatio: 0.4,
    xField: "type",
    yField: "value",
    color,
    seriesField: "type", // 映射字段
    tooltip: {
      shared: true, // 是否共享 tooltip
      showMarkers: true, // 是否显示 marker
      customContent: (title: string, items: any[]) => {
        return `<div style="width: ${locale.value === "en" ? "180px" : "120px"};height: 60px;padding: 10px 0;">
                    <div style="font-weight: 600">${title}</div>

                    <p style="display: flex;align-items: center;justify-content: space-between;">
                    <span><i style="display: inline-block;width:10px;height: 10px;background-color: ${items[0]?.color};border-radius: 50%;margin-right: 5px;"></i>${t("analysis.numberOfAnswers")} : </span> <span>${items[0]?.data?.value}</span></p>
                    </div>`;
      }
    },
    legend: {
      position: "bottom",
      itemSpacing: 10 // 图例项间距
    },
    label: {
      // 可手动配置 label 数据标签位置
      position: "bottom", // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: "#FFFFFF",
        opacity: 0.6
      }
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false
      }
    },
    meta: {
      type: {
        alias: t("analysis.topic")
      },
      value: {
        alias: t("analysis.numberOfQuestions")
      }
    }
  });
  columnPlot.render();
  return columnPlot;
};

function shuffleArray(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 随机索引
    [array[i], array[j]] = [array[j], array[i]];  // 交换元素
  }
  return array;
}


let columnCanvas: Column | undefined, columnBar: Bar | undefined, dualAxes: DualAxes | undefined;


const initBar = (): Bar => {
  const bar = new Bar("bar-canvas", {
    data: [],
    autoFit: true,
    minBarWidth: 20,
    xField: "value",
    yField: "typeName",
    seriesField: "typeName",
    color,
    tooltip: {
      shared: true, // 是否共享 tooltip
      showMarkers: true, // 是否显示 marker
      customContent: (title: string, items: any[]) => {
        return `<div style="width: ${locale.value === "en" ? "180px" : "120px"};height: 60px;padding: 10px 0;">
                    <div style="font-weight: 600">${title}</div>

                    <p style="display: flex;align-items: center;justify-content: space-between;">
                    <span><i style="display: inline-block;width:10px;height: 10px;background-color: ${items[0]?.color};border-radius: 50%;margin-right: 5px;"></i>${t("analysis.numberOfAnswers")} : </span> <span>${items[0]?.data?.value}</span></p>
                    </div>`;
      }
    },
    legend: {
      position: "bottom",
      itemSpacing: 10 // 图例项间距
    }
  });
  bar.render();
  return bar;
};
const initDualCanvas = (): DualAxes => {
  const dualAxes = new DualAxes("dual-canvas", {
    data: [[], []],
    autoFit: true,
    xField: "type",
    yField: ["question", "answer"],
    tooltip: {
      shared: true, // 是否共享 tooltip
      showMarkers: true, // 是否显示 marker
      customContent: (title: string, items: any[]) => {
        return `<div style="width: ${locale.value === "en" ? "180px" : "120px"};height: 60px;padding: 10px 0;">
                    <div style="font-weight: 600">${title}</div>
                    <p style="display: flex;align-items: center;justify-content: space-between;">
                    <span><i style="display: inline-block;width:10px;height: 10px;background-color: ${items[0]?.color};border-radius: 50%;margin-right: 5px;"></i>
                    ${t("analysis.numberOfQuestions")} : </span> <span>${items[0]?.data?.question}</span></p>
                    <p style="display: flex;align-items: center;justify-content: space-between;">
                    <span><i style="display: inline-block;width:10px;height: 10px;background-color: ${items[1]?.color};border-radius: 50%;margin-right: 5px;"></i>
                     ${t("analysis.numberOfAnswers")} : </span><span>${items[0]?.data?.answer}</span></p>
                    </div>`;
      }
    },

    geometryOptions: [
      {
        geometry: "column",
        columnWidthRatio: 0.4,
        seriesField: "type",
        color: shuffleArray(color)
      },
      {
        geometry: "line",
        color: "#d20a5d",
        seriesField: "answer",
        lineStyle: {
          lineWidth: 2,
          color: "#8a2dc9"
        }
      }
    ],
    legend: {
      position: "bottom", // 图例位置
      itemSpacing: 10, // 图例项间距
      // marker: {
      //   symbol: 'square', // 图例项标记形状
      //   style: {
      //     r: 5, // 标记大小
      //     fill: '#000', // 标记填充颜色
      //   },
      // },
      itemName: {
        formatter: (text) => {
          return text;
        }, // 自定义图例项文本
        style: {
          fontSize: 14, // 文本字体大小
          fill: "#333" // 文本颜色
        }
      }
    },
    meta: {
      type: {
        alias: t("analysis.topic")
      },
      question: {
        alias: t("analysis.numberOfQuestions")
      },
      answer: {
        alias: t("analysis.numberOfAnswers")
      }
    }
  });
  dualAxes.render();
  return dualAxes;
};
const setColumnCanvas = (data: { type: string, value: number }[]) => {
  columnCanvas && columnCanvas.update({
    color: shuffleArray(color)
  });
  columnCanvas?.changeData(data);
};
const setBarCanvas = (data: { typeName: string, value: number }[]) => {
  columnBar && columnBar.update({
    color: shuffleArray(color)
  });
  columnBar && columnBar.changeData(data);
};
const setDualCanvas = (data: { type: string, question: number, answer: number, id: number }[]) => {

  dualAxes && dualAxes.changeData([data, data]);
};
const setTableData = (data: List[]) => {
  tableData.value = data;
};
const getAnalysis = () => {
  fetchAnalysis({
    gradeId: grade.value,
    subjectId: subjectId.value
  }).then((res: Http.Response<AnalysisData>) => {
    if (res.code === 200) {
      const columnData = res.data.subject.map(it => {
        return {
          type: it.subjectName,
          value: it.questionCount
        };
      });
      const barData = res.data.type.map((it) => {
        return {
          typeName: it.questionName,
          value: it.questionSize
        };
      });
      const dualData = res.data.question.map((it) => {
        return {
          type: it.typeName,
          question: it.question,
          answer: it.answer,
          id: it.typeId
        };
      });
      list.value = res.data.question.map(it => {
        return {
          label: it.typeName,
          id: it.typeId
        };
      });
      typeId.value = list.value[0]?.id;
      selectQuestion({ data: { id: typeId.value } });
      setColumnCanvas(columnData);
      setBarCanvas(barData);
      setDualCanvas(dualData);
      setTableData(res.data.list);
    }
  });

};
let currentDataId: number | undefined;
const selectQuestion = (data: any) => {
  const { id } = data.data;
  if (id === currentDataId) return;
  const typeIdShouldChange = currentDataId === typeId.value && id !== typeId.value;
  currentDataId = id;
  if (id) {
    loading.value = true;
    page.value = 1;
    fetchAnalysisQuestion({
      typeId: id,
      page: page.value,
      pageSize: PAGE_SIZE
    }).then((res: Http.Response<List[]>) => {
      if (res.code === 200) {
        tableData.value = res.data;
        total.value = res.total;
        if (typeIdShouldChange) {
          typeId.value = currentDataId;
        }
      } else {
        tableData.value = [];
      }
    }).catch(() => {
      tableData.value = [];
    }).finally(() => loading.value = false);
  }
};
const onPageChange = (value: number) => {
  if (currentDataId) {
    loading.value = true;
    fetchAnalysisQuestion({
      typeId: currentDataId,
      page: value,
      pageSize: PAGE_SIZE
    }).then((res: Http.Response<List[]>) => {
      if (res.code === 200) {
        tableData.value = res.data;
        total.value = res.total;
      }
    }).finally(() => loading.value = false);
  }
};
watch(subjectId, cb => {
  if (!cb) return;
  getAnalysis();
});
watch(page, (cb) => {
  onPageChange(cb);
});
onBeforeMount(() => {
  setGrades();
});
onMounted(() => {
  columnCanvas = initColumnCanvas();

  columnBar = initBar();
  dualAxes = initDualCanvas();
  dualAxes?.on("element:click", (e: any) => {
    const { data } = e;
    selectQuestion(data);
  });
});
</script>
<style scoped lang="scss">
@import "@/theme.scss";

.analysis-wrapper {
  height: 100%;
  position: relative;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff;

  .analysis-header {
    height: 80px;
    position: sticky;
    top: 0;
    align-items: center;
    display: flex;
    background-color: rgba(254, 254, 255, .8);
    backdrop-filter: blur(10px);
    width: 100%;
    z-index: 10;
    padding: 0 20px;
  }

  .scroll-wrapper {
    height: calc(100vh - 70px);
    box-sizing: border-box;
    padding: 0 20px;
  }

  .item {
    padding: 10px;
    box-sizing: border-box;
    box-shadow: $main-box-shadow;

    .item-title {
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      height: 50px;
      display: flex;
      align-items: flex-start;
      justify-content: center;

    }

  }

  .item-data {
    position: sticky;
    box-sizing: border-box;
    margin-top: 20px;
    top: 0;

    :deep(thead .el-table__cell) {
      background-color: $main-area-bg;
      color: #2c3e50;
    }
  }

  .first-items {
    display: grid;
    grid-template-columns: 1fr 20px 1fr;
    height: auto;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    width: 100%;

  }

  :deep(.is-active) {
    background-color: $main-bg-color !important;
    color: #f1f1f1;
  }

  :deep(.el-pager li) {
    border-radius: 50%;;
  }

  :deep(.el-pagination) {
    --el-pagination-hover-color: $main-bg-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>