import { ref, reactive } from "vue";
import type { Ref, UnwrapRef } from "vue";


type Open = (T: Attrs) => void
type Close = () => void


export const useAlert: () => [Open, Close, Ref<UnwrapRef<boolean>>, Attrs] = () => {
  const value = ref(false);
  const config: Attrs = reactive({
    title: "...",
    type: "success"
  });
  const autoClose = () => {
    setTimeout(() => {
      value.value = false;
    }, 2300);
  };
  const open: Open = (conf: Attrs) => {
    if (value.value) return;
    value.value = true;
    config.title = conf.title;
    config.type = conf.type;
    config.effect = conf.effect;
    autoClose();
  };
  const close: Close = () => {
    if (!value.value) return;
    value.value = false;
  };
  return [open, close, value, config];
};
