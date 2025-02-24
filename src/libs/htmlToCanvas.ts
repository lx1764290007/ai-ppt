import html2canvas from "html2canvas";

export const h5ToCanvas = (target:HTMLElement) => {
  const WIDTH:number = target.getBoundingClientRect().width, HEIGHT = target.getBoundingClientRect().height, CANVAS_ID='canvas_template';
  return new Promise<string|PromiseRejectedResult>((resolve, reject) => {
    html2canvas(target as HTMLElement,{
      useCORS: true,
      backgroundColor: '#ffffff', // 一定要添加背景颜色，否则出来的图片，背景全部都是透明的
      scale: 2
    }).then((canvas: any) => {
      const imgWidth = WIDTH * 2;  // 将宽度加倍
      const imgHeight = HEIGHT * 2; // 将高度加倍
      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('id', CANVAS_ID);
      newCanvas.width = imgWidth;
      newCanvas.height = imgHeight;
      const ctx = newCanvas.getContext('2d');
      let res = "";
      if(ctx){
        // 生成高分辨率图像
        ctx.drawImage(canvas, 0, 0, imgWidth, imgHeight);
        res =  newCanvas.toDataURL("image/png");
      } else {
        res = canvas.toDataURL("image/png");
      }
      resolve(res);
    }).catch(err=>{
      reject(err);
    }).finally(()=>{

      const removeTarget =  document.getElementById(CANVAS_ID);

      if(removeTarget){
        document.body.removeChild(removeTarget as HTMLElement);
      }
    })
  })
  }