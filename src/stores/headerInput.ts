import { ref } from "vue";
import { defineStore } from "pinia";
import type {HeaderInput} from "@/interface/HeaderInput";
import { useUserInfoStore } from "@/stores/user";
import type { Grade } from "@/interface/Grade";


export const useHeaderInputStore = defineStore("headerInput", () => {
  const inputData = ref<HeaderInput.Data>({
    grade: undefined,
    subjectName: undefined
  });
  const useUserInfo = useUserInfoStore();
  const gamePageGrade = ref<number|undefined>(useUserInfo.userInfo?.grade?.[0]?.id);

  const setData = (data: HeaderInput.Data) => {
    inputData.value = data;
  }
  return {inputData, setData,gamePageGrade}
});
