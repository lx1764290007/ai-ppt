/**
 * 防抖
 * @param func callback
 * @param wait 等待时间 ms
 * @param immediate 是否立即执行一次
 */

export const useDebounce = (func: () => void, wait: number, immediate: boolean = false) => {
  let timeout: any;
  const context: any = this;
  return function () {
    if (timeout) clearTimeout(timeout); // timeout 不为null
    if (immediate) {
      const callNow = !timeout; // 第一次会立即执行，以后只有事件执行后才会再次触发
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) {
        func && func.apply(context);
      }
    } else {
      timeout = setTimeout(function () {
        func && func();
      }, wait);
    }
  };
};
