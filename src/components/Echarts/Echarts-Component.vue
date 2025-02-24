<template>
  <div class="wrapper" :id="'_echarts-wrapper_'+_id">
    <div :id="_id + i" v-for="(item,i) of dataSource" :key="i" class="main">

    </div>
    <el-empty description="暂无数据" v-show="dataSource.length<1"></el-empty>
  </div>

</template>

<script setup lang="ts">
import type { ComposeOption } from "echarts/core";
import * as echarts from "echarts/core";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import { BarChart, LineChart } from "echarts/charts";
import type {
  DatasetComponentOption,
  GridComponentOption,
  TitleComponentOption,
  TooltipComponentOption
} from "echarts/components";
import {
  DatasetComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { nextTick, onMounted, ref, watchEffect,onBeforeUnmount } from "vue";

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;
const _id = "_echarts_private_container_";
// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);
// eslint-disable-next-line vue/valid-define-props
const prop = defineProps(["dataSource","show"]);
//@ts-ignore
const dataSourceFinal = ref<[]>([])
const echartsList:any[] =  [];
const tempObject:string[] =[];
function onClassify(data:any[]){
  for(let i=0;i<data.length;i++){
    if(!tempObject.includes(data[i]['_name'])){
      tempObject.push(data[i]['_name'])

    }
  }
  for(let i=0;i<tempObject.length;i++){
    //@ts-ignore
    dataSourceFinal.value.push([]);
    for(let k of data){
      if(k['_name'] === tempObject[i]){
        //@ts-ignore
        dataSourceFinal.value[i]?.unshift(k)
      }
    }
  }
  //@ts-ignore
  dataSourceFinal.value = dataSourceFinal.value.filter(it=> it.length>1)

}
onBeforeUnmount(()=>{

})
const buildEchart = function(){
  for (let _item = 0; _item < dataSourceFinal.value.length || 0; _item++) {
    const dom = document.querySelector("#" + _id + _item);
    if(!dom){
      return
    }
      //@ts-ignore
    echartsList.push(echarts.init(dom));
    const option = {
      title: {
        //@ts-ignore
        text: dataSourceFinal.value[_item][0]?._name || '-'
      },
      tooltip: {
        trigger: 'axis',
        formatter(param:any[]){
          return param[0]['data'] + ' ' + dataSourceFinal.value[_item][0]['unit']
        }
      },
      xAxis: {
        type: "category",
        //@ts-ignore
        data: dataSourceFinal.value[_item].map(it=> it.updateTime.slice(-8,it.updateTime.length))
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          //@ts-ignore
          data: dataSourceFinal.value[_item].map(it=> it.analysisValue),
          type: "line"
        }
      ]
    };
   // const myChart = echarts.init(document.querySelector("#" + _id + _item)!);
    //@ts-ignore
    echartsList[_item].setOption(option);
    //@ts-ignore
    echartsList[_item].resize({
      width: 640,
      height: "auto"
    });
  }
}
onMounted(function() {

});

watchEffect(() => {
  if(prop.dataSource && prop.dataSource.length >0){
      for(let x of echartsList){
        x.dispose()
        x.clear()
      }
    echartsList.length = 0;
    onClassify(prop.dataSource)
    nextTick(buildEchart)
  }
  return prop;
});
</script>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
  flex-flow: row wrap;
  align-items: center;
}
.main {
  height: 500px;

  position: relative;
}
</style>
