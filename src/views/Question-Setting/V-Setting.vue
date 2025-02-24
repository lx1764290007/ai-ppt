<template>

  <div class="setting-wrapper">
    <el-form label-position="right" class="form-wrapper" :label-width="i18n.locale.value === 'en'? '240px':'160px'"
             :model="formData" :rules="rules" ref="formRef">
      <loading-component :show="loading" />
      <h2 style="text-align: left;margin-bottom: 30px">{{ $t("setting.settings_item_line1") }}</h2>
<!--      <el-form-item label="系统默认语言" prop="languageCode" style="margin-top: 10px">-->
<!--        <template #label>-->
<!--          <span style="margin-top: 3px;font-size: larger;font-weight: 600;color:#222;">-->
<!--           {{ $t("setting.settings_item_line2") }}-->
<!--        </span></template>-->
<!--        <el-select size="large"-->
<!--                   class="defaultSelectTheme"-->
<!--                   placeholder="选择默认语言"-->
<!--                   @change="onLanguageChange"-->
<!--                   style="width: 275px"-->
<!--                   v-model="formData.languageCode">-->
<!--          <el-option v-for="item of DEFAULT_LANGUAGE_LIST" :label="item.label" :value="item.value" :key="item.value" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->
      <el-form-item label="游戏间隔题数" prop="questionNum">
        <template #label>
          <span style="margin-top: 3px;font-size: larger;font-weight: 600;color:#222;">
          {{ $t("setting.settings_item_line3") }}
        </span></template>
        <el-input @change="updateData" size="large" c
                         lass="input__default_theme padding-left"
                         :placeholder="$t('setting.input')"
                         v-model="formData.questionNum">

        </el-input>
      </el-form-item>
      <el-form-item label="开始游戏时长" prop="gameTime">
        <template #label>
          <span style="margin-top: 3px;font-size: larger;font-weight: 600;color:#222;">
          {{ $t("setting.settings_item_line4") }}
        </span></template>
        <el-input @change="updateData"
                         size="large" type="text"
                         class="input__default_theme padding-left"
                         :placeholder="$t('setting.input')"
                         v-model="formData.gameTime">
          <template #append>
            <span style="width: 20px">S</span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="游戏答题胜利标准" prop="accuracy">
        <template #label>
          <span style="margin-top: 5px;font-size: larger;font-weight: 600;color:#222;">
          {{ $t("setting.settings_item_line5") }}
        </span></template>
        <el-input @change="updateData"
                         size="large"
                         :placeholder="$t('setting.input')"
                         class="input__default_theme
                  padding-left" v-model="formData.accuracy">
          <template #append>
            <span style="width: 20px">%</span>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

  </div>

</template>

<script setup lang="ts">

import { onMounted, reactive, ref } from "vue";
import {useLanguageEnum } from "@/libs/useLanguageEnum";
import { fetchSettingGet, fetchSettingUpdate } from "@/http/setting";
import type { Http } from "@/interface/Http";
import type { FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { useUserInfo } from "@/stores/user";
import LoadingComponent from "@cs/Loading/Loading-Component.vue";
import { isPositiveInteger } from "@/libs/valid";
import { useI18n } from "vue-i18n";

const DEFAULT_LANGUAGE_LIST = useLanguageEnum();
const loading = ref(false);
const userStore = useUserInfo();
const formRef = ref();
const formData = reactive({
  id: userStore.getUserInfo?.user?.id,
  questionNum: 5, //答题数量标准
  accuracy: 60,  //答题正确标准
  gameTime: 30  //答题数量标准后游戏时长
});

const i18n = useI18n();
const onLanguageChange = (event: string) => {
  formData.languageName = DEFAULT_LANGUAGE_LIST.find(it => it.value === event)?.label;
  updateData();
};
const updateData = () => {
  formRef.value?.validate().then((res: boolean) => {
    if (res) {
      fetchSettingUpdate(formData).then((res: Http.Response<any>) => {
        if (res.code === 200) {
          // userStore.setUserInfo(Object.assign({}, userStore.userInfo, {
          //   setting: {
          //     ...userStore.userInfo?.setting,
          //     languageCode: formData.languageCode
          //   }
          // }));
          // i18n.locale.value = formData.languageCode;
          ElMessage({
            message: i18n.t("setting.saved"),
            icon: "Select", // 自定义图标
            type: "info",
            duration: 3000,
            offset: 50
          });

        }
      });
    }
  });

};
const getSetting = () => {

  loading.value = true;
  fetchSettingGet({
    userId: userStore.getUserInfo?.user?.id
  }).then((res: Http.Response<any>) => {
    if (res.code === 200) {
      // formData.languageCode = res.data.languageCode;
      // formData.languageName = res.data.languageName;
      formData.questionNum = res.data.questionNum;
      formData.accuracy = res.data.accuracy;
      formData.gameTime = res.data.gameTime;
    }
  }).finally(() => loading.value = false);
};


const rules = reactive<FormRules>({
  questionNum: [
    { required: true, message: i18n.t("setting.required"), trigger: ["change", "blur"] },
    { validator: isPositiveInteger(i18n.t), trigger: ["change", "blur"] }],
  accuracy: [
    {
      validator: isPositiveInteger(i18n.t),
      trigger: ["change", "blur"]
    },
    {
      required: true,
      message: i18n.t("setting.required"),
      trigger: ["change", "blur"]
    } ],
  gameTime: [{ validator: isPositiveInteger(i18n.t), trigger: ["change", "blur"] }, {
    required: true,
    message: i18n.t("setting.required"),
    trigger: ["change", "blur"]
  } ]
});
onMounted(getSetting);
</script>


<style scoped lang="scss">
@import "@/theme";

.setting-wrapper {
  position: relative;
  padding: 0 20px;
  display: flex;
  justify-content: flex-start;

  .form-wrapper {

    position: relative;
    display: inline-block;
    :deep(.el-input-number--large){
      width: 100%;
    }
    .padding-left:deep(.el-input__inner) {
      padding-left: 5px;
    }
  }
}
</style>

