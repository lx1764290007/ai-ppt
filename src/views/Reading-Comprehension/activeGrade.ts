import { ref } from "vue";

export const activeGrade = ref<number>();
export const setActiveGrade = (id: number): void => {
  activeGrade.value = id;
}