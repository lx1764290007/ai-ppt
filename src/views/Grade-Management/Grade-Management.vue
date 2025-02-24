<template>
  <header class="table-header paid-settings-header">
    <div class="header-search">
      <el-input :placeholder="$t('universal.placeholder')" class="default__input" clearable @clear="setClassesList" size="large" v-model="searchParams.className" prefix-icon="Search" />
      <el-button class="default__button-primary" @click="setClassesList" type="primary" size="large" style="margin-left: 15px;width: 120px">
        {{$t('universal.search')}}
      </el-button>

    </div>
    <el-button class="default__button-primary"
               type="primary"
               size="large"
               @click="showClassesBox = true"
               style="width: 120px;
               justify-self: flex-end">
      {{$t('universal.add')}}{{locale.locale.value === 'en'? ' ':''}}{{$t('grade.class')}}
    </el-button>
  </header>
  <header class="header-grade">
    <el-scrollbar style="height: auto;width: 100%" ref="scroll" @scroll="onScrollEnd" @mouseenter="showArrow = true"
                  @mouseleave="showArrow = false">
      <div class="tab__component-wrapper-header">
        <el-icon class="tab__component-icon-left" @click="onScrollHandle(-1, $event)" v-if="showArrow">
          <ArrowLeft />
        </el-icon>
        <el-icon class="tab__component-icon-right" @click="onScrollHandle(1,$event)" v-if="showArrow">
          <ArrowRight />
        </el-icon>
        <div :class="{'tab__component-wrapper-header-item':true,'default__button-active':activeValue === item.id}"
             v-for="(item,index) of gradeList" :key="item" @click="onSelect(item.id)"
             @mouseenter="onEdit(index, true)"
             @mouseleave="onEdit(index, false)"
            >
          <div class="tab__component-icons" v-show="item.editable">
            <el-icon class="tab__component-icon-edit" title="edit" @click.stop="onEditing(index, true)">
              <Edit />
            </el-icon>
<!--            <el-icon class="tab__component-icon-delete" title="remove" @click.stop="onDelete(item.label)" >-->
<!--              <CloseBold />-->
<!--            </el-icon>-->
          </div>

          <span v-if="!item.editing">{{ locale.locale.value === 'en'? $t('grade.grade') + item.label: item.label + $t('grade.grade') }}</span>
          <input v-else
                 ref="gradeInput"
                 autocomplete="off"
                 v-model="item.label"
                 @blur="onUpdate(index)"
                 placeholder="" class="tab__component-header-input" />
        </div>
      </div>
    </el-scrollbar>
  </header>
  <main class="table-main">
    <el-table  :empty-text="$t('universal.empty')" v-loading="tableLoading" :data="tableData" stripe
               style="width: 100%;height:calc(100vh - 60px - 20px - 60px - 60px);">
      <el-table-column type="index" align="center" :label="$t('universal.index')" width="80" />
      <el-table-column prop="gradeName" align="center" :label="$t('grade.grade')">
        <template #default="scope">
          {{gradeList.find(item=> item.id === scope.row.gradeId)?.gradeName}}
        </template>
      </el-table-column>
      <el-table-column prop="classes" align="center" :label="$t('universal.class')" />
      <el-table-column prop="size" align="center" :label="$t('creation.number_of_works')" />

      <el-table-column prop="handle" :label="$t('universal.operation')" width="160" align="center">
        <template #default="scope">
          <el-button-group>
            <el-button text type="primary" @click="onEditClasses(scope.row)">
              {{$t('universal.edit')}}
            </el-button>
            <el-popconfirm  :title="$t('universal.before_delete')+'?'"
                            width="190px"
                            @confirm="onDelete(scope.row.id)"
                            :cancel-button-text="$t('universal.cancel')"
                            :confirm-button-text="$t('universal.confirm')">
              <template #reference>
                <el-button text type="danger">
                  {{$t('universal.delete')}}
                </el-button>
              </template>
            </el-popconfirm>
          </el-button-group>

        </template>
      </el-table-column>

    </el-table>
  </main>
<!--  <footer class="table-footer">-->
<!--&lt;!&ndash;    <el-pagination background layout="prev, pager, next" :total="100" />&ndash;&gt;-->
<!--  </footer>-->
  <MessageBox v-model:visible="showMessageBox" :confirm-text="$t('universal.confirm')" height="380px">
    <EditHandler />
  </MessageBox>
<!--  <MessageBox v-model:visible="showDeleteMessageBox" confirm-text="继续" cancel-text="取消">-->
<!--    此标签以及班级将会被删除-->
<!--  </MessageBox>-->
  <MessageBox v-model:visible="showClassesBox"  height="200px" width="360px">
    <classes-box :grade-list="gradeList" @close="onAddClassesClose" :edit-item="editItem" />
  </MessageBox>
  <LoadingComponent :show="loading" />
</template>
<script setup lang="ts">
import MessageBox from "@cs/MessageBox/Message-Box.vue";
import EditHandler from "@vs/Paid-Settings/Edit-Handler.vue";
import { nextTick, onBeforeMount, reactive, ref, watch } from "vue";
import { ArrowLeft, ArrowRight, Edit } from "@element-plus/icons-vue";
import { ElScrollbar } from "element-plus";
import { fetchClasses, fetchClassesDel, fetchGradeList, fetchUpdateGrade } from "@/http/grade";
import { useUserInfo } from "@/stores/user";
import type { Http } from "@/interface/Http";
import LoadingComponent from "@cs/Loading-Com/Loading-Component.vue";
import ClassesBox from "@vs/Grade-Management/Classes-Box.vue";
import type { Classes } from "@/interface/Classes";
import { useI18n } from "vue-i18n";


const userInfo = useUserInfo();
const gradeList = ref<Classes.Grade[]>([]);
const activeValue = ref<number>();

const scroll = ref<InstanceType<typeof ElScrollbar>>();
const locale = useI18n();
const showArrow = ref(false);
const loading = ref(false);
const tableLoading = ref(false);

const showClassesBox = ref(false);
let allData:any[] = [];
const searchParams = reactive({
  page: 1,
  pageSize: 200,
  userId: userInfo.getUserInfo.user?.id,
  className: ""
})

const gradeInput = ref<HTMLInputElement[]>();
const editItem = ref<Classes.Data>();
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
const onSelect = (item: number) => {
  activeValue.value = item;
  onTableFilter();
};

const onEdit = (index: number, show: boolean) => {
  gradeList.value[index].editable = show;
};
const onEditing = (index:number, editing: boolean)=>{
  gradeList.value[index].editing = editing;
  gradeList.value[index].editable = false;
  nextTick(()=>{
    gradeInput.value?.[0]?.focus();
  })
}
const onDelete = (id: number) => {
  fetchClassesDel({
    classId: id
  }).then((res:any)=>{
    if(res && res.code === 200) {
      //@ts-ignore
      tableData.value = tableData.value.filter(item=>item.id !== id);
      allData = allData.filter(item=>item.id !== id);
    }
  })
};
const onUpdate = async (index: number) => {
  fetchUpdateGrade({
    gradeName: gradeList.value[index].label,
    id: gradeList.value[index].id,
    userId: userInfo.getUserInfo.user?.id
  }).then(()=> {
    onEditing(index, false);
  }).finally(()=>{
    onEditing(index, false);
  })

};
const onEditClasses = (value:Classes.Data)=> {

  editItem.value = value;
  showClassesBox.value = true;
}
const tableData = ref([]);
const setGradeList = async ()=>{
  loading.value = true;
  const data: Http.InfoListData<{ gradeName: string, grade: number,id:number }> = await fetchGradeList({
    userId: userInfo.getUserInfo.user?.id,
    page: 1,
    pageSize: 100
  });
  if(data && data.code === 200) {
    gradeList.value = data.data.map(it=> {
      return {
        grade: it.grade,
        id: it.id,
        label: it.gradeName,
        editable: false,
        editing: false,
        gradeName: it.gradeName
      }
    })
    activeValue.value = gradeList.value[0]?.id;
    setClassesList();
  }
  loading.value = false;
}
const setClassesList = ()=> {
  tableLoading.value = true;
  fetchClasses(searchParams).then((res:Http.InfoListData<Classes.Data & {size: number}>)=>{
    if(res && res.code === 200) {
      allData = res.data;

      onTableFilter();
    }
  }).finally(()=>{
    tableLoading.value = false;
  })
}
const onTableFilter = ()=> {
  //@ts-ignore
  tableData.value = allData.filter(it=> {
    return it.gradeId === activeValue.value;
  })
}
const showMessageBox = ref(false);
const onAddClassesClose = (val?:number)=> {
  showClassesBox.value = false;
  if(val){
      setClassesList();
  }
}

watch(showClassesBox, val=> {
  if(!val) {
    editItem.value = undefined;
  }
})
onBeforeMount(setGradeList)
</script>
<style scoped lang="scss">
@import "@/theme.scss";
.paid-settings-header {
  justify-content: space-between;
  box-sizing: border-box;

}

.table-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-flow: row wrap;
  height: 60px;
  box-sizing: border-box;
  --el-color-primary: #0170F8;
}

.table-main {
  height: calc(100% - 60px - 60px);
  box-sizing: border-box;
  overflow-y: auto;
}

.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tab__component-wrapper-header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  --item_width: 100px;
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
  transform: translateY(calc(50% - 14px + 10px));
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
  transform: translateY(calc(50% - 14px + 10px));
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

.tab__component-icon-delete, .tab__component-icon-edit {
  cursor: pointer;
  color: red;
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
.tab__component-icon-edit {
  color: #21a5bd;
  margin-right: 2px;
}
.tab__component-icons {
  position: absolute;
  right: -12px;
  top: -10px;
  z-index: 1;
  font-size: 16px;
}
.tab__component-icon-delete:hover {
  background-color: rgba(0,0,0, .2);
}
.tab__component-icon-edit:hover {
  background-color: rgba(0,0,0,.2);

}
.tabs-item img:hover:not(img[alt='folder-add']) {
  cursor: pointer;
  transform: scale(1.1);
  transition: transform .2s;
}

.tabs-item img:where(img[alt='folder-add']) {
  width: calc(var(--item_width) - 10px) !important;
  height: calc(var(--item_width) - 10px) !important;
  cursor: pointer;
}

.tabs-item img {
  width: var(--item_width);
  height: var(--item_width);
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(720deg);
  }
}

.tab__component-header-input {
  border: none;
  outline: none;
  padding: 3px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.5);
  width: var(--item_width);
}

.header-grade {
  height: 60px;
  display: flex;
  align-items: center;
  width: 100%;
  overflow-y: visible;
}
</style>