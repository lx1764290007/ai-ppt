

export default {
  directives: {
    clickOutside: {
      mounted(el:any, binding:any) {
        el.clickOutsideEvent = (event:any) => {
          // 如果点击的元素不是当前元素也不是其子元素，则调用绑定的回调函数
          if (!(el === event.target || el.contains(event.target))) {
            // 这里调用传递给指令的回调函数
            binding.value(event);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      beforeUnmount(el:any) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
};